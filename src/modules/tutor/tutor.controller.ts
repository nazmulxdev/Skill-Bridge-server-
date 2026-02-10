import { Request, Response } from "express";
import AppResponse from "../../utils/AppResponse";
import AppError from "../../utils/AppErrors";
import catchAsync from "../../utils/catchAsync";
import { Role } from "../../../generated/prisma/enums";
import { tutorService } from "./tutor.service";

// getting all tutors

// const getAllTutor = async (req: Request, res: Response) => {
//   throw new AppError(400, "Please give valid Error", "USER_NOT_FOUND", [
//     { field: "email", message: "Email is not valid" },
//   ]);
//   AppResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: "This is from get all tutor route.",
//   });
// };

// create tutor profile (hourly rate)

const createTutorProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req?.user?.id;
  const role = req?.user?.role;
  const { hourlyRate } = req?.body;

  if (typeof userId !== "string") {
    throw new AppError(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor profile creation",
        message: "Please give valid type of id.",
      },
    ]);
  }
  if (typeof hourlyRate !== "number") {
    throw new AppError(
      400,
      "Invalid hourly rate type",
      "Invalid_HourlyRate_Type",
      [
        {
          field: "Tutor profile creation",
          message: "Please give valid type of hourly rate.",
        },
      ],
    );
  }

  if (role !== Role.TUTOR) {
    throw new AppError(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor profile creation",
          message: "Only tutor role can create tutor profile.",
        },
      ],
    );
  }

  const result = await tutorService.createTutorProfile({
    userId,
    hourlyRate,
  });

  console.log(result);

  return AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Tutor profile created successfully.",
    data: result,
  });
});

// update tutor hourly rate

const updateHourlyRate = catchAsync(async (req: Request, res: Response) => {
  const userId = req?.user?.id;
  const role = req?.user?.role;
  const { hourlyRate } = req?.body;

  if (typeof userId !== "string") {
    throw new AppError(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Hourly rate update.",
        message: "Please give valid type of id.",
      },
    ]);
  }
  if (typeof hourlyRate !== "number") {
    throw new AppError(
      400,
      "Invalid hourly rate type",
      "Invalid_HourlyRate_Type",
      [
        {
          field: "Tutor Hourly rate update.",
          message: "Please give valid type of hourly rate.",
        },
      ],
    );
  }

  if (role !== Role.TUTOR) {
    throw new AppError(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor hourly rate update.",
          message: "Only tutor role can create tutor profile.",
        },
      ],
    );
  }

  const result = await tutorService.updateTutorHourlyRate({
    userId,
    hourlyRate,
  });

  console.log(result);

  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tutor hourly rate update  successfully.",
    data: result,
  });
});

export const tutorController = {
  createTutorProfile,
  updateHourlyRate,
};
