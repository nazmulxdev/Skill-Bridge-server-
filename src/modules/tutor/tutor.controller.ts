import { Request, Response } from "express";
import AppResponse from "../../utils/AppResponse";
import AppError from "../../utils/AppErrors";
import catchAsync from "../../utils/catchAsync";
import { Role } from "../../../generated/prisma/enums";
import { tutorService } from "./tutor.service";
import { Education } from "../../../generated/prisma/client";

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

//  adding tutor subject

const addTutorSubjects = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const { subjects } = req.body;

  if (typeof userId !== "string") {
    throw new AppError(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor subjects addition.",
        message: "Please give valid type of id.",
      },
    ]);
  }

  if (role !== Role.TUTOR) {
    throw new AppError(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor Subjects.",
          message: "Only tutor role can add subjects in their table.",
        },
      ],
    );
  }

  if (!Array.isArray(subjects) || subjects.length === 0) {
    throw new AppError(
      400,
      "Subject ids must be a non-empty array.",
      "Invalid_Subject_List",
      [],
    );
  }

  const subjectIds = subjects.map((sub) => sub.subjectId);
  const uniqueId = [...new Set(subjectIds)];

  const result = await tutorService.addTutorSubjects(userId, uniqueId);

  console.log(result);

  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subject added successfully.",
    data: result,
  });
});

// remove tutor subject from table

const removeTutorSubject = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const { subjectId } = req.params;

  if (typeof userId !== "string") {
    throw new AppError(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor subject delete..",
        message: "Please give valid type of id.",
      },
    ]);
  }

  if (role !== Role.TUTOR) {
    throw new AppError(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor Subjects delete.",
          message: "Only tutor role can remove subjects in their table.",
        },
      ],
    );
  }

  if (typeof subjectId !== "string") {
    throw new AppError(400, "Invalid subject id type", "Invalid_Subject_Id", [
      {
        field: "Tutor subject delete..",
        message: "Please give valid type of id.",
      },
    ]);
  }

  const result = await tutorService.removeSubject(userId, subjectId);

  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subject removed successfully",
    data: result,
  });
});

// adding education of tutor

const addEducation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const { institute, degree, fieldOfStudy, startYear, endYear, isCurrent } =
    req.body as Education;

  if (typeof userId !== "string") {
    throw new AppError(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Education.",
        message: "Please give valid type of id.",
      },
    ]);
  }

  if (role !== Role.TUTOR) {
    throw new AppError(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor Education.",
          message: "Only tutor role can add education.",
        },
      ],
    );
  }

  if (!institute || !degree || !fieldOfStudy || !startYear) {
    throw new AppError(
      400,
      "Missing required fields",
      "Invalid_Education_Data",
      [
        {
          field: "Tutor Education",
          message:
            "institute, degree, fieldOfStudy, and startYear are required.",
        },
      ],
    );
  }

  const result = await tutorService.addEducation(userId, {
    institute,
    degree,
    fieldOfStudy,
    startYear,
    endYear,
    isCurrent: !!isCurrent,
  });

  return AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Education added successfully",
    data: result,
  });
});

// update tutor education

const updateEducation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const educationId = req.params.id;

  if (typeof userId !== "string") {
    throw new AppError(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Education.",
        message: "Please give valid type of id.",
      },
    ]);
  }
  if (typeof educationId !== "string") {
    throw new AppError(
      400,
      "Invalid education id type",
      "Invalid_Education_Id",
      [
        {
          field: "Tutor Education.",
          message: "Please give valid type of id.",
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
          field: "Tutor Education.",
          message: "Only tutor role can update education.",
        },
      ],
    );
  }

  const result = await tutorService.updateEducation(
    userId,
    educationId,
    req.body,
  );

  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Education updated successfully",
    data: result,
  });
});

// delete tutor education

const deleteEducation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const educationId = req.params.id;

  if (typeof userId !== "string") {
    throw new AppError(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Education.",
        message: "Please give valid type of id.",
      },
    ]);
  }
  if (typeof educationId !== "string") {
    throw new AppError(
      400,
      "Invalid education id type",
      "Invalid_Education_Id",
      [
        {
          field: "Tutor Education.",
          message: "Please give valid type of id.",
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
          field: "Tutor Education.",
          message: "Only tutor role can update education.",
        },
      ],
    );
  }

  const result = await tutorService.deleteEducation(userId, educationId);

  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Education deleted successfully",
    data: result,
  });
});

// add availability

const addAvailability = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const { dayOfWeek, startTime, endTime } = req.body;

  if (typeof userId !== "string") {
    throw new AppError(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Education.",
        message: "Please give valid type of id.",
      },
    ]);
  }

  if (role !== Role.TUTOR) {
    throw new AppError(
      403,
      "Only tutor can use this route",
      "Unauthorized_Access",
      [
        {
          field: "Tutor Education.",
          message: "Only tutor role can update education.",
        },
      ],
    );
  }

  if (!dayOfWeek || !startTime || !endTime) {
    throw new AppError(
      400,
      "Missing required fields",
      "Invalid_Availability_Data",
      [
        {
          field: "Availability",
          message: "dayOfWeek, startTime, endTime are required",
        },
      ],
    );
  }

  const result = await tutorService.addAvailability(userId, {
    dayOfWeek,
    startTime,
    endTime,
  });
  return AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Availability added successfully",
    data: result,
  });
});

// update availability

const updateAvailability = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const availabilityId = req.params.id;
  const payload = req.body;

  if (typeof userId !== "string") {
    throw new AppError(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Education.",
        message: "Please give valid type of id.",
      },
    ]);
  }
  if (!availabilityId || typeof availabilityId !== "string") {
    throw new AppError(
      400,
      "Invalid availability id type or missing availability id",
      "Invalid_Availability_Id",
      [
        {
          field: "Tutor Education.",
          message: "Please give valid type of id.",
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
          field: "Tutor Education.",
          message: "Only tutor role can update education.",
        },
      ],
    );
  }
  const result = await tutorService.updateAvailability(
    userId,
    availabilityId,
    payload,
  );

  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Availability updated successfully",
    data: result,
  });
});

// delete availability

const deleteAvailability = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const availabilityId = req.params.id;

  if (typeof userId !== "string") {
    throw new AppError(400, "Invalid user id type", "Invalid_User_Id", [
      {
        field: "Tutor Education.",
        message: "Please give valid type of id.",
      },
    ]);
  }
  if (!availabilityId || typeof availabilityId !== "string") {
    throw new AppError(
      400,
      "Invalid availability id type or missing availability id",
      "Invalid_Availability_Id",
      [
        {
          field: "Tutor Education.",
          message: "Please give valid type of id.",
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
          field: "Tutor Education.",
          message: "Only tutor role can update education.",
        },
      ],
    );
  }

  const result = await tutorService.deleteAvailability(userId, availabilityId);

  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Availability deleted successfully",
    data: result,
  });
});

export const tutorController = {
  createTutorProfile,
  updateHourlyRate,
  addTutorSubjects,
  removeTutorSubject,
  addEducation,
  updateEducation,
  deleteEducation,
  addAvailability,
  updateAvailability,
  deleteAvailability,
};
