import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware";
import { tutorController } from "./tutor.controller";

const router = Router();

router.post("/", authMiddleware("TUTOR"), tutorController.createTutorProfile);

router.patch(
  "/update/hourly_rate",
  authMiddleware("TUTOR"),
  tutorController.updateHourlyRate,
);

export const tutorRoutes = router;
