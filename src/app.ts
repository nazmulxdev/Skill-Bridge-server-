import { toNodeHandler } from "better-auth/node";
import express, { NextFunction, Request, Response } from "express";
import { auth } from "./lib/auth";

import cors from "cors";
import { config } from "./config";
import { tutorRoutes } from "./modules/tutor/tutor.route";
import notFoundError from "./middlewares/notFoundError";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import { adminRoutes } from "./modules/admin/admin.route";
import { categoryRoutes } from "./modules/categories/categories.route";
import { subjectsRoutes } from "./modules/subjects/subjects.route";
import { studentRoutes } from "./modules/student/student.route";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [config.frontend_url!, config.backend_url!],
    credentials: true,
  }),
);

// better auth api
app.all(
  "/api/auth/*splat",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await toNodeHandler(auth)(req, res);
    } catch (err) {
      next(err);
    }
  },
);

// student api

app.use("/api/students", studentRoutes);

// tutor api

app.use("/api/tutors", tutorRoutes);

// category api

app.use("/api/categories", categoryRoutes);

// subject api

app.use("/api/subjects", subjectsRoutes);

// admin api

app.use("/api/admin", adminRoutes);

// 404 handler
app.use(notFoundError);

// global errors

app.use(globalErrorHandler);

export default app;
