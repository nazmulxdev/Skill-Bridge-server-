// create category

import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppErrors";

const createCategory = async (payload: {
  name: string;
  description: string;
}) => {
  if (!payload.name) {
    throw new AppError(
      400,
      "Please give category name",
      "Missing category name",
      [
        {
          field: "Category creation",
          message: "Please give category name.",
        },
      ],
    );
  }

  const categoryName = payload.name.toUpperCase();

  const findingCategory = await prisma.categories.findFirst({
    where: {
      name: categoryName,
    },
    select: {
      id: true,
    },
  });

  console.log(findingCategory);

  if (findingCategory) {
    throw new AppError(
      400,
      "Category already exist.",
      "Duplicate category name.",
      [
        {
          field: "Category creation",
          message: "Please give another category name.",
        },
      ],
    );
  }

  const result = await prisma.categories.create({
    data: {
      name: categoryName,
      description: payload.description,
    },
  });
  return result;
};

export const adminService = {
  createCategory,
};
