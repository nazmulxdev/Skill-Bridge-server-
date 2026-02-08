import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware";
import { subjectController } from "./subjects.controller";

const router = Router();

router.get("/", subjectController.getAllSubjects);

router.post("/:id", authMiddleware("ADMIN"), subjectController.addSubject);

router.patch(
  "/:id",
  authMiddleware("ADMIN"),
  subjectController.updateSubjectName,
);

router.delete("/:id", authMiddleware("ADMIN"), subjectController.deleteSubject);

export const subjectsRoutes = router;
