import { config } from "#root/config/config.js";
import db from "./index.js";

const botDb = config.BOT_DB;
const key = 'addresses';

export async function getAddresses(): Promise<string[] | undefined> {
  if (botDb === 'fileStore') {
    return db.read(key);
  }

  if (botDb === 'redis') return db.read(key);
}

export async function setAddresses(addresses: string[]): Promise<void> {
  if (botDb === 'fileStore') {
    await db.write(key, addresses);
  }

  if (botDb === 'redis') await db.write(key, addresses);
}