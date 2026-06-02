"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('5000'),
    // Database
    DB_HOST: zod_1.z.string().default('localhost'),
    DB_PORT: zod_1.z.string().default('1521'),
    DB_USER: zod_1.z.string().default('inventrack'),
    DB_PASSWORD: zod_1.z.string().default(''),
    DB_PASS: zod_1.z.string().optional(), // alias kept for backward-compat
    DB_SID: zod_1.z.string().default('ORCL'),
    DB_SERVICE_NAME: zod_1.z.string().optional(),
    // JWT
    JWT_ACCESS_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_ACCESS_EXPIRES: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRES: zod_1.z.string().default('7d'),
    // Email
    SMTP_HOST: zod_1.z.string().default('smtp.gmail.com'),
    SMTP_PORT: zod_1.z.string().default('587'),
    SMTP_USER: zod_1.z.string().email().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
    EMAIL_FROM: zod_1.z.string().default('noreply@inventrack.com'),
    // App
    FRONTEND_URL: zod_1.z.string().default('http://localhost:3000'), // comma-separate multiple origins
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().default('900000'),
    RATE_LIMIT_MAX: zod_1.z.string().default('100'),
    // Oracle Analytics Cloud
    OAC_BASE_URL: zod_1.z.string().optional(),
    OAC_CLIENT_ID: zod_1.z.string().optional(),
    OAC_CLIENT_SECRET: zod_1.z.string().optional(),
    OAC_SCOPE: zod_1.z.string().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    if (process.env.NODE_ENV !== 'test') {
        process.exit(1);
    }
}
exports.env = parsed.data ?? {};
//# sourceMappingURL=env.js.map