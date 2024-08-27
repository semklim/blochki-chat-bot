import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { createLangKeyboard } from '#root/bot/keyboards/change-language.js'
import { Composer } from 'grammy'
import resetAllMenu from '../helpers/resetAllMenu.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('language', logHandle('command-language'), async (ctx) => {
  resetAllMenu(ctx);
  ctx.session.languageMenu = "change";

  return ctx.reply(ctx.t('language.select'), {
    reply_markup: await createLangKeyboard(ctx),
  })
})

export { composer as languageFeature }

