import { Keyboard } from 'grammy';

export default function createMainMenuKeyboard(ctx: Context) {

  return new Keyboard().text(ctx.t('main_menu.secret-guest')).text(ctx.t('main_menu.manager')).resized();
}