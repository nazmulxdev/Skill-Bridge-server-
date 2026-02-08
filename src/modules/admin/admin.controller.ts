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

export const adminController = {
  updateUser,
  getAllUser,
};
