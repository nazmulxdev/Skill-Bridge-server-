import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import AppError from "../utils/AppErrors";
import catchAsync from "../utils/catchAsync";

const authMiddleware = (...roles: Array<Role>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    console.log(session);

    if (!session) {
      throw new AppError(
        401,
        "You are not authorized.",
        "Auth session failed",
        [
          {
            field: "Authentication",
            message: "You have to create account or login first.",
          },
        ],
      );
    }

    if (roles.length && !roles.includes(session.user.role as Role)) {
      throw new AppError(403, "Unauthorized access.", "Invalid request", [
        {
          field: "Authentication",
          message: "Please use valid identity token for access.",
        },
      ]);
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role as Role,
      status: session.user.status as UserStatus,
    };

    next();
  });
};

export default authMiddleware;
