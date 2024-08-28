import { Keyboard } from 'grammy';
import { isSecretGuest } from '../handlers/saveDataLocale/users/users.js';
import { i18n } from '../i18n.js';

export default async function createMainMenuKeyboard(ctx: Context, customLang?: User["lang"]) {
  const lang = customLang ?? await ctx.i18n.getLocale();

  if (await isSecretGuest(ctx.from.username, ctx.chat.id)) {
    return new Keyboard().text(i18n.t(lang, 'main_menu.secret-guest')).text(i18n.t(lang, 'main_menu.manager')).resized();
  } else {
    return new Keyboard().text(i18n.t(lang, 'main_menu.manager')).resized();
  }
}