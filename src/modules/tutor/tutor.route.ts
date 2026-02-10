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

router.post(
  "/availabilities",
  authMiddleware("TUTOR"),
  tutorController.addAvailability,
);

router.patch(
  "/availabilities/:id",
  authMiddleware("TUTOR"),
  tutorController.updateAvailability,
);

router.delete(
  "/availabilities/:id",
  authMiddleware("TUTOR"),
  tutorController.deleteAvailability,
);

router.post(
  "/time-slot",
  authMiddleware("TUTOR"),
  tutorController.createTutorTimeSlot,
);

export const tutorRoutes = router;
