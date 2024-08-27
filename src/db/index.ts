import { config } from "#root/config/config.js";
import { FileAdapter } from "./file/fileDb.js";
import RedisDb from "./redis/redis.js";

let db: RedisDb | FileAdapter<unknown>;

if (config.BOT_DB === 'fileStore') {
  db = new FileAdapter({
    dirName: 'localeStore',
    folderName: 'data'
  });
} else {
  db = new RedisDb();
}

export default db;