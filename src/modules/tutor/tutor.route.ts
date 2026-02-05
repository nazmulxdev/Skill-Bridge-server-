import { Request, Response, Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware";
import catchAsync from "../../utils/catchAsync";
import { tutorController } from "./tutor.controller";

const router = Router();

router.get(
  "/",
  authMiddleware("TUTOR"),
  catchAsync(tutorController.getAllTutor),
);

export const tutorRoutes = router;
