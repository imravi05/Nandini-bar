import express from "express";
import cors from "cors"
import dotenv from "dotenv";
import helmet from "helmet";

import productRoutes from "./routes/product.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import dailyClosingRoutes from "./routes/dailyClosing.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/users.routes.js";

dotenv.config();
const app = express();

// Middlewares
const allowedOrigins = new Set([
  'http://localhost:5173',
  process.env.VERCEL_URL
]);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); 

    // Use .has() for Sets instead of .includes()
    if (allowedOrigins.has(origin)) { 
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(helmet());

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
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);


// Global error handler
app.use(errorHandler);

export default app; 