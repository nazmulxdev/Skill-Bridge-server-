// create tutor profile

import {
  BookingStatus,
  DayOfWeek,
  UserStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppErrors";

export interface Education {
  institute: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear?: number | null;
  isCurrent?: boolean;
}
export interface UpdateEducation {
  institute?: string;
  degree?: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number | null;
  isCurrent?: boolean;
}

export interface AvailabilityPayload {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export const isValidTimeFormat = (time: string): boolean => {
  // 24-hour format
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
};

export const isValidTimeRange = (
  startTime: string,
  endTime: string,
): boolean => {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);

  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return false;
  }

  return start < end;
};

export const timeToMinutes = (time: string): number => {
  const match = time.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    throw new AppError(400, "Invalid time format", "INVALID_TIME_FORMAT", [
      { field: "time", message: "Use HH:mm (00:00–23:59)" },
    ]);
  }

  const [, h, m] = match;
  return Number(h) * 60 + Number(m);
};

export const getDayOfWeek = (date: Date): DayOfWeek => {
  const map: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return map[date.getUTCDay()] as DayOfWeek;
};

// creating tutor profile
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

// removing subject

const removeSubject = async (userId: string, subjectId: string) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!tutorProfile) {
    throw new AppError(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Delete subject of tutor",
          message: "Please user tutor profile to delete subject.",
        },
      ],
    );
  }

  const tutorSubject = await prisma.tutorSubject.findFirst({
    where: {
      tutor_profileId: tutorProfile.id,
      subjectId: subjectId,
    },
  });

  if (!tutorSubject) {
    throw new AppError(
      404,
      "Subject not found in your profile",
      "Subject_Not_Assigned",
      [
        {
          field: "Delete subject of tutor",
          message: "Subject is not exist in your profile.",
        },
      ],
    );
  }

  const bookingExists = await prisma.bookings.findFirst({
    where: {
      tutorProfileId: tutorProfile.id,
      subjectId,
    },
  });

  if (bookingExists?.status == BookingStatus.CONFIRM) {
    throw new AppError(
      409,
      "Subject cannot be removed due to active bookings",
      "Subject_In_Use",
      [
        {
          field: "Delete subject of tutor.",
          message: "There is an active booking agreement",
        },
      ],
    );
  }

  const result = await prisma.tutorSubject.delete({
    where: {
      id: tutorSubject.id,
    },
  });

  return result;
};

// adding tutor education

const addEducation = async (userId: string, payload: Education) => {
  if (payload.endYear && payload.startYear > payload.endYear) {
    throw new AppError(
      400,
      "startYear cannot be greater than endYear",
      "Invalid_Education_Years",
    );
  }
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!tutorProfile) {
    throw new AppError(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor education",
          message: "Please user tutor profile add education.",
        },
      ],
    );
  }

  const result = await prisma.education.create({
    data: {
      tutorProfileId: tutorProfile.id,
      ...payload,
    },
  });

  return result;
};

// update education

const updateEducation = async (
  userId: string,
  educationId: string,
  payload: UpdateEducation,
) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!tutorProfile) {
    throw new AppError(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor education Update",
          message: "Please user tutor profile to update education.",
        },
      ],
    );
  }

  const education = await prisma.education.findUnique({
    where: {
      id: educationId,
    },
  });

  if (!education || education.tutorProfileId !== tutorProfile.id) {
    throw new AppError(
      404,
      "Education not found for this tutor of this id",
      "Education_Not_found",
      [
        {
          field: "Tutor education update",
          message: "Please use valid education profile id. ",
        },
      ],
    );
  }

  const result = await prisma.education.update({
    where: {
      id: educationId,
    },
    data: payload,
  });

  return result;
};

// delete education

const deleteEducation = async (userId: string, educationId: string) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!tutorProfile) {
    throw new AppError(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor education Delete",
          message: "Please user tutor profile to delete education.",
        },
      ],
    );
  }

  const education = await prisma.education.findUnique({
    where: {
      id: educationId,
    },
  });

  if (!education || education.tutorProfileId !== tutorProfile.id) {
    throw new AppError(
      404,
      "Education not found for this tutor",
      "Education_Not_found",
      [
        {
          field: "Tutor education Delete",
          message: "Please use valid education profile id. ",
        },
      ],
    );
  }

  const result = await prisma.education.delete({
    where: {
      id: educationId,
    },
  });

  return result;
};

