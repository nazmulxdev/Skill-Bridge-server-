// add subject based on category

import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppErrors";

const addSubject = async (payload: { category_id: string; name: string }) => {
  if (!payload.category_id) {
    throw new AppError(400, "Category id is required.", "Missing_Category_Id", [
      {
        field: "Add Subject.",
        message: "Please provide category id.",
      },
    ]);
  }

  const checkCategory = await prisma.categories.findUnique({
    where: {
      id: payload.category_id,
    },
    select: {
      id: true,
    },
  });

  if (!checkCategory) {
    throw new AppError(
      400,
      "No category found for the given id.",
      "Missing_Category",
      [
        {
          field: "Add subject.",
          message: "Please give listed category_id from the database.",
        },
      ],
    );
  }

  if (!payload.name) {
    throw new AppError(400, "Subject is required.", "Missing_Subject_Name", [
      {
        field: "Add Subject.",
        message: "Please provide subject name.",
      },
    ]);
  }

  payload.name = payload.name.trim().toUpperCase();

  const existSubject = await prisma.subjects.findFirst({
    where: {
      category_id: payload.category_id,
      name: payload.name,
    },
  });

  console.log(existSubject);

  if (existSubject) {
    throw new AppError(
      400,
      "Subject already exist under this category.",
      "Duplicate_Subject_Name",
      [
        {
          field: "Add Subject.",
          message: "Please provide subject name without duplication.",
        },
      ],
    );
  }

  const result = await prisma.subjects.create({
    data: {
      category_id: payload.category_id,
      name: payload.name,
    },
  });

  return result;
};

// get all subject

const getAllSubjects = async () => {
  const result = await prisma.subjects.findMany({
    include: {
      category: true,
    },
  });

  return result;
};

// update subject

const updateSubject = async (id: string, name: string) => {
  if (!id) {
    throw new AppError(
      400,
      "Subject id is required to update.",
      "Missing Subject id",
      [
        {
          field: "Update subject",
          message: "Please give subject id.",
        },
      ],
    );
  }

  const findingSubject = await prisma.subjects.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      category_id: true,
    },
  });

  if (!findingSubject) {
    throw new AppError(
      400,
      "No subject found in this id.",
      "Invalid_Subject_id",
      [
        {
          field: "Update Subject.",
          message: "Please give valid Subject id.",
        },
      ],
    );
  }

  if (!name || !name.trim()) {
    throw new AppError(
      400,
      "Subject name is required.",
      "Missing_Subject_Name",
      [
        {
          field: "Update Subject",
          message: "Please provide valid subject name.",
        },
      ],
    );
  }

  const updateName = name.trim().toUpperCase();
  if (updateName) {
    const duplicateSubject = await prisma.subjects.findFirst({
      where: {
        name: updateName,
        category_id: findingSubject.category_id,
        NOT: {
          id: id,
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicateSubject) {
      throw new AppError(
        400,
        "Duplicate subject name in this category.",
        "Duplicate_Subject_Name",
        [
          {
            field: "Subject category.",
            message: "Subject must be unique within the category.",
          },
        ],
      );
    }
  }

  const updateSubject = await prisma.subjects.update({
    where: {
      id: id,
    },
    data: {
      name: updateName,
    },
  });

  return updateSubject;
};

export const subjectsService = {
  addSubject,
  getAllSubjects,
  updateSubject,
};
