import { chunk } from '#root/bot/helpers/keyboard.js';
import { Keyboard } from 'grammy';
import { KeyboardButton } from 'grammy/types';
import { Context } from '../context.js';

export function createCustomYesOrNotKeyboard(ctx: Context, addBtnSkip = false) {
  const buttons: KeyboardButton.CommonButton[] = [
    Keyboard.text(ctx.t('yes')),
    Keyboard.text(ctx.t('not')),
  ];

  if (addBtnSkip) {
    buttons.push(
      Keyboard.text(ctx.t('skip')),
    )
  }

  return Keyboard.from(chunk(buttons, 2)).resized();
}
