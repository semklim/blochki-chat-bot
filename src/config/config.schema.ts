import { API_CONSTANTS, type ApiConstants } from 'grammy';
import { port } from 'znv';
import z from 'zod';

export interface IConfig {
  NODE_ENV: 'development' | 'production';
  LOG_LEVEL: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent';
  BOT_MODE: 'polling' | 'webhook';
  BOT_DB: 'fileStore' | 'redis';
  BOT_TOKEN: string;
  BOT_WEBHOOK: string;
  BOT_WEBHOOK_SECRET: string;
  BOT_SERVER_HOST: string;
  BOT_SERVER_PORT: number;
  BOT_ALLOWED_UPDATES: readonly ApiConstants['ALL_UPDATE_TYPES'][];
  BOT_ADMINS: readonly number[];
  isDev: boolean;
  isProd: boolean;
}

export const configSchema = {
  NODE_ENV: z.enum(['development', 'production']),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent'])
    .default('info'),
  BOT_MODE: {
    schema: z.enum(['polling', 'webhook']),
    defaults: {
      production: 'webhook' as const,
      development: 'polling' as const,
    },
  },
  BOT_DB: z
    .enum(['fileStore', 'redis'])
    .default('fileStore'),
  BOT_TOKEN: z.string(),
  BOT_WEBHOOK: z.string().default(''),
  BOT_WEBHOOK_SECRET: z.string().default(''),
  BOT_SERVER_HOST: z.string().default('0.0.0.0'),
  BOT_SERVER_PORT: port().default(80),
  BOT_ALLOWED_UPDATES: z
    .array(z.enum(API_CONSTANTS.ALL_UPDATE_TYPES))
    .default([]),
  BOT_ADMINS: z.array(z.number()).default([]),
  isDev: z.boolean().default(process.env.NODE_ENV === 'development'),
  isProd: z.boolean().default(process.env.NODE_ENV === 'production'),
};
