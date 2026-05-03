import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import { config } from "../config";
import { Role, UserStatus } from "../../prisma/generated/prisma/enums";

export const seedAdmin = async () => {
  try {
    const isAdminExist = await prisma.user.findFirst({
      where: {
        role: Role.ADMIN,
      },
    });

    if (isAdminExist) {
      console.log("Admin already exist. Skipping seeding admin.");
      return;
    }

    const adminUser = await auth.api.signUpEmail({
      body: {
        email: config.admin_email as string,
        password: config.admin_password as string,
        name: "Skill-Bridge(Admin)" as string,
        role: Role.ADMIN,
        status: UserStatus.UNBANNED,
      },
    });

    console.log(adminUser);

    const admin = await prisma.user.findUniqueOrThrow({
      where: {
        email: config.admin_email as string,
      },
    });

    if (admin) {
      await prisma.user.update({
        where: {
          email: config.admin_email as string,
        },
        data: {
          role: Role.ADMIN,
        },
      });
    }

    console.log("Admin created,", admin);
  } catch (error) {
    console.error("Error seeding super admin: ", error);

    await prisma.user.delete({
      where: {
        email: config.admin_email as string,
      },
    });
  }
};
