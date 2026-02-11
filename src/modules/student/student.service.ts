// creating bookings against tutor exist slot

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

    const existingBooking = await txx.bookings.findUnique({
      where: { timeSlotId },
    });

    if (existingBooking) {
      throw new AppError(409, "Slot already booked", "SLOT_ALREADY_BOOKED", [
        {
          field: "Tutor Time slot ",
          message: "Please  select another valid slot for booking time slot.",
        },
      ]);
    }

    const startTime = timeToMinutes(slot.startTime);
    const endTime = timeToMinutes(slot.endTime);

    const durationInHours = (endTime - startTime) / 60;
    const price = durationInHours * slot?.tutorProfile?.hourlyRate;

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

export const studentService = {
  createBooking,
};
