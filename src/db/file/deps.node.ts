import { existsSync, mkdirSync, PathLike } from 'fs';
import { FileHandle, mkdir, readFile, rm, stat, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { Stream } from 'stream';
export const fs = {
  readFile: (path: PathLike | FileHandle) => readFile(path, { encoding: 'utf-8' }),
  writeFile: (path: PathLike | FileHandle, data: string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream) => writeFile(path, data, { encoding: 'utf-8' }),
  existsSync,
  ensureDir: async (path: PathLike) => {
    try {
      await stat(path);
    }
    catch (error: unknown) {
      const e = error as Error & { code: string };
      if (e.code === 'ENOENT') {
        await mkdir(path, { recursive: true });
      }
      else
        throw e;
    }
  },
  ensureDirSync: (path: PathLike) => mkdirSync(path, { recursive: true }),
  remove: (path: PathLike) => rm(path, { recursive: true }),
};
export const path = {
  resolve,
};
export const cwd = process.cwd;