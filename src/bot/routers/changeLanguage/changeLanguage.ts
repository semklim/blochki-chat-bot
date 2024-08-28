import { Context } from "#root/bot/context.js";
import { updateUserLang } from "#root/bot/handlers/saveDataLocale/users/users.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { getLocalCode, hasLocal } from "#root/bot/i18n.js";
import createMainMenuKeyboard from "#root/bot/keyboards/mainMenu.js";
import { Router } from "@grammyjs/router";

export const changeLanguageRoute = new Router<Context>((ctx) => ctx.session.languageMenu);

const change = changeLanguageRoute.route('change');

change
  .filter(async (ctx) => hasLocal(ctx.msg?.text))
  .on("msg:text",
    logHandle("change-lang-router"),
    async (ctx) => {
      await ctx.i18n.setLocale(getLocalCode(ctx.msg.text));
      await updateUserLang(ctx.chat.id, getLocalCode(ctx.msg.text) as User["lang"]);
      ctx.session.languageMenu = "idle";

      await ctx.reply(ctx.t('language.answer', { lang: ctx.msg.text }), {
        reply_markup: await createMainMenuKeyboard(ctx),
      });
    }
  );

change.use((ctx) =>
  ctx.reply(ctx.t('language.not-valid'))
);