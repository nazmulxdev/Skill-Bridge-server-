import { Session, User } from "better-auth";

import Request from "express";
import { Role, UserStatus } from "../../../generated/prisma/enums";
import { Role } from "../../../prisma/generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: Role;
        status: UserStatus;
      };
    }
  }
}
