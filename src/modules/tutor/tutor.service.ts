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

// add subject in tutor subject

const addTutorSubjects = async (userId: string, subjectIds: string[]) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!tutorProfile) {
    throw new AppError(
      404,
      "Tutor profile not found",
      "Missing_tutor_profile",
      [
        {
          field: "Add tutor subject",
          message: "Please use authorized tutor id.",
        },
      ],
    );
  }

  console.log(tutorProfile);

  const validSubjects = await prisma.subjects.findMany({
    where: { id: { in: subjectIds } },
    select: {
      id: true,
    },
  });

  const validSubjectIds = validSubjects.map((sub) => sub.id);

  const invalidSubjectIds = subjectIds.filter(
    (id) => !validSubjectIds.includes(id),
  );

  if (invalidSubjectIds.length > 0) {
    throw new AppError(
      400,
      "Some subject ids are invalid.",
      "Invalid_Subject_Id",
      invalidSubjectIds.map((id) => ({
        field: "subjectId",
        message: `Invalid subject id: ${id}`,
      })),
    );
  }

  const existingSubjects = await prisma.tutorSubject.findMany({
    where: {
      tutor_profileId: tutorProfile.id,
      subjectId: { in: validSubjectIds },
    },
    select: {
      subjectId: true,
    },
  });
  const existingIds = existingSubjects.map((e) => e.subjectId);

  const newSubjectIds = validSubjectIds.filter(
    (id) => !existingIds.includes(id),
  );

  if (newSubjectIds.length === 0) {
    throw new AppError(
      409,
      "All subjects already added.",
      "Duplicate_Tutor_Subject",
      existingIds.map((id) => ({
        field: "subjectId",
        message: `Subject already added: ${id}`,
      })),
    );
  }
  const result = await prisma.tutorSubject.createMany({
    data: newSubjectIds.map((subjectId) => ({
      tutor_profileId: tutorProfile.id,
      subjectId,
    })),
    skipDuplicates: true,
  });

  return result;
};

export const tutorService = {
  createTutorProfile,
  updateTutorHourlyRate,
  addTutorSubjects,
};
