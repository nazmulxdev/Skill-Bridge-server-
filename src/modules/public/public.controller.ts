// get all featured tutor

import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { publicService } from "./public.service";
import AppResponse from "../../utils/AppResponse";
import AppError from "../../utils/AppErrors";
import paginationHelper from "../../utils/paginationHealper";

const getAllFeaturedTutor = catchAsync(async (req: Request, res: Response) => {
  const result = await publicService.getAllFeaturedTutor();

  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review featured tutor successfully",
    data: result,
  });
});

// get all data by search and filter

const getTutors = catchAsync(async (req: Request, res: Response) => {
  const { subject, rating, minPrice, maxPrice, category } = req.query;

  const search = typeof req.query.search === "string" ? req.query.search : "";
  const tutorRating = typeof rating === "string" ? Number(rating) : undefined;
  const tutorMinPrice =
    typeof minPrice === "string" ? Number(minPrice) : undefined;

  const tutorMaxPrice =
    typeof maxPrice === "string" ? Number(maxPrice) : undefined;

  const subjectCategory = typeof category === "string" ? category : undefined;

  console.log(subject);

  const { page, limit, skip } = paginationHelper(req.query);

  console.log({ page: page, limit: limit, skip: skip });

  const result = await publicService.getAllTutor({
    search,
    rating: tutorRating,
    minPrice: tutorMinPrice,
    maxPrice: tutorMaxPrice,
    category: subjectCategory,
    page,
    limit,
    skip,
  });

  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review featured tutor successfully",
    data: result,
  });
});

// get tutor by id

const getTutorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  console.log(id);

  if (typeof id !== "string") {
    throw new AppError(400, "User id types error", "Invalid_User_id", [
      {
        field: "Update user status.",
        message: "Please give valid type of user id.",
      },
    ]);
  }

  const result = await publicService.getTutorById(id);

  console.log(result);

  return AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tutor retrieve successfully.",
    data: result,
  });
});

export const publicController = {
  getAllFeaturedTutor,
  getTutors,
  getTutorById,
};
