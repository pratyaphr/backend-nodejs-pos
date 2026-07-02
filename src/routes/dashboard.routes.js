import express from "express";
import {
  getDashboard,
  getDashboardSalesGraph,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/", getDashboard);
router.get("/SalesGraph", getDashboardSalesGraph);

export default router;