// tutor availability
const addAvailability = async (
  userId: string,
  payload: AvailabilityPayload,
) => {
  if (!isValidTimeRange(payload.startTime, payload.endTime)) {
    throw new AppError(
      400,
      "Invalid time format or range",
      "Invalid_Time_Range",
      [
        {
          field: "time",
          message:
            "Time must be in HH:mm format (e.g. 10:00) and startTime must be earlier than endTime",
        },
      ],
    );
  }

  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!tutorProfile) {
    throw new AppError(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor Availability",
          message: "Please user tutor profile to add availabilities.",
        },
      ],
    );
  }

  const result = await prisma.availability.create({
    data: {
      tutorProfileId: tutorProfile.id,
      ...payload,
    },
  });
  return result;
};

// update availability

const updateAvailability = async (
  userId: string,
  availabilityId: string,
  payload: Partial<AvailabilityPayload>,
) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!tutorProfile) {
    throw new AppError(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor Availability",
          message: "Please user tutor profile to update availability.",
        },
      ],
    );
  }

  const availability = await prisma.availability.findUnique({
    where: {
      id: availabilityId,
    },
  });

  if (!availability || availability.tutorProfileId !== tutorProfile.id) {
    throw new AppError(
      404,
      "Availability not found for this tutor",
      "Availability_Not_Found",
      [
        {
          field: "Tutor Availability",
          message: "Tutor availability not found on this id..",
        },
      ],
    );
  }

  const finalStartTime = payload.startTime ?? availability.startTime;
  const finalEndTime = payload.endTime ?? availability.endTime;

  if (!isValidTimeRange(finalStartTime, finalEndTime)) {
    throw new AppError(400, "Invalid time range", "Invalid_Time_Range", [
      {
        field: "time",
        message: "startTime must be earlier than endTime",
      },
    ]);
  }

  const result = await prisma.availability.update({
    where: {
      id: availabilityId,
    },
    data: payload,
  });

  return result;
};

// delete user availability

const deleteAvailability = async (userId: string, availabilityId: string) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!tutorProfile) {
    throw new AppError(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor Availability",
          message: "Please user tutor profile to update availability.",
        },
      ],
    );
  }

  const availability = await prisma.availability.findUnique({
    where: {
      id: availabilityId,
    },
  });

  if (!availability || availability.tutorProfileId !== tutorProfile.id) {
    throw new AppError(
      404,
      "Availability not found for this tutor",
      "Availability_Not_Found",
      [
        {
          field: "Tutor Availability",
          message: "Tutor availability not found on this id..",
        },
      ],
    );
  }

  const result = await prisma.availability.delete({
    where: {
      id: availabilityId,
    },
  });

  return result;
};

// create tutor time slot

const createTutorTimeSlot = async (
  userId: string,
  payload: {
    date: Date;
    startTime: string;
    endTime: string;
  },
) => {
  const slotDate =
    typeof payload.date === "string" ? new Date(payload.date) : payload.date;

  if (isNaN(slotDate.getTime())) {
    throw new AppError(400, "Invalid date format", "INVALID_DATE", [
      {
        field: "date",
        message: "Date must be a valid ISO date string (YYYY-MM-DD)",
      },
    ]);
  }

  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!tutorProfile) {
    throw new AppError(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor Time slot ",
          message: "Please user tutor profile to create time slot.",
        },
      ],
    );
  }

  const slotStart = timeToMinutes(payload.startTime);
  const slotEnd = timeToMinutes(payload.endTime);

  if (slotStart >= slotEnd) {
    throw new AppError(400, "Invalid time range", "Invalid_Time_Range", [
      {
        field: "time",
        message: "startTime must be earlier than endTime",
      },
    ]);
  }

  const dayOfWeek = getDayOfWeek(slotDate);
  console.log(dayOfWeek);
  const availabilities = await prisma.availability.findMany({
    where: {
      tutorProfileId: tutorProfile.id,
      dayOfWeek,
    },
  });

  if (availabilities.length === 0) {
    throw new AppError(
      404,
      "Availability not found for this tutor",
      "Availability_Not_Found",
      [
        {
          field: "Tutor Time slot",
          message: `Tutor availability not found for this ${payload.date} date (${dayOfWeek}).`,
        },
      ],
    );
  }

  const fitsAvailability = availabilities.some((a) => {
    const availStart = timeToMinutes(a.startTime);
    const availEnd = timeToMinutes(a.endTime);

    return slotStart >= availStart && slotEnd <= availEnd;
  });

  if (!fitsAvailability) {
    throw new AppError(
      400,
      "Time slot outside availability",
      "OUTSIDE_AVAILABILITY",
      [
        {
          field: "Tutor Time slot",
          message: `Tutor availability time is not exist from ${payload.startTime} to ${payload.endTime} on this ${payload.date} date (${dayOfWeek}).`,
        },
      ],
    );
  }

  const overlappingSlot = await prisma.tutorTimeSlot.findFirst({
    where: {
      tutorProfileId: tutorProfile.id,
      date: slotDate,
      NOT: {
        OR: [
          { endTime: { lte: payload.startTime } },
          { startTime: { gte: payload.endTime } },
        ],
      },
    },
  });

  if (overlappingSlot) {
    throw new AppError(
      409,
      "Time slot overlaps with existing slot",
      "SLOT_OVERLAP",
      [
        {
          field: "Tutor Time slot",
          message: `There is also an exist slot between this time ${payload.startTime} to ${payload.endTime} on this ${payload.date} date (${dayOfWeek}).`,
        },
      ],
    );
  }

  const result = await prisma.tutorTimeSlot.create({
    data: {
      tutorProfileId: tutorProfile.id,
      date: slotDate,
      startTime: payload.startTime,
      endTime: payload.endTime,
    },
  });

  return result;
};

