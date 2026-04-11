import express from "express";
import { authLogin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", authLogin);

export default router;
