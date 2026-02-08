import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware";
import { categoryController } from "./categories.controller";

const router = Router();

router.get("/", categoryController.getAllCategory);

router.post("/", authMiddleware("ADMIN"), categoryController.createCategory);

router.patch(
  "/:id",
  authMiddleware("ADMIN"),
  categoryController.updateCategory,
);

export const categoryRoutes = router;
