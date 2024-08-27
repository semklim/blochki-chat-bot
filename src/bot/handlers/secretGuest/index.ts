import { Context } from "#root/bot/context.js";
import validateNumber from "#root/bot/helpers/validateGrade.js";
import { i18n } from "#root/bot/i18n.js";
import createMainMenuKeyboard from "#root/bot/keyboards/mainMenu.js";
import { createCustomSelectGradeKeyboard } from "#root/bot/keyboards/select-grade.js";
import { Other } from "@grammyjs/hydrate";
import { Middleware } from "grammy";
import { ForceReply, ReplyKeyboardMarkup, ReplyKeyboardRemove } from "grammy/types";
import { getExtension } from "hono/utils/mime";
import { savePhoto } from "./savePhoto.js";

interface ISecretGuestHandler {
  currStep: IBotMenus["secretGuestMenu"],
  nextStep: IBotMenus["secretGuestMenu"],
  customKeyboard?: (ctx: Context) => InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply,
}


type IPhotoSecretGuestHandler = Omit<ISecretGuestHandler, "nextStep" | "customKeyboard">;

const DEFAULT_SLEEP = 200;
const DEFAULT_MENU = 'secretGuest'
const grateKeyboard = () => createCustomSelectGradeKeyboard();


function rateSelectorHandler({ currStep, nextStep, customKeyboard = grateKeyboard }: ISecretGuestHandler): Middleware<Context> {
  return async (ctx, next) => {
    /* ------------------------------ LOG Menu Step ----------------------------- */
    ctx.logInfo(currStep, DEFAULT_MENU);

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
    ctx.session.secretGuestFormData[currStep] = {
      q: i18n.t('uk', `secret-guest.${currStep}`),
      a: grade,
    };

    ctx.session.secretGuestMenu = nextStep;

    await ctx.reply(ctx.t(`secret-guest.${nextStep}`), option);
  }
}

function textHandler({ currStep, nextStep, customKeyboard = grateKeyboard }: ISecretGuestHandler): Middleware<Context> {
  return async (ctx, next) => {
    /* ------------------------------ LOG Menu Step ----------------------------- */
    ctx.logInfo(currStep, DEFAULT_MENU);
    if (!ctx.msg?.text) {
      await next();
      return;
    }

    const option: Other<"sendMessage", "chat_id" | "text"> = {
      reply_markup: customKeyboard(ctx),
    }

    ctx.session.secretGuestFormData[currStep] = {
      q: i18n.t('uk', `secret-guest.${currStep}`),
      a: ctx.msg.text,
    };
    ctx.session.secretGuestMenu = nextStep;

    await ctx.reply(ctx.t(`secret-guest.${nextStep}`), option);
  }
}


function photoHandler({ currStep }: IPhotoSecretGuestHandler): Middleware<Context> {
  return async (ctx, next) => {
    /* ------------------------------ LOG Menu Step ----------------------------- */
    ctx.logInfo(currStep, DEFAULT_MENU + 'msg:photo');
    if (!ctx.msg?.photo) {
      await next();
      return;
    }
    const file = await ctx.getFile();
    savePhoto(ctx, file);
  }
}


function documentPhotoHandler({ currStep }: IPhotoSecretGuestHandler): Middleware<Context> {
  return async (ctx, next) => {
    /* ------------------------------ LOG Menu Step ----------------------------- */
    ctx.logInfo(currStep, DEFAULT_MENU + 'document');
    if (!ctx.msg?.document) {
      await next();
      return;
    }
    const type = getExtension(ctx.msg.document.mime_type || '');
    if (!type) {
      await next();
      return;
    }
    const file = ctx.msg.document;
    savePhoto(ctx, file);
  }
}

function finishHandler(): Middleware<Context> {
  return async (ctx, next) => {
    ctx.logInfo('finish', DEFAULT_MENU);

    ctx.session.secretGuestMenu = 'idle';


    ctx.reply(ctx.t('secret-guest.finish'), {
      reply_markup: createMainMenuKeyboard(ctx)
    });
  }
}


export { documentPhotoHandler, photoHandler, rateSelectorHandler, textHandler };

