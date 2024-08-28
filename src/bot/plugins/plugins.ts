import { i18n } from '#root/bot/i18n.js';
import { updateLogger } from '#root/bot/middlewares/update-logger.js';
import type { IConfig } from '#root/config/config.schema.js';
import { autoChatAction } from '@grammyjs/auto-chat-action';
import { hydrate } from '@grammyjs/hydrate';
import { hydrateReply } from '@grammyjs/parse-mode';
// import { FileAdapter } from '@grammyjs/storage-file';
// import { RedisAdapter } from '@grammyjs/storage-redis';
import { FileAdapter } from '#root/db/file/fileDb.js';
import RedisDb from '#root/db/redis/redis.js';
import type { Middleware } from 'grammy';
import { session } from 'grammy';
import type { Context, SessionData } from '../context.js';


export default function getPlugins(
  config: IConfig
) {
  const logger = config.isDev ? updateLogger() : undefined;
  const plugins: Array<Middleware<Context>> = [];
  if (logger) plugins.push(logger);
  plugins.push(
    autoChatAction(),
    hydrateReply,
    hydrate(),
    session({
      initial: (): SessionData => ({ __language_code: "en", languageMenu: "idle", secretGuestMenu: 'idle', step: 'idle', addAddressMenu: "idle", addSecretGuestMenu: "idle", secretGuestFormData: {} }),
      storage: config.BOT_DB === 'fileStore'
        ? new FileAdapter({
          dirName: 'session',
        })
        : new RedisDb(),
    }),
    i18n,
  );

  return plugins;
}
