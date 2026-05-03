import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import AppResponse from "../../utils/AppResponse";
import AppError from "../../utils/AppErrors";
import { RagService } from "./rag.service";
import { redisService } from "../../lib/redis";

const ragService = new RagService();

export const ingestData = catchAsync(async (req: Request, res: Response) => {
  const result = await ragService.ingestAllData();
  AppResponse(res, {
    message: "All data indexed",
    statusCode: 200,
    success: true,
    data: result,
  });
});

export const queryRag = catchAsync(async (req: Request, res: Response) => {
  const { query, limit, sourceType } = req.body;
  if (!query) throw new AppError(400, "Query is required");

  const cacheKey = `rag:query:${query}:${limit ?? 5}:${sourceType || "all"}`;

  try {
    const cacheData = await redisService.get(cacheKey);
    if (cacheData) {
      AppResponse(res, {
        message: "Query successful from cache",
        statusCode: 200,
        success: true,
        data: JSON.parse(cacheData),
      });
      return;
    }
  } catch (error) {
    console.warn();
  }

  // generate answer

  const result = await ragService.generateAnswer(query, limit ?? 5, sourceType);

  try {
    await redisService.set(cacheKey, JSON.stringify(result), 600);
  } catch (error) {
    console.error("Error setting data in Redis", error);
  }

  AppResponse(res, {
    message: "Query successful",
    statusCode: 200,
    success: true,
    data: result,
  });
});
