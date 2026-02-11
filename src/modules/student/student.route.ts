import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware";
import { studentController } from "./student.controller";

const router = Router();

router.post(
  "/bookings/:id",
  authMiddleware("STUDENT"),
  studentController.createBooking,
);

router.patch(
  "/bookings/cancel/:id",
  authMiddleware("STUDENT"),
  studentController.cancelBooking,
);

export const studentRoutes = router;
