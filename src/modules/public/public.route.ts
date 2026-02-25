import { Router } from "express";
import { publicController } from "./public.controller";

const router = Router();

router.get("/", publicController.getTutors);

router.get("/features", publicController.getAllFeaturedTutor);

export const publicRoutes = router;
