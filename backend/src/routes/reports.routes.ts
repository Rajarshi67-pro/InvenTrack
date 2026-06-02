import { Router } from "express";
import { reportsController } from "../controllers/reports.controller";
import { authenticate } from "../middleware/authenticate";
const r = Router();
r.use(authenticate);
r.post("/generate", reportsController.generate);
export default r;