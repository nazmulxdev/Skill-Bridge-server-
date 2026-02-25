//  get all featured teacher

import { prisma } from "../../lib/prisma";

const getAllFeaturedTutor = async () => {
  const result = await prisma.tutorProfile.findMany({
    where: {
      isFeatured: true,
    },
    include: {
      user: true,
      education: true,
      subjects: {
        include: {
          subject: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  return result;
};

// get all tutor with search and filter;

const getAllTutor = async (payload: {
  search?: string;
  rating?: number | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  category?: string | undefined;
  page?: number;
  limit?: number;
  skip?: number;
}) => {
  const { search, rating, minPrice, maxPrice, category, page, limit, skip } =
    payload;
  const andConditions: any = [];

  if (search) {
    andConditions.push({
      subjects: {
        some: {
          subject: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  if (category) {
    andConditions.push({
      subjects: {
        some: {
          subject: {
            category: {
              name: {
                equals: category,
                mode: "insensitive",
              },
            },
          },
        },
      },
    });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    andConditions.push({
      hourlyRate: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    });
  }

  const tutors = await prisma.tutorProfile.findMany({
    where: {
      AND: andConditions,
    },
    include: {
      user: true,
      subjects: {
        include: {
          subject: {
            include: {
              category: true,
            },
          },
        },
      },
      education: true,
      availabilities: true,
      tutorTimeSlots: true,
      reviews: true,
    },
  });

  let filteredTutors = tutors;

  if (rating !== undefined) {
    filteredTutors = tutors.filter((tutor) => {
      if (!tutor.reviews.length) return false;

      const avg =
        tutor.reviews.reduce((sum, r) => sum + Number(r.rating), 0) /
        tutor.reviews.length;

      return avg >= rating;
    });
  }

  const total = filteredTutors.length;

  const paginatedData = filteredTutors.slice(skip, skip! + limit!);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit!),
    },
    data: paginatedData,
  };
};

export const publicService = {
  getAllFeaturedTutor,
  getAllTutor,
};
