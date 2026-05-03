import { Router } from "express";
import { ingestData, queryRag } from "./rag.controller";

const router = Router();
router.post("/ingest", ingestData);
router.post("/query", queryRag);
export const ragRoutes = router;
