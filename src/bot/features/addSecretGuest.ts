import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { chatAction } from '@grammyjs/auto-chat-action'
import { Composer } from 'grammy'
import resetAllMenu from '../helpers/resetAllMenu.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private');

feature
  .command('addsecretguest',
    logHandle('command-setSecretGuest'),
    chatAction('typing'),
    async (ctx) => {
      resetAllMenu(ctx);
      ctx.session.addSecretGuestMenu = 'add';
      return ctx.reply(ctx.t('add-secretGuest.start'), {
        parse_mode: 'MarkdownV2',
        reply_markup: {
          remove_keyboard: true
        }
      });
    }
  );

// feature
//   .command('editaddress',
//     logHandle('command-editAddresses'),
//     chatAction('typing'),
//     async (ctx) => {
//       resetAllMenu(ctx);
//       ctx.session.addAddressMenu = 'edit';
//       if (ctx.session.shopAddresses) {
//         const current = "```(Current) " + ctx.session.shopAddresses.join(', ') + "```";
//         await ctx.reply(current, {
//           parse_mode: "MarkdownV2",
//         });
//       }
//       return ctx.reply(ctx.t('add-address.edit'), {
//         parse_mode: 'MarkdownV2',
//         reply_markup: {
//           remove_keyboard: true
//         }
//       });
//     }
//   );

export { composer as addSecretGuestFeature }

