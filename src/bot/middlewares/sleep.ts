import type { Context } from '#root/bot/context.js';
import type { Middleware } from 'grammy';
import { sleep } from '../helpers/sleep.js';


export function sleepMiddleware(): Middleware<Context> {
  return async (ctx, next) => {
    ctx.chatAction = 'typing';
    await sleep(2000);
    await next();
  }
}