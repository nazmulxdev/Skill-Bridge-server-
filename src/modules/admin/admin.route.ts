import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware";
import { adminController } from "./admin.controller";

const router = Router();

router.get("/users", authMiddleware("ADMIN"), adminController.getAllUser);

router.patch("/users/:id", authMiddleware("ADMIN"), adminController.updateUser);

router.patch(
  "/tutors/:id/feature",
  authMiddleware("ADMIN", "TUTOR"),
  adminController.featureTutor,
);

export const adminRoutes = router;
