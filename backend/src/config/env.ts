import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('1521'),
  DB_USER: z.string().default('inventrack'),
  DB_PASSWORD: z.string().default(''),
  DB_PASS: z.string().optional(),   // alias kept for backward-compat
  DB_SID: z.string().default('ORCL'),
  DB_SERVICE_NAME: z.string().optional(),
  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  // Email
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@inventrack.com'),
  // App
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX: z.string().default('100'),
  // Oracle Analytics Cloud
  OAC_BASE_URL: z.string().optional(),
  OAC_CLIENT_ID: z.string().optional(),
  OAC_CLIENT_SECRET: z.string().optional(),
  OAC_SCOPE: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

export const env = parsed.data ?? ({} as z.infer<typeof envSchema>);
