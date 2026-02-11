// creating bookings against tutor exist slot

import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppErrors";
import { timeToMinutes } from "../tutor/tutor.service";

const createBooking = async (
  studentId: string,
  timeSlotId: string,
  payload: { subjectId: string },
) => {
  return prisma.$transaction(async (txx) => {
    const slot = await txx.tutorTimeSlot.findUnique({
      where: {
        id: timeSlotId,
      },
      include: {
        tutorProfile: true,
      },
    });

    if (!slot) {
      throw new AppError(
        404,
        "Tutor time slot not found",
        "Tutor_TimeSlot_Not_Found",
        [
          {
            field: "Tutor Time slot ",
            message: "Please use valid tutor time slot for booking time slot.",
          },
        ],
      );
    }
    if (slot.isBooked) {
      throw new AppError(
        409,
        "Tutor time slot already booked",
        "Tutor_TimeSlot_Already_Booked",
        [
          {
            field: "Tutor Time slot ",
            message: "Please try to book another slot.",
          },
        ],
      );
    }

    const isExistSubject = await txx.tutorSubject.findFirst({
      where: {
        tutor_profileId: slot.tutorProfileId,
        subjectId: payload.subjectId,
      },
    });

    if (!isExistSubject) {
      throw new AppError(
        400,
        "Tutor does not teach this subject",
        "Tutor_Does't_Teach_This_Subject",
        [
          {
            field: "Tutor Time slot ",
            message: "Please select valid subject for booking time slot.",
          },
        ],
      );
    }

    const existingBooking = await txx.bookings.findFirst({
      where: {
        timeSlotId,
        status: {
          in: [
            BookingStatus.PENDING,
            BookingStatus.CONFIRM,
            BookingStatus.COMPLETE,
          ],
        },
      },
    });

    if (existingBooking) {
      throw new AppError(
        409,
        "Slot already under booking process or booked or completed",
        "SLOT_ALREADY_BOOKING_PROCESS",
        [
          {
            field: "Tutor Time slot ",
            message: "Please  select another valid slot for booking time slot.",
          },
        ],
      );
    }

    const startTime = timeToMinutes(slot.startTime);
    const endTime = timeToMinutes(slot.endTime);

    const durationInHours = (endTime - startTime) / 60;

    const tutorHourlyRate = Number(slot?.tutorProfile?.hourlyRate);

    if (typeof tutorHourlyRate !== "number") {
      throw new AppError(400, "Invalid price type", "Invalid_Student_Id", [
        {
          field: "Book Time Slot.",
          message: "Please give valid type of tutor hourly rate.",
        },
      ]);
    }

    const price = durationInHours * tutorHourlyRate;

    const booking = await txx.bookings.create({
      data: {
        studentId: studentId,
        tutorProfileId: slot.tutorProfileId,
        subjectId: payload.subjectId,
        timeSlotId: timeSlotId,
        booking_price: price,
      },
    });

    await txx.tutorTimeSlot.update({
      where: {
        id: timeSlotId,
      },
      data: { isBooked: true },
    });
    return booking;
  });
};

// delete booking

const cancelBooking = async (userId: string, bookingId: string) => {
  return prisma.$transaction(async (txx) => {
    const booking = await txx.bookings.findUnique({
      where: {
        id: bookingId,
      },
      include: {
        timeSlot: true,
      },
    });

    if (!booking) {
      throw new AppError(404, "Booking not found.", "Booking_NOt_Found", [
        {
          field: "Booking slot",
          message: "Please  provide valid booking id.",
        },
      ]);
    }

    if (booking.studentId !== userId) {
      throw new AppError(403, "Unauthorized access", "UNAUTHORIZED", [
        {
          field: "Cancel Booking",
          message: "You are not authorized to cancel this booking slot",
        },
      ]);
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new AppError(
        400,
        "Booking already cancelled",
        "ALREADY_CANCELLED",
        [
          {
            field: "Cancel Booking",
            message: "You are not authorized to cancel this booking slot",
          },
        ],
      );
    }
    if (booking.status === BookingStatus.CONFIRM) {
      throw new AppError(
        400,
        "Booking has been confirmed by tutor.",
        "BOOKING_CONFIRMED",
        [
          {
            field: "Cancel Booking",
            message:
              "You are not authorized to cancel this booking slot because of tutor already confirmed this booking",
          },
        ],
      );
    }

    if (booking.status === BookingStatus.COMPLETE) {
      throw new AppError(
        400,
        "Completed booking cannot be cancelled",
        "CANNOT_CANCEL_COMPLETE",
        [
          {
            field: "Cancel Booking",
            message:
              "You are not authorized to cancel this booking slot because booking has already been completed.",
          },
        ],
      );
    }

    const result = await txx.bookings.update({
      where: {
        id: bookingId,
      },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });
    await txx.tutorTimeSlot.update({
      where: {
        id: booking.timeSlotId,
      },
      data: {
        isBooked: false,
      },
    });

    return result;
  });
};

export const studentService = {
  createBooking,
  cancelBooking,
};
