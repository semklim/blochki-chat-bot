import { Context } from "../context.js";

const imageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/bmp",
  "image/webp",
];


export function isImage(ctx: Context) {
  const type = ctx.msg?.document?.mime_type;
  if (type) {
    return imageMimeTypes.includes(type);
  }
  return false;
}