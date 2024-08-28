import { config } from "#root/config/config.js";
import db from "./index.js";

const botDb = config.BOT_DB;
const key = 'users';

export async function getUsers(): Promise<Users | undefined> {
  if (botDb === 'fileStore') {
    return db.read(key);
  }

  if (botDb === 'redis') return db.read(key);
}

export async function setUsers(user: Users): Promise<void> {
  if (botDb === 'fileStore') {
    await db.write(key, user);
  }

  if (botDb === 'redis') await db.write(key, user);
}