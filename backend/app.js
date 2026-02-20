import express from "express";
import cors from "cors";

import productRoutes from "./routes/product.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import dailyClosingRoutes from "./routes/dailyClosing.routes.js";
import auditRoutes from "./routes/audit.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// Routes
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/daily", dailyClosingRoutes);
app.use("/api/audit", auditRoutes);

// Global error handler
app.use(errorHandler);

export default app; 