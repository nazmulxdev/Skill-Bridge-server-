import { Request, Response } from "express";
import AppResponse from "../../utils/AppResponse";
import AppError from "../../utils/AppErrors";

const getAllTutor = async (req: Request, res: Response) => {
  throw new AppError(400, "Please give valid Error", "USER_NOT_FOUND", [
    { field: "email", message: "Email is not valid" },
  ]);
  AppResponse(res, {
    success: true,
    statusCode: 200,
    message: "This is from get all tutor route.",
  });
};

export const tutorController = {
  getAllTutor,
};
