import express from "express";
import cors from "cors";

import productRoutes from "./routes/product.routes.js";
import receiptRoutes from "./routes/receipt.routes.js";
import authRoutes from "./routes/auth.routes.js";
import employeesRoutes from "./routes/employees.routes.js";
import DashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/products", productRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/dashboard", DashboardRoutes);

export default app;
