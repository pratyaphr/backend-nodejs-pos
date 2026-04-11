import express from "express";
import {
  getEmployees,
  createEmployees,
  deleteEmployee,
  updateEmployee,
} from "../controllers/employees.controller.js";

const router = express.Router();

router.post("/", createEmployees);
router.get("/", getEmployees);
router.delete("/:id", deleteEmployee);
router.put("/:id", updateEmployee);

export default router;
