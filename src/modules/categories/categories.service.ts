import { prisma } from "../../lib/prisma";

import AppError from "../../utils/AppErrors";
import { Not } from "../../../prisma/generated/prisma/internal/prismaNamespace";

// getting all category

const getAllCategory = async () => {
  const result = await prisma.categories.findMany({
    include: {
      subjects: true,
    },
  });
  console.log(result);
  return result;
};

// create category

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

  const categoryName = payload.name.trim().toUpperCase();

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

// update category

const updateCategory = async (
  id: string,
  payload: {
    name?: string;
    description?: string;
  },
) => {
  if (!id) {
    throw new AppError(
      400,
      "Category id required to update.",
      "Missing category id",
      [
        {
          field: "Update Category",
          message: "Please give category id.",
        },
      ],
    );
  }

  const findingCategory = await prisma.categories.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
    },
  });

  if (!findingCategory) {
    throw new AppError(
      400,
      "No category found in this id.",
      "Invalid_Category_id",
      [
        {
          field: "Update category.",
          message: "Please give valid category id.",
        },
      ],
    );
  }

  if (payload.name) {
    payload.name = payload.name?.trim().toUpperCase();
    const duplicateCategory = await prisma.categories.findFirst({
      where: {
        name: payload.name,
        NOT: {
          id: id,
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicateCategory) {
      throw new AppError(
        400,
        "Duplicate category name.",
        "Duplicate_Category_Name",
        [
          {
            field: "Update category.",
            message: "Please give category name without any duplication.",
          },
        ],
      );
    }
  }

  const updateCategory = await prisma.categories.update({
    where: {
      id: id,
    },
    data: payload,
  });

  return updateCategory;
};

// delete category

const deleteCategory = async (id: string) => {
  if (!id) {
    throw new AppError(400, "Category id is required.", "Missing_Category_Id", [
      {
        field: "Delete Category",
        message: "Please provide category id.",
      },
    ]);
  }

  const isExistCategory = await prisma.categories.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
    },
  });

  if (!isExistCategory) {
    throw new AppError(
      400,
      "No category found in this id.",
      "Invalid_Category_id",
      [
        {
          field: "Delete category.",
          message: "Please give valid category id.",
        },
      ],
    );
  }

  const result = await prisma.categories.delete({
    where: {
      id: id,
    },
  });

  return result;
};

export const categoryService = {
  getAllCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
