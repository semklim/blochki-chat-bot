import process from 'node:process';
import { parseEnv } from 'znv';
import z from 'zod';
import { configSchema, IConfig } from './config.schema.js';

export class Config {
  private config?: IConfig;

  constructor() {
    /* ------------- If the file is not found, error will be thrown. ------------ */
    process.loadEnvFile();
  }

  public createConfigFromEnvironment(environment: NodeJS.ProcessEnv) {
    if (this.config) return this.config;

    const env = parseEnv(environment, configSchema);

    if (env.BOT_MODE === 'webhook') {
      // validate webhook url in webhook mode
      z.string()
        .url()
        .parse(env.BOT_WEBHOOK, {
          path: ['BOT_WEBHOOK'],
        });
      // validate webhook secret in webhook mode
      z.string()
        .min(1)
        .parse(env.BOT_WEBHOOK_SECRET, {
          path: ['BOT_WEBHOOK_SECRET'],
        });
    }

    this.config = env;

    this.config.isDev = process.env.NODE_ENV === 'development';
    this.config.isProd = process.env.NODE_ENV === 'production';

    return env;
  }
}

const data = new Config();

export const config = data.createConfigFromEnvironment(process.env);