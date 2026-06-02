import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/rbac";
import { authLimiter, strictLimiter } from "../middleware/rateLimiter";
import { validate } from "../middleware/validation";
import { z } from "zod";

const router = Router();
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const registerSchema = z.object({ fullName: z.string().min(2), email: z.string().email(), password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/), role: z.enum(["ADMIN", "MANAGER"]), warehouseId: z.string().optional() });
const fpSchema = z.object({ email: z.string().email() });
const rpSchema = z.object({ token: z.string(), password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/) });
const cpSchema = z.object({ oldPassword: z.string(), newPassword: z.string().min(8) });

router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/register", authenticate, requireAdmin, validate(registerSchema), authController.register);
router.post("/refresh", strictLimiter, authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.post("/forgot-password", authLimiter, validate(fpSchema), authController.forgotPassword);
router.post("/reset-password", validate(rpSchema), authController.resetPassword);
router.put("/change-password", authenticate, validate(cpSchema), authController.changePassword);
router.get("/me", authenticate, authController.getMe);
router.put("/me", authenticate, authController.updateMe);
export default router;