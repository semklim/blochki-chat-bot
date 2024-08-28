import { Context } from "#root/bot/context.js";
import { addUsersSecretGuestPermission } from "#root/bot/handlers/saveDataLocale/users/users.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { i18n } from "#root/bot/i18n.js";
import createMainMenuKeyboard from "#root/bot/keyboards/mainMenu.js";
import { Router } from "@grammyjs/router";

export const addSecretGuestRoute = new Router<Context>((ctx) => ctx.session.addSecretGuestMenu);

// Визначаємо крок, який обробляє день.
const addSecretGuest = addSecretGuestRoute.route('add');

addSecretGuest
  .filter((ctx) => {
    const regex = /^@[\w\d_]+$/;
    const text = ctx.msg?.text;
    if (!text) return false;

    const isValid = text.split(",").every((username) => regex.test(username.trim()));
    return isValid;
  })
  .on("msg:text", logHandle('addSecretGuest-command'), async (ctx) => {
    const arr = ctx.msg.text.trim().replaceAll('@', '').split(', ');
    const users = await addUsersSecretGuestPermission(arr);

    ctx.session.addSecretGuestMenu = 'idle';

    await ctx.reply(`*${ctx.t('add-secretGuest.save')}* \`\`\`text ${arr.join(', ')} \`\`\``, {
      parse_mode: 'MarkdownV2',
      reply_markup: await createMainMenuKeyboard(ctx),
    });

    users.forEach(async ({ user_id, lang }) => {
      await ctx.api.sendMessage(user_id, i18n.t(lang, 'add-secretGuest.usersAnswer'), {
        reply_markup: await createMainMenuKeyboard(ctx, lang),
      });
    })
  });

addSecretGuest.use((ctx) => {
  ctx.reply(ctx.t('add-secretGuest.not-valid'))
})

// const editAddress = addSecretGuestRoute.route('edit');

// editAddress.on("msg:text", logHandle('editSecretGuest-command'), async (ctx) => {
//   const arr = ctx.msg.text.trim().split(', ');

//   await setAddresses(arr);

//   await ctx.reply(`*${ctx.t('add-address.save')}* \`\`\`text ${arr.join(', ')} \`\`\``, {
//     parse_mode: 'MarkdownV2',
//     reply_markup: await createMainMenuKeyboard(ctx),
//   });
// });