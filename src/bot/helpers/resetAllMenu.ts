import { Context } from "#root/bot/context.js";

export default function resetAllMenu(ctx: Context) {
  ctx.session.secretGuestMenu = 'idle';
  ctx.session.step = 'idle';
}