import { toNodeHandler } from "better-auth/node";
import express, { Request, Response } from "express";
import { auth } from "./lib/auth";

const app = express();

app.all("/api/auth/*splat", toNodeHandler(auth));

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to prisma land. Have a great journey with prisma.");
});

export default app;
