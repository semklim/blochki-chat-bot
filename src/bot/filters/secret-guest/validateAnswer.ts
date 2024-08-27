import { Context } from "#root/bot/context.js";

export default function validateAnswer(ctx: Context, variants: string[]) {
  const text = ctx.msg?.text;
  if (text) {
    return variants.some((el) => el === text);
  }
  return false;
}