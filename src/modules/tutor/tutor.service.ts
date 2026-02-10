// create tutor profile

import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppErrors";

const createTutorProfile = async (payload: {
  userId: string;
  hourlyRate: number;
}) => {
  if (!payload.hourlyRate || payload.hourlyRate <= 0) {
    throw new AppError(
      400,
      "Hourly rate must be greater than zero.",
      "Invalid_Hourly_Rate",
      [
        {
          field: "Tutor profile create.",
          message: "Please provide a valid hourly rate.",
        },
      ],
    );
  }

  const isExistUser = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    select: {
      status: true,
      role: true,
      tutorProfiles: true,
    },
  });

  console.log(isExistUser);

  if (!isExistUser) {
    throw new AppError(404, "No user found with this id.", "Invalid_User_Id", [
      {
        field: "Tutor profile create.",
        message: "Please provide a valid user id.",
      },
    ]);
  }
  if (isExistUser.tutorProfiles) {
    throw new AppError(
      409,
      "Tutor profile already exists.",
      "Tutor_Profile_Exists",
      [
        {
          field: "Tutor profile create.",
          message:
            "You have already created tutor profile. You can update your profile.",
        },
      ],
    );
  }

  const result = await prisma.tutorProfile.create({
    data: {
      userId: payload.userId,
      hourlyRate: payload.hourlyRate,
    },
  });

  return result;
};

// update tutor hourly rate

const updateTutorHourlyRate = async (payload: {
  userId: string;
  hourlyRate: number;
}) => {
  if (!payload.hourlyRate || payload.hourlyRate <= 0) {
    throw new AppError(
      400,
      "Hourly rate must be greater than zero.",
      "Invalid_Hourly_Rate",
      [
        {
          field: "Tutor Hourly rate update.",
          message: "Please provide a valid hourly rate.",
        },
      ],
    );
  }

  const isExistUser = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    select: {
      status: true,
      role: true,
      tutorProfiles: true,
    },
  });

  console.log(isExistUser);

  if (!isExistUser) {
    throw new AppError(404, "No user found with this id.", "Invalid_User_Id", [
      {
        field: "Tutor hourly rate update.",
        message: "Please provide a valid user id.",
      },
    ]);
  }
  if (!isExistUser.tutorProfiles) {
    throw new AppError(
      409,
      "Tutor profile currently not exists.",
      "Tutor_Profile_Not_Exists",
      [
        {
          field: "Tutor hourly rate update.",
          message:
            "You have not created any tutor profile. Please, create tutor profile first.",
        },
      ],
    );
  }

  const result = await prisma.tutorProfile.update({
    where: {
      userId: payload.userId,
      id: isExistUser.tutorProfiles.id,
    },
    data: {
      hourlyRate: payload.hourlyRate,
    },
  });

  return result;
};

export const tutorService = {
  createTutorProfile,
  updateTutorHourlyRate,
};
