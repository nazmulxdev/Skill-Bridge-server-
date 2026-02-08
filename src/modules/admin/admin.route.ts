import { Router } from "express";
import authMiddleware from "../../middlewares/authMiddleware";
import { adminController } from "./admin.controller";

const router = Router();

router.post("/", authMiddleware("ADMIN"), adminController.createCategory);

export const adminRoutes = router;
