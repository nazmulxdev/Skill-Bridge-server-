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

router.post(
  "/subjects",
  authMiddleware("TUTOR"),
  tutorController.addTutorSubjects,
);

router.delete(
  "/subjects/:subjectId",
  authMiddleware("TUTOR"),
  tutorController.removeTutorSubject,
);

router.post(
  "/education",
  authMiddleware("TUTOR"),
  tutorController.addEducation,
);

router.patch(
  "/education/:id",
  authMiddleware("TUTOR"),
  tutorController.updateEducation,
);
router.delete(
  "/education/:id",
  authMiddleware("TUTOR"),
  tutorController.deleteEducation,
);

export const tutorRoutes = router;
