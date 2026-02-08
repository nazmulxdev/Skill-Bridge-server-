// creating category

import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../utils/AppErrors";
import AppResponse from "../../utils/AppResponse";
import { categoryService } from "./categories.service";

// get all category

const getAllCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.getAllCategory();
  console.log(result);
  return AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully.",
    data: result,
  });
});

// create category

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { name, description } = req.body;

  if ((user?.role as Role) !== Role.ADMIN) {
    throw new AppError(401, "Invalid request.", "Invalid user role", [
      {
        field: "Create category.",
        message: "Only admin can create category.",
      },
    ]);
  }

  const result = await categoryService.createCategory({ name, description });
  console.log(result);
  return AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully.",
    data: result,
  });
});

// update category
const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    throw new AppError(400, "Category Id type error", "Error id type", [
      {
        field: "Update category",
        message: "Please give valid type  category id.",
      },
    ]);
  }

  const result = await categoryService.updateCategory(id, req.body);

  console.log(result);
  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category updated successfully.",
    data: result,
  });
});

// delete category

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (typeof id !== "string") {
    throw new AppError(400, "Category Id type error", "Error id type", [
      {
        field: "Update category",
        message: "Please give valid type  category id.",
      },
    ]);
  }

  const result = await categoryService.deleteCategory(id);

  console.log(result);
  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully.",
    data: result,
  });
});

export const categoryController = {
  createCategory,
  updateCategory,
  getAllCategory,
  deleteCategory,
};
