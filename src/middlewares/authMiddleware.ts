import { NextFunction, Request, Response } from "express";
import { Role } from "../../generated/prisma/enums";
import { auth } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

const authMiddleware = (...roles: Array<Role>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    console.log(session);
    next();
  };
};

export default authMiddleware;
