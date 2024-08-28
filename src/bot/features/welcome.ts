import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { Composer } from 'grammy'
import { saveUser } from '../handlers/saveDataLocale/users/users.js'
import resetAllMenu from '../helpers/resetAllMenu.js'
import createMainMenuKeyboard from '../keyboards/mainMenu.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('start', logHandle('command-start'), async (ctx) => {
  resetAllMenu(ctx);

  if (ctx.from.username) {
    ctx.session.username = ctx.from.username;
    await saveUser({ username: ctx.from.username, lang: ctx.session.__language_code, chat_id: ctx.chat.id });
  }

  return ctx.reply(ctx.t('welcome'), {
    reply_markup: await createMainMenuKeyboard(ctx),
  })
})

export { composer as welcomeFeature }

