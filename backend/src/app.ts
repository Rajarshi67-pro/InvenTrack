import "reflect-metadata";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env";
import { apiLimiter } from "./middleware/rateLimiter";
import { errorHandler, notFound } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import warehousesRoutes from "./routes/warehouses.routes";
import productsRoutes from "./routes/products.routes";
import inventoryRoutes from "./routes/inventory.routes";
import suppliersRoutes from "./routes/suppliers.routes";
import purchaseOrdersRoutes from "./routes/purchase-orders.routes";
import forecastingRoutes from "./routes/forecasting.routes";
import reportsRoutes from "./routes/reports.routes";
import notificationsRoutes from "./routes/notifications.routes";
import usersRoutes from "./routes/users.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

// ── CORS ────────────────────────────────────────────────────────────────────
// Build an allowlist from FRONTEND_URL (comma-separated) + dev defaults
const rawOrigins = (env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    // Allow any Vercel deployment of this project automatically
    const isVercel = /\.vercel\.app$/.test(origin);
    if (isVercel || rawOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // pre-flight for all routes
app.use(compression());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", apiLimiter);

// Health check
app.get("/health", (_, res) => res.json({ status: "OK", timestamp: new Date().toISOString(), version: "1.0.0" }));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/warehouses", warehousesRoutes);
app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/suppliers", suppliersRoutes);
app.use("/api/v1/purchase-orders", purchaseOrdersRoutes);
app.use("/api/v1/forecasting", forecastingRoutes);
app.use("/api/v1/reports", reportsRoutes);
app.use("/api/v1/notifications", notificationsRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// API docs
app.get("/api/docs.json", (_, res) => res.json({ openapi: "3.0.0", info: { title: "InvenTrack Pro API", version: "1.0.0", description: "Enterprise IMS REST API" }, servers: [{ url: "/api/v1" }] }));

// Root
app.get("/", (_, res) => res.json({
  name: "InvenTrack Pro API",
  version: "1.0.0",
  status: "running",
  timestamp: new Date().toISOString(),
  endpoints: {
    health:    "GET /health",
    docs:      "GET /api/docs.json",
    auth:      "/api/v1/auth",
    products:  "/api/v1/products",
    warehouses:"/api/v1/warehouses",
    inventory: "/api/v1/inventory",
    suppliers: "/api/v1/suppliers",
    orders:    "/api/v1/purchase-orders",
    dashboard: "/api/v1/dashboard",
    reports:   "/api/v1/reports",
  },
}));

app.use(notFound);
app.use(errorHandler);

export default app;