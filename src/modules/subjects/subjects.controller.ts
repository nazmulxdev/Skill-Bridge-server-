// adding subject under category

import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../utils/AppErrors";
import { subjectsService } from "./subjects.service";
import AppResponse from "../../utils/AppResponse";

// add subjects

const addSubject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  if (typeof id !== "string") {
    throw new AppError(
      400,
      "Invalid category id type.",
      "Invalid_Category_Id_Type",
      [
        {
          field: "Add Subject.",
          message: "Please provide Valid type of  category_id.",
        },
      ],
    );
  }

  const result = await subjectsService.addSubject({ category_id: id, name });

  console.log(result);

  return AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Subject added successfully.",
    data: result,
  });
});

// get all subjects

const getAllSubjects = catchAsync(async (req: Request, res: Response) => {
  const result = await subjectsService.getAllSubjects();

  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "All subjects retrieve successfully.",
    data: result,
  });
});

// update subject

const updateSubjectName = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    throw new AppError(400, "Subject Id type error", "Error_id_type", [
      {
        field: "Update Subject",
        message: "Please give valid type  subject id.",
      },
    ]);
  }

  const result = await subjectsService.updateSubject(id, req.body.name);

  console.log(result);
  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Subject updated successfully.",
    data: result,
  });
});

export const subjectController = {
  addSubject,
  getAllSubjects,
  updateSubjectName,
};
