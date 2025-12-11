import express from "express";
import { createTransaction, deleteTransaction, getSummaryByUserId, getTranscationsByUserId } from "../controllers/transactionsController.js";

const router = express.Router();

router.get("/:userId", getTranscationsByUserId);
router.post("/", createTransaction);
router.delete("/:id", deleteTransaction);
router.get("/summary/:userId", getSummaryByUserId);

export default router;