import express from "express";
import cors from "cors";

import productRoutes from "./routes/product.routes.js";
import receiptRoutes from "./routes/receipt.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/products", productRoutes);
app.use("/api/receipts", receiptRoutes);

export default app;
