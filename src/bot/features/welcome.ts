import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { Composer } from 'grammy'
import resetAllMenu from '../helpers/resetAllMenu.js'
import createMainMenuKeyboard from '../keyboards/mainMenu.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('start', logHandle('command-start'), async (ctx) => {
  resetAllMenu(ctx);
  if (!ctx.session.__language_code) {
    await ctx.i18n.setLocale('en');
  }
  return ctx.reply(ctx.t('welcome'), {
    reply_markup: createMainMenuKeyboard(),
  })
})

export { composer as welcomeFeature }

