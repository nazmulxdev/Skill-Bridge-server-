// creating category

import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { Role } from "../../../generated/prisma/enums";
import AppError from "../../utils/AppErrors";
import { adminService } from "./admin.service";
import AppResponse from "../../utils/AppResponse";

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

  const result = await adminService.createCategory({ name, description });
  console.log(result);
  AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully.",
    data: result,
  });
});

export const adminController = {
  createCategory,
};
