import { Context } from "#root/bot/context.js";
import { Router } from "@grammyjs/router";
import { Keyboard } from "grammy";
import { logHandle } from '../../helpers/logging.js';

export const bdRouter = new Router<Context>((ctx) => ctx.session.step);

// Визначаємо крок, який обробляє день.
const changeBd = bdRouter.route("changeBd");

changeBd.on("msg:text", logHandle('bdRouter-changeBd'), async (ctx) => {
  const res = ctx.hasText('✅ Да');

  if (res) {
    ctx.session.step = 'day';
    await ctx.reply(
      "Будь ласка, надішліть мені день \
вашого народження у числовому форматі!",
{ reply_markup: { remove_keyboard: true } }
    );
  } else {
    ctx.session.step = "idle";
    ctx.reply("Зрозумів", { reply_markup: { remove_keyboard: true } })
  }
});

changeBd.use( logHandle('bdRouter-changeBd-error'), (ctx) =>
  ctx.reply(
    "Будь ласка, виберіть один із варіантів в меню",
  )
);

// Визначаємо крок, який обробляє день.
const day = bdRouter.route("day");
day.on("message:text",
  logHandle('bdRouter-day'),
  async (ctx) => {
  const day = parseInt(ctx.msg.text, 10);
  if (isNaN(day) || day < 1 || 31 < day) {
    await ctx.reply("Цей день недійсний, спробуйте ще раз!");
    return;
  }
  ctx.session.dayOfMonth = day;
  // Попередньо змінюємо крок форми
  ctx.session.step = "month";
  await ctx.reply("Готово! А тепер скажіть, якого місяця ви народилися!", {
    reply_markup: {
      one_time_keyboard: true,
      keyboard: new Keyboard()
        .text("Січень").text("Лютий").text("Березень").row()
        .text("Квітень").text("Травень").text("Червень").row()
        .text("Липень").text("Серпень").text("Вересень").row()
        .text("Жовтень").text("Листопад").text("Грудень").build(),
    },
  });
});
day.use(logHandle('bdRouter-day-error'), (ctx) =>
  ctx.reply(
    "Будь ласка, надішліть мені день у вигляді текстового повідомлення!",
  )
);

// Визначаємо крок, який обробляє місяць.
const month = bdRouter.route("month");
month.on("message:text",
  logHandle('bdRouter-month'),
  async (ctx) => {
  // Наступна умова виконається, лише якщо дані сесії пошкоджено.
  const day = ctx.session.dayOfMonth;
  if (day === undefined) {
    await ctx.reply("Спочатку мені потрібно дізнатися день вашого народження!");
    ctx.session.step = "day";
    return;
  }

  const month = Object.keys(months).indexOf(ctx.msg.text);
  if (month === -1) {
    await ctx.reply(
      "Цей місяць недійсний, \
будь ласка, скористайтеся однією з кнопок!",
    );
    return;
  }

  ctx.session.month = month;
  const diff = getDays(month, day);
  await ctx.reply(
    `Ваш день народження ${day}-го ${Object.values(months)[month]}.
Це за ${diff} днів!`,
    { reply_markup: { remove_keyboard: true } },
  );
  ctx.session.step = "idle";
});
month.use(logHandle('bdRouter-month-error'), (ctx) => ctx.reply("Будь ласка, натисніть одну з кнопок!"));

// Визначаємо крок, який обробляє всі інші випадки.
bdRouter.otherwise(logHandle('bdRouter-otherwise'), async (ctx) => { // idle
  await ctx.reply(
    "Надішліть /birthday, щоб дізнатися, як довго вам доведеться чекати свого дня народження.",
  );
});

const months = {
  "Січень": "січня",
  "Лютий": "лютого",
  "Березень": "березня",
  "Квітень": "квітня",
  "Травень": "травня",
  "Червень": "червня",
  "Липень": "липня",
  "Серпень": "серпня",
  "Вересень": "вересня",
  "Жовтень": "жовтня",
  "Листопад": "листопада",
  "Грудень": "грудня",
};
export function getDays(month: number, day: number) {
  const bday = new Date();
  const now = Date.now();
  bday.setMonth(month);
  bday.setDate(day);
  if (bday.getTime() < now) bday.setFullYear(bday.getFullYear() + 1);
  const diff = (bday.getTime() - now) / (1000 * 60 * 60 * 24);
  return diff;
}