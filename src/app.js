import express from "express";
import cors from "cors";

import productRoutes from "./routes/product.routes.js";
import receiptRoutes from "./routes/receipt.routes.js";
import authRoutes from "./routes/auth.routes.js";
import employeesRoutes from "./routes/employees.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/products", productRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeesRoutes);

export default app;
