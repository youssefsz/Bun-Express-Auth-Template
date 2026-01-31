import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  APPLE_IOS_CLIENT_ID: z.string(),
  APPLE_TEAM_ID: z.string(),
  APPLE_KEY_ID: z.string(),
  APPLE_PRIVATE_KEY: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  FRONTEND_URL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
