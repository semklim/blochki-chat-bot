#!/usr/bin/env tsx
import { config } from '#root/config/config.js';
import BotServer from '#root/server/index.js';
import { addAddressesFeature } from './bot/features/addAddresses.js';
import { addSecretGuestFeature } from './bot/features/addSecretGuest.js';
import { adminFeature } from './bot/features/admin.js';
import { languageFeature } from './bot/features/language.js';
import { secretGuestFeature } from './bot/features/secretGuest.js';
import { unhandledFeature } from './bot/features/unhandled.js';
import { welcomeFeature } from './bot/features/welcome.js';
import { isAddAddressRouter } from './bot/filters/isAddAddress.js';
import { isSecretGuestRouter } from './bot/filters/isSecretGuest.js';
import Bot from './bot/index.js';
import { addAddressRoute } from './bot/routers/addAddress/addAddress.js';
import { addSecretGuestRoute } from './bot/routers/addSecretGuest/addSecretGuestRoute.js';
import { changeLanguageRoute } from './bot/routers/changeLanguage/changeLanguage.js';
import { secretGuestRouter } from './bot/routers/secretGuest/secretGuest.js';


export const bot = new Bot(config, new BotServer(config), {
  commands: [welcomeFeature, /*birthdayFeature,*/ languageFeature, adminFeature, secretGuestFeature, addAddressesFeature, addSecretGuestFeature],
  routers: [
    // {
    //   handler: bdRouter,
    //   filterPredicate: isBirthdayRouter
    // },
    {
      handler: secretGuestRouter,
      filterPredicate: isSecretGuestRouter,
    },
    {
      handler: addAddressRoute,
      filterPredicate: isAddAddressRouter,
    },
    {
      handler: changeLanguageRoute,
      filterPredicate: () => true,
    },
    {
      handler: addSecretGuestRoute,
      filterPredicate: () => true,
    }
  ],
  otherwiseCommand: unhandledFeature,
});

bot.init();