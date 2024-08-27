// import { Context } from "#root/bot/context.js";
// import { downloadFile } from "@/downloadImage/index.js";
// import { existsSync } from "fs";
// import { mkdir } from "fs/promises";

// downloadFile

// export async function downloadTOLocaleDb(ctx: Context, file_id: string) {
//   try {
//     ctx.msg!.photo = [
//       {
//         file_id,
//         file_unique_id: 'asd',
//         height: 12,
//         width: 21
//       }
//     ]
//     const file = ctx.getFile();

//     const date = (ctx.session.secretGuestFormData.date as string).slice(0, 10);
//     const folderPath = `localeStore/photos/secretGuest/${ctx.chat!.id}/${date}`;
//     if (!existsSync(folderPath)) {
//       await mkdir(folderPath, {
//         recursive: true,
//       });
//     }
//     const path = await file.download(`./${folderPath}/${file.file_unique_id}.jpg`);
//   } catch (e) {
//     console.log('DownloadFile FAILED - ', e);
//   }
// }