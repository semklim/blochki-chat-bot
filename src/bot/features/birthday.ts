import type { Context } from '#root/bot/context.js'
import { Composer, Keyboard } from 'grammy'
import { logHandle } from '../helpers/logging.js'
import resetAllMenu from '../helpers/resetAllMenu.js'
import { getDays } from '../routers/countDaysToBD/countDaysToBD.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command("birthday", logHandle('keyboard-language-select'), async (ctx) => {
  resetAllMenu(ctx);
  const day = ctx.session.dayOfMonth;
  const month = ctx.session.month;
  await ctx.reply(`${day}/${month}`)
  if (day !== undefined && month !== undefined) {
    // Відповідаємо користувачу, якщо інформація вже надана
    await ctx.reply(`Ваш день народження через ${getDays(month, day)} днів!`);
  } else {
    // Починаємо опитування, якщо деякої інформації не вистачає
    ctx.session.step = "day";
    await ctx.reply(
      "Будь ласка, надішліть мені день \
вашого народження у числовому форматі!",
    );
  }
});

feature.command("change_bd", async (ctx) => {
  ctx.session.step = "changeBd";
  ctx.session.dayOfMonth = undefined;
  ctx.session.month = undefined;
  await ctx.reply(
    "Впевнені?",
    {
      reply_markup: new Keyboard().text("✅ Да").text("❌ Ні").resized(),
    }
  );
});

export { composer as birthdayFeature }

