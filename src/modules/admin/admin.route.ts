import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware";
import { adminController } from "./admin.controller";

const router = Router();

router.post("/", authMiddleware("ADMIN"), adminController.createCategory);

router.patch("/:id", authMiddleware("ADMIN"), adminController.updateCategory);

export const adminRoutes = router;
