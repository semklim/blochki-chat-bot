import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { bot } from '#root/main.js'
import { chatAction } from '@grammyjs/auto-chat-action'
import { Composer, Keyboard, } from 'grammy'
import { isSecretGuest } from '../handlers/saveDataLocale/users/users.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private');

feature
  .filter(async (ctx) => await isSecretGuest(ctx.from.username, ctx.chat.id) && ctx.hasText(ctx.t('main_menu.secret-guest')))
  .on('msg:text',
    logHandle('command-secretGuest'),
    chatAction('typing'),
    async (ctx) => {
      if (!ctx.session.contact) {
        ctx.session.secretGuestMenu = 'contact';
        await ctx.reply(
          ctx.t('secret-guest.contact'),
          {
            reply_markup: {
              keyboard: [[Keyboard.requestContact('Share contact')]],
              one_time_keyboard: true,
              resize_keyboard: true,
            }
          }
        );
      } else {
        ctx.session.secretGuestMenu = "date";
        await ctx.reply(ctx.t('secret-guest.dateAndTime'), {
          reply_markup: {
            remove_keyboard: true,
          }
        });
        bot.calendar.startNavCalendar(ctx);
      }
    }
  )

export { composer as secretGuestFeature }

