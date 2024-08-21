import { addAddressesFeature } from '#root/bot/features/addAddresses.js';
import { adminFeature } from '#root/bot/features/admin.js';
import { birthdayFeature } from '#root/bot/features/birthday.js';
import { languageFeature } from '#root/bot/features/language.js';
import { secretGuestFeature } from '#root/bot/features/secretGuest.js';
import { unhandledFeature } from '#root/bot/features/unhandled.js';
import { welcomeFeature } from '#root/bot/features/welcome.js';
import { isAddAddressRouter } from '#root/bot/filters/isAddAddress.js';
import { isBirthdayRouter } from '#root/bot/filters/isBirthday.js';
import { isSecretGuestRouter } from '#root/bot/filters/isSecretGuest.js';
import Bot from '#root/bot/index.js';
import { addAddressRoute } from '#root/bot/routers/addAddress/addAddress.js';
import { bdRouter } from '#root/bot/routers/countDaysToBD/countDaysToBD.js';
import { secretGuestRouter } from '#root/bot/routers/secretGuest/secretGuest.js';
import { Config } from '#root/config/config.js';
import BotServer from '#root/server/index.js';
import { handle } from '@hono/node-server/vercel';
import process from 'node:process';

const configSetup = new Config();
const config = configSetup.createConfigFromEnvironment(process.env);

export const bot = new Bot(config, new BotServer(config), {
  commands: [welcomeFeature, birthdayFeature, languageFeature, adminFeature, secretGuestFeature, addAddressesFeature],
  routers: [
    {
      handler: bdRouter,
      filterPredicate: isBirthdayRouter
    },
    {
      handler: secretGuestRouter,
      filterPredicate: isSecretGuestRouter,
    },
    {
      handler: addAddressRoute,
      filterPredicate: isAddAddressRouter,
    }
  ],
  otherwiseCommand: unhandledFeature,
});


export default handle(bot.server)