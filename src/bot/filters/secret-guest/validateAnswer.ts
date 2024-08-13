import { Context } from "#root/bot/context.js";

export default function validateAnswer(ctx: Context, variants: string[]) {
  const text = ctx.msg?.text;
  console.log("Text ______", text);
  console.log("Text ______2", variants.some((el) => el === text));
  console.log("Text ______3", variants);

  if (text) {
    return variants.some((el) => el === text);
  }
  return false;
}