import { createWriteStream, existsSync } from 'fs';
import { mkdir } from "fs/promises";
import { resolve } from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

export const downloadFile = async (url: string | URL | Request, fileName: string, dirName: string) => {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to download image: ${res.statusText}`);
    }

    if (!existsSync(`localStore/data/secretGuest/${dirName}`)) {
      await mkdir(`localStore/data/secretGuest/${dirName}`);  //Optional if you already have downloads directory
    }

    const destination = resolve(`./localStore/data/secretGuest/${dirName}`, fileName);
    const fileStream = createWriteStream(destination, { flags: 'wx' });
    if (res.body) {
      //@ts-ignore
      await finished(Readable.fromWeb(res.body).pipe(fileStream));
      return `./localStore/data/secretGuest/${dirName}` + fileName;
    } else {
      throw new Error(`res.body = ${typeof res.body}`);
    }
  } catch (error) {
    console.log(url, error);
    return undefined;
  }
};