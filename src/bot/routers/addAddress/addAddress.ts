import { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import createMainMenuKeyboard from "#root/bot/keyboards/mainMenu.js";
import { getAddresses, setAddresses } from "#root/db/addresses.js";
import { Router } from "@grammyjs/router";

export const addAddressRoute = new Router<Context>((ctx) => ctx.session.addAddressMenu);

// Визначаємо крок, який обробляє день.
const addAddress = addAddressRoute.route('add');

addAddress.on("msg:text", logHandle('addAddress-command'), async (ctx) => {
  const arr = ctx.msg.text.trim().split(', ');
  const set = await getAddresses();

  if (set) {
    await setAddresses(set.concat(arr));
  } else {
    await setAddresses(arr);
  }

  ctx.session.addAddressMenu = 'idle';

  await ctx.reply(`*${ctx.t('add-address.save')}* \`\`\`text ${arr.join(', ')} \`\`\``, {
    parse_mode: 'MarkdownV2',
    reply_markup: createMainMenuKeyboard(),
  });
});

const editAddress = addAddressRoute.route('edit');

editAddress.on("msg:text", logHandle('editAddress-command'), async (ctx) => {
  const arr = ctx.msg.text.trim().split(', ');

  await setAddresses(arr);

  await ctx.reply(`*${ctx.t('add-address.save')}* \`\`\`text ${arr.join(', ')} \`\`\``, {
    parse_mode: 'MarkdownV2',
    reply_markup: createMainMenuKeyboard(),
  });
});