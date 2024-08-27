import { config } from "#root/config/config.js";
import db from "./index.js";

const botDb = config.BOT_DB;
const key = 'secretGuestForm';






export async function getSecretGuestForm(): Promise<SecretGuestFormDataLocal | undefined> {
  if (botDb === 'fileStore') {
    return db.read(key);
  }

  if (botDb === 'redis') return db.read(key);
}

export async function setSecretGuestForm(addresses: SecretGuestFormDataLocal): Promise<void> {
  if (botDb === 'fileStore') {
    await db.write(key, addresses);
  }

  if (botDb === 'redis') await db.write(key, addresses);
}