import { chunk } from '#root/bot/helpers/keyboard.js';
import { Keyboard } from 'grammy';
import { KeyboardButton } from 'grammy/types';
import { Context } from '../context.js';
import { hasProperty } from '../helpers/checkType.js';

type TKeyboardYesOrNot = {
  ctx: Context;
  addBtnSkip?: boolean;
}

export function createCustomYesOrNotKeyboard(props: Context | TKeyboardYesOrNot) {
  const newProps = hasProperty<TKeyboardYesOrNot>(props, "addBtnSkip")
    ? { ctx: props.ctx, addBtnSkip: props.addBtnSkip }
    : { ctx: props, addBtnSkip: false };

  const { ctx, addBtnSkip } = newProps;

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