// update tutor time slot

const updateTimeSlot = async (
  userId: string,
  timeSlotId: string,
  payload: {
    date?: Date;
    startTime?: string;
    endTime?: string;
  },
) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!tutorProfile) {
    throw new AppError(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor Time slot ",
          message: "Please user tutor profile to update time slot.",
        },
      ],
    );
  }

  const existTimeSlot = await prisma.tutorTimeSlot.findUnique({
    where: {
      id: timeSlotId,
    },
  });

  if (!existTimeSlot || existTimeSlot.tutorProfileId !== tutorProfile.id) {
    throw new AppError(
      404,
      "Time Slot not found for this tutor",
      "TimeSlot_Not_Found",
      [
        {
          field: "Tutor Time Slot.",
          message: "Tutor Time slot not found for this id.",
        },
      ],
    );
  }

  const finalDate = payload.date ? new Date(payload.date) : existTimeSlot.date;

  const finalStartTime = payload.startTime ?? existTimeSlot.startTime;
  const finalEndTime = payload.endTime ?? existTimeSlot.endTime;

  if (isNaN(new Date(finalDate).getTime())) {
    throw new AppError(400, "Invalid date format", "INVALID_DATE", [
      {
        field: "date",
        message: "Date must be a valid ISO date string (YYYY-MM-DD)",
      },
    ]);
  }

  const slotStart = timeToMinutes(finalStartTime);
  const slotEnd = timeToMinutes(finalEndTime);

  if (slotStart >= slotEnd) {
    throw new AppError(400, "Invalid time range", "Invalid_Time_Range", [
      {
        field: "time",
        message: "startTime must be earlier than endTime",
      },
    ]);
  }

  const dayOfWeek = getDayOfWeek(new Date(finalDate));

  const availabilities = await prisma.availability.findMany({
    where: {
      tutorProfileId: tutorProfile.id,
      dayOfWeek,
    },
  });

  if (availabilities.length === 0) {
    throw new AppError(
      404,
      "Availability not found for this day",
      "Availability_Not_Found",
      [
        {
          field: "Tutor Time slot",
          message: `Tutor availability not found for this ${payload.date} date (${dayOfWeek}).`,
        },
      ],
    );
  }

  const fitsAvailability = availabilities.some((a) => {
    const availStart = timeToMinutes(a.startTime);
    const availEnd = timeToMinutes(a.endTime);

    return slotStart >= availStart && slotEnd <= availEnd;
  });

  if (!fitsAvailability) {
    throw new AppError(
      400,
      "Time slot outside availability",
      "OUTSIDE_AVAILABILITY",
      [
        {
          field: "Tutor Time slot",
          message: `Tutor availability time is not exist from ${payload.startTime} to ${payload.endTime} on this ${payload?.date} date (${dayOfWeek}).`,
        },
      ],
    );
  }

  const overlappingSlot = await prisma.tutorTimeSlot.findFirst({
    where: {
      tutorProfileId: tutorProfile.id,
      date: finalDate,
      id: { not: timeSlotId },
      NOT: {
        OR: [
          { endTime: { lte: finalStartTime } },
          { startTime: { gte: finalEndTime } },
        ],
      },
    },
  });

  if (overlappingSlot) {
    throw new AppError(
      409,
      "Time slot overlaps with existing slot",
      "SLOT_OVERLAP",
      [
        {
          field: "Tutor Time slot",
          message: `There is also an exist slot between this time ${payload?.startTime} to ${payload.endTime} on this ${payload.date} date (${dayOfWeek}).`,
        },
      ],
    );
  }

  const result = await prisma.tutorTimeSlot.update({
    where: { id: timeSlotId },
    data: {
      date: finalDate,
      startTime: finalStartTime,
      endTime: finalEndTime,
    },
  });

  return result;
};

// delete tutor time slot

const deleteTutorSlot = async (userId: string, timeSlotId: string) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!tutorProfile) {
    throw new AppError(
      404,
      "Tutor profile not found",
      "Tutor_Profile_Not_Found",
      [
        {
          field: "Tutor Time slot ",
          message: "Please user tutor profile to delete time slot.",
        },
      ],
    );
  }

  const existTimeSlot = await prisma.tutorTimeSlot.findUnique({
    where: {
      id: timeSlotId,
    },
  });

  if (!existTimeSlot || existTimeSlot.tutorProfileId !== tutorProfile.id) {
    throw new AppError(
      404,
      "Time Slot not found for this tutor",
      "TimeSlot_Not_Found",
      [
        {
          field: "Tutor Time Slot.",
          message: "Tutor Time slot not found for this id.",
        },
      ],
    );
  }

  if (existTimeSlot.isBooked) {
    throw new AppError(
      409,
      "Time slot already booked",
      "TimeSlot_Already_Booked",
      [
        {
          field: "Tutor Time Slot",
          message:
            "You cannot delete this time slot because it has an active booking.",
        },
      ],
    );
  }

  const result = await prisma.tutorTimeSlot.delete({
    where: {
      id: timeSlotId,
    },
  });

  return result;
};

// confirm booking

const confirmBooking = async (userId: string, bookingId: string) => {
  const booking = await prisma.bookings.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      tutorProfile: {
        include: {
          user: true,
        },
      },
      student: true,
    },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found", "Booking_Not_Found", [
      {
        field: "Confirm Booking",
        message: "Please user proper booking id to confirm.",
      },
    ]);
  }
  if (booking.status !== BookingStatus.PENDING) {
    throw new AppError(
      404,
      "Only pending booking can be confirm",
      "INVALID_BOOKING_STATUS",
      [
        {
          field: "Confirm Booking",
          message: "Please user proper booking status to confirm.",
        },
      ],
    );
  }

  if (booking.tutorProfile.userId !== userId) {
    throw new AppError(
      403,
      "You are not allowed to confirm this booking",
      "NOT_AUTHORIZED",
    );
  }

  if (booking.tutorProfile.user.status === UserStatus.BANNED) {
    throw new AppError(403, "Tutor account is banned.", "ACCOUNT_BANNED", [
      {
        field: "Authentication",
        message:
          "You are not allowed to access the system. Please contact support.",
      },
    ]);
  }

  if (booking.student.status === UserStatus.BANNED) {
    throw new AppError(403, "Student account is banned.", "ACCOUNT_BANNED", [
      {
        field: "Authentication",
        message: "This student has been banned by admin.",
      },
    ]);
  }

  const updatedBooking = await prisma.bookings.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CONFIRM },
  });

  return updatedBooking;
};

// complete bookings

const completeBooking = async (userId: string, bookingId: string) => {
  const booking = await prisma.bookings.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      tutorProfile: {
        include: { user: true },
      },
      student: true,
    },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found", "Booking_Not_Found", [
      {
        field: "Complete Booking",
        message: "Please user proper booking id to complete.",
      },
    ]);
  }
  if (booking.status !== BookingStatus.CONFIRM) {
    throw new AppError(
      404,
      "Only confirm booking can be complete",
      "INVALID_BOOKING_STATUS",
      [
        {
          field: "Confirm Booking",
          message: "Please user proper booking status to complete booking.",
        },
      ],
    );
  }

  if (booking.tutorProfile.userId !== userId) {
    throw new AppError(
      403,
      "You are not allowed to confirm this booking",
      "NOT_AUTHORIZED",
    );
  }

  if (booking.tutorProfile.user.status === UserStatus.BANNED) {
    throw new AppError(403, "Tutor account is banned.", "ACCOUNT_BANNED", [
      {
        field: "Authentication",
        message:
          "You are not allowed to access the system. Please contact support.",
      },
    ]);
  }

  if (booking.student.status === UserStatus.BANNED) {
    throw new AppError(403, "Student account is banned.", "ACCOUNT_BANNED", [
      {
        field: "Authentication",
        message: "This student has been banned by admin.",
      },
    ]);
  }

  const updatedBooking = await prisma.bookings.update({
    where: { id: bookingId },
    data: { status: BookingStatus.COMPLETE },
  });

  return updatedBooking;
};

export const tutorService = {
  createTutorProfile,
  updateTutorHourlyRate,
  addTutorSubjects,
  removeSubject,
  addEducation,
  updateEducation,
  deleteEducation,
  addAvailability,
  updateAvailability,
  deleteAvailability,
  createTutorTimeSlot,
  updateTimeSlot,
  deleteTutorSlot,
  confirmBooking,
  completeBooking,
};
