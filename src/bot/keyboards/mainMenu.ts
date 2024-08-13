import { Keyboard } from 'grammy';

export default function createMainMenuKeyboard() {

  return new Keyboard().text('Secret guest').text('Chat').resized();
}