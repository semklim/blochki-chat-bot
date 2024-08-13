import { chunk } from '#root/bot/helpers/keyboard.js';
import { InlineKeyboard } from 'grammy';
import { selectAddressData } from '../callback-data/select-address.js';

const listAddress = [
  { text: "вул.Канатна 100/3", data: "1" },
  { text: "Канатна 100/3 Маф", data: "2" },
  { text: "вул.Академіка Заболотного 26", data: "3" },
  { text: "вул.Академіка Корольова 76", data: "4" },
  { text: "пл.Привокзальна 2/1", data: "5" },
  { text: "вул.Пантелеймонівська 17Б (маф)", data: "6" },
  { text: "вул.Генерал Бочарова 50, ТЦ Атріум", data: "7" },
  { text: "Аркадійська алея 1", data: "8" },
  { text: "вул.Пантелеймонівська 17 Б", data: "9" },
  { text: "вул.Кримська", data: "10" }
];


export async function createSelectAddressKeyboard(addresses: string[]) {

  return InlineKeyboard.from(
    chunk(
      addresses.map((text, i) => ({
        text,
        callback_data: selectAddressData.pack({
          address: i
        })
      })),
      1,
    ),
  )
}
