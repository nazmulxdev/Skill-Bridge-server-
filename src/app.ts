import { toNodeHandler } from "better-auth/node";
import express, { NextFunction, Request, Response } from "express";
import { auth } from "./lib/auth";

import cors from "cors";
import { config } from "./config";
import { tutorRoutes } from "./modules/tutor/tutor.route";
import notFoundError from "./middlewares/notFoundError";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import catchAsync from "./utils/catchAsync";
import { adminRoutes } from "./modules/admin/admin.route";

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

// tutor api

app.use("/api/tutors", tutorRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to prisma land. Have a great journey with prisma.");
});

// category api

app.use("/api/categories", adminRoutes);

// 404 handler
app.use(notFoundError);

// global errors

app.use(globalErrorHandler);

export default app;
