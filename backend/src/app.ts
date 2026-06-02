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

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: env.FRONTEND_URL, credentials: true, methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"], allowedHeaders: ["Content-Type","Authorization"] }));
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

app.use(notFound);
app.use(errorHandler);

export default app;