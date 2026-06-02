import { Router } from "express";
import { forecastingController } from "../controllers/forecasting.controller";
import { authenticate } from "../middleware/authenticate";
const r = Router();
r.use(authenticate);
r.post("/forecast", forecastingController.forecast);
r.get("/dashboard", forecastingController.getDashboard);
r.get("/oracle-analytics", forecastingController.getOracleAnalytics);
export default r;