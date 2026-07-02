import express from "express";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getListProducts,
} from "../controllers/product.controller.js";
import { authMiddleware } from "../services/authMiddleware.service.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/List", getListProducts);
router.post("/", addProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
