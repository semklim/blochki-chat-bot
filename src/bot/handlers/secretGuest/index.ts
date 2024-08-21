import { Context, IBotMenus } from "#root/bot/context.js";
import validateNumber from "#root/bot/helpers/validateGrade.js";
import { createCustomSelectGradeKeyboard } from "#root/bot/keyboards/select-grade.js";
import { Other } from "@grammyjs/hydrate";
import { Middleware } from "grammy";
import { ForceReply, ReplyKeyboardMarkup, ReplyKeyboardRemove } from "grammy/types";

interface IRateSelector {
  currStep: IBotMenus["secretGuestMenu"],
  nextStep: IBotMenus["secretGuestMenu"],
  customKeyboard?: (ctx: Context) => InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply,
}

const DEFAULT_SLEEP = 200;
const grateKeyboard = () => createCustomSelectGradeKeyboard();

function rateSelectorHandler({ currStep, nextStep, customKeyboard = grateKeyboard }: IRateSelector): Middleware<Context> {
  return async (ctx, next) => {
    const grade = validateNumber(ctx.msg?.text || '');

    if (typeof grade === 'undefined') {
      await next();
      return;
    }

    const option: Other<"sendMessage", "chat_id" | "text"> = {
      reply_markup: customKeyboard(ctx),
    }

    // ctx.chatAction = 'typing';
    // await sleep(DEFAULT_SLEEP);
    ctx.session.secretGuestFormData[currStep] = grade;
    ctx.session.secretGuestMenu = nextStep;

    await ctx.reply(ctx.t(`secret-guest.${nextStep}`), option);
  }
}

export { rateSelectorHandler };

