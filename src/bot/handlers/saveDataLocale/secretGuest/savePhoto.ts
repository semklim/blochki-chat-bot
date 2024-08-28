import { Context } from "#root/bot/context.js";
import { type File, Document } from "grammy/types";

interface IPhoto {
  file_id: string
  file_unique_id: string
  file_name?: string
  mime_type?: string
  caption?: string
}

export function savePhoto(ctx: Context, file: File & Document) {
  const { file_id, file_unique_id, file_name, mime_type } = file;
  const photo: IPhoto = {
    file_name: file_name ?? file_id,
    mime_type: mime_type ?? "image/jpeg",
    file_id,
    file_unique_id,
    caption: ctx.msg?.caption
  }

  if (Array.isArray(ctx.session.secretGuestFormData.photos)) {
    ctx.session.secretGuestFormData.photos.push(photo);
  } else {
    ctx.session.secretGuestFormData.photos = [photo];
  }
}