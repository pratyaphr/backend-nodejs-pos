import express from "express";
import {
  getPDF,
  getReceipts,
  createReceipts,
  getReceiptDetail,
} from "../controllers/receipt.controller.js";
import { authMiddleware } from "../services/authMiddleware.service.js";

const router = express.Router();

router.post("/getPDF", getPDF);
router.get("/", getReceipts);
router.get("/:id", getReceiptDetail);
router.post("/", createReceipts);

export default router;
