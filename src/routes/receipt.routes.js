import express from "express";
import { getPDF } from "../controllers/receipt.controller.js";

const router = express.Router();

router.post("/getPDF", getPDF);

export default router;
