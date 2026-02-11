// Banned or unbanned user

import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppErrors";

// get all users

const getAllUser = async () => {
  const result = await prisma.user.findMany({
    include: {
      tutorProfiles: {
        include: {
          education: true,
          availabilities: true,
          tutorTimeSlots: true,

          // bookings received as tutor
          bookings: {
            include: {
              student: true,
              subject: true,
            },
          },

          //  reviews received as tutor
          reviews: {
            include: {
              student: true,
            },
          },

          subjects: {
            include: {
              subject: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
      },

      //  bookings made as student
      bookings: {
        include: {
          tutorProfile: true,
          subject: true,
        },
      },

      // reviews written as student
      reviews: true,
    },
  });

  return result;
};

// Banned or unbanned user

const updateUserStatus = async (id: string, status: UserStatus) => {
  if (!id) {
    throw new AppError(
      400,
      "User id is required to update status.",
      "Missing User id",
      [
        {
          field: "Update User status",
          message: "Please give User id.",
        },
      ],
    );
  }

  const isExistUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      status: true,
    },
  });

  if (!isExistUser) {
    throw new AppError(404, "No user found with this id.", "Invalid_User_Id", [
      {
        field: "Update User Status",
        message: "Please provide a valid user id.",
      },
    ]);
  }

  if (isExistUser?.status === status) {
    throw new AppError(
      400,
      "User status is already update.",
      "User_already_updated",
      [
        {
          field: "Update user status",
          message: "Already updated user.",
        },
      ],
    );
  }

  const result = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      status: status,
    },
  });

  return result;
};

// update tutor feature

const featureTutor = async (id: string, isFeatured: boolean) => {
  if (!id) {
    throw new AppError(
      400,
      "User id is required to update feature tutor.",
      "Missing tutor id",
      [
        {
          field: "Update User status",
          message: "Please give User id.",
        },
      ],
    );
  }

  const isExistUser = await prisma.tutorProfile.findUnique({
    where: {
      id: id,
    },
    select: {
      isFeatured: true,
    },
  });

  if (!isExistUser) {
    throw new AppError(
      404,
      "No tutor profile found with this id.",
      "Invalid_User_Id",
      [
        {
          field: "Update User Status",
          message: "Please provide a valid user id.",
        },
      ],
    );
  }

  const result = await prisma.tutorProfile.update({
    where: {
      id: id,
    },
    data: {
      isFeatured: isFeatured,
    },
  });

  return result;
};

export const adminService = {
  updateUserStatus,
  getAllUser,
  featureTutor,
};
