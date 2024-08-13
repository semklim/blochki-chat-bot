import { chunk } from '#root/bot/helpers/keyboard.js';
import { Keyboard } from 'grammy';
import { KeyboardButton } from 'grammy/types';

export function createCustomSelectGradeKeyboard() {

  const buttons: KeyboardButton.CommonButton[] = [];

  for (let i = 1; i <= 10; i++) {
    buttons.push(Keyboard.text(i.toString()))
  }

  return Keyboard.from(chunk(buttons, 3)).resized();
}
