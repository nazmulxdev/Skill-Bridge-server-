// create booking

import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../utils/AppErrors";
import { Role } from "../../../generated/prisma/enums";
import { studentService } from "./student.service";
import AppResponse from "../../utils/AppResponse";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user?.id;
  const role = req.user?.role;
  const timeSlotId = req.params.id;
  const { subjectId } = req.body;

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

export const studentController = {
  createBooking,
};
