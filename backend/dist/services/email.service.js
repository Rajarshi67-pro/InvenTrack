"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.env.SMTP_HOST,
    port: parseInt(env_1.env.SMTP_PORT),
    secure: env_1.env.SMTP_PORT === "465",
    auth: env_1.env.SMTP_USER ? { user: env_1.env.SMTP_USER, pass: env_1.env.SMTP_PASS } : undefined,
});
exports.emailService = {
    async send(to, subject, html) {
        if (!env_1.env.SMTP_USER) {
            logger_1.logger.info(`[EMAIL MOCK] To: ${to} Subject: ${subject}`);
            return;
        }
        try {
            await transporter.sendMail({ from: `"InvenTrack Pro" <${env_1.env.EMAIL_FROM}>`, to, subject, html });
            logger_1.logger.info(`Email sent to ${to}: ${subject}`);
        }
        catch (err) {
            logger_1.logger.error("Email send failed:", err);
        }
    },
    async sendPasswordReset(to, token) {
        const resetUrl = `${env_1.env.FRONTEND_URL}/reset-password?token=${token}`;
        await exports.emailService.send(to, "Reset Your InvenTrack Pro Password", `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px">
        <h2 style="color:#1e3a8a;margin-bottom:8px">Reset Your Password</h2>
        <p style="color:#64748b">Click the button below to reset your InvenTrack Pro password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:12px 28px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Reset Password</a>
        <p style="color:#94a3b8;font-size:12px">If you did not request this, ignore this email.</p>
      </div>
    `);
    },
    async sendLowStockAlert(to, productName, currentStock, minStock) {
        await exports.emailService.send(to, `⚠️ Low Stock Alert: ${productName}`, `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff7ed;border-radius:16px;border:1px solid #fed7aa">
        <h2 style="color:#c2410c">Low Stock Alert</h2>
        <p><strong>${productName}</strong> is running low.</p>
        <p>Current Stock: <strong style="color:#dc2626">${currentStock} units</strong> (Minimum: ${minStock})</p>
        <a href="${env_1.env.FRONTEND_URL}/inventory" style="display:inline-block;margin:16px 0;padding:10px 24px;background:#ea580c;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">View Inventory</a>
      </div>
    `);
    },
};
//# sourceMappingURL=email.service.js.map