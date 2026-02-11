// create booking

import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../utils/AppErrors";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { studentService } from "./student.service";
import AppResponse from "../../utils/AppResponse";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user?.id;
  const role = req.user?.role;
  const timeSlotId = req.params.id;
  const status = req.user?.role as UserStatus;
  const { subjectId } = req.body;

  if (status === UserStatus.BANNED) {
    throw new AppError(403, "Banned user", "Banned_User", [
      {
        field: "Book Time Slot.",
        message:
          "You are not eligible to book tutor slot. You have been banned by admin.",
      },
    ]);
  }
  if (typeof studentId !== "string") {
    throw new AppError(400, "Invalid student id type", "Invalid_Student_Id", [
      {
        field: "Book Time Slot.",
        message: "Please give valid type of id.",
      },
    ]);
  }
  if (typeof timeSlotId !== "string") {
    throw new AppError(
      400,
      "Invalid time slot id type",
      "Invalid_TimeSlot_Id",
      [
        {
          field: "Book Time Slot.",
          message: "Please give valid type of time slot id.",
        },
      ],
    );
  }

  if (role !== Role.STUDENT) {
    throw new AppError(
      403,
      "Only student can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Booking time slot.",
          message: "Only student can book time slot.",
        },
      ],
    );
  }

  const result = await studentService.createBooking(studentId, timeSlotId, {
    subjectId,
  });

  return AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

// cancel booking

const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const bookingId = req.params.id;

  if (typeof userId !== "string") {
    throw new AppError(400, "Invalid student id type", "Invalid_Student_Id", [
      {
        field: "Book Time Slot.",
        message: "Please give valid type of id.",
      },
    ]);
  }

  if (typeof bookingId !== "string") {
    throw new AppError(400, "Invalid booking id type", "Invalid_Booking_Id", [
      {
        field: "Cancel Booking slot.",
        message: "Please give valid type of booking id.",
      },
    ]);
  }

  if (role !== Role.STUDENT) {
    throw new AppError(
      403,
      "Only student can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Booking time slot.",
          message: "Only student can book time slot.",
        },
      ],
    );
  }

  const result = await studentService.cancelBooking(userId, bookingId);
  return AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Booking cancelled successfully",
    data: result,
  });
});

export const studentController = {
  createBooking,
  cancelBooking,
};
