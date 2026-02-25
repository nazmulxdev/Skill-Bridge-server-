import { Router } from "express";
import { publicController } from "./public.controller";

const router = Router();

router.get("/", publicController.getTutors);

router.get("/features", publicController.getAllFeaturedTutor);

router.get("/tutor/:id", publicController.getTutorById);

export const publicRoutes = router;
