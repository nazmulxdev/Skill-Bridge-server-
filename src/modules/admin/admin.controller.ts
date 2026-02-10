// update user status

import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../utils/AppErrors";
import { adminService } from "./admin.service";
import AppResponse from "../../utils/AppResponse";

// get all user

const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const result = await adminService.getAllUser();

  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "All user retrieve successfully.",
    data: result,
  });
});

// update user status

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (typeof id !== "string") {
    throw new AppError(400, "User id types error", "Invalid_User_id", [
      {
        field: "Update user status.",
        message: "Please give valid type of user id.",
      },
    ]);
  }

  const result = await adminService.updateUserStatus(id, status);

  console.log(result);

  return AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "User status updated successfully.",
    data: result,
  });
});

// update feature tutor

const featureTutor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isFeatured } = req.body;

  if (typeof id !== "string") {
    throw new AppError(400, "Tutor id types error", "Invalid_Tutor_id", [
      {
        field: "Feature Tutor.",
        message: "Please give valid type of Tutor id.",
      },
    ]);
  }

  if (typeof isFeatured !== "boolean") {
    throw new AppError(400, "Invalid feature flag", "Invalid_isFeatured", [
      {
        field: "Feature Tutor",
        message: "isFeatured must be a boolean value.",
      },
    ]);
  }

  const result = await adminService.featureTutor(id, isFeatured);

  console.log(result);

  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Updated feature tutor status successfully.",
    data: result,
  });
});

export const adminController = {
  updateUser,
  getAllUser,
  featureTutor,
};
