import { selectAddressData } from "#root/bot/callback-data/select-address.js";
import { Context } from "#root/bot/context.js";
import validateAnswer from "#root/bot/filters/secret-guest/validateAnswer.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { sleep } from "#root/bot/helpers/sleep.js";
import validateNumber from "#root/bot/helpers/validateGrade.js";
import createMainMenuKeyboard from "#root/bot/keyboards/mainMenu.js";
import { createSelectAddressKeyboard } from "#root/bot/keyboards/select-address.js";
import { createCustomSelectGradeKeyboard } from "#root/bot/keyboards/select-grade.js";
import { createCustomYesOrNotKeyboard } from "#root/bot/keyboards/yesOrNot.js";
import { getAddresses } from "#root/db/addresses.js";
import { bot } from "#root/main.js";
import { Router } from "@grammyjs/router";
import { Keyboard } from "grammy";

const DEFAULT_SLEEP = 200;

export const secretGuestRouter = new Router<Context>((ctx) => ctx.session.secretGuestMenu);

// Визначаємо крок, який обробляє день.
const contact = secretGuestRouter.route("contact");

contact.on("msg:contact",
  logHandle('secret-guest-contact'),
  async (ctx) => {
    ctx.session.contact = ctx.msg.contact;
    ctx.session.secretGuestMenu = 'date';
    await ctx.reply(ctx.t('secret-guest.contact-answer'), {
      reply_markup: {
        remove_keyboard: true,
      }
    });
    const lang = await ctx.i18n.getLocale() as "en" | 'uk';

    ctx.chatAction = 'typing';
    await sleep(DEFAULT_SLEEP);

    bot.calendar.changeLang(lang);
    bot.calendar.startNavCalendar(ctx);
  });
contact.use((ctx) =>
  ctx.reply(ctx.t('secret-guest-not-valid.contact'))
);

const date = secretGuestRouter.route("date");

date.on("callback_query:data",
  logHandle('secret-guest date picker'),
  async (ctx) => {
    if (ctx!.msg!.message_id === bot.calendar.chats.get(ctx!.chat!.id)) {
      const res = bot.calendar.clickButtonCalendar(ctx);
      const addresses = await getAddresses();

      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      if (!addresses) {
        ctx.session.secretGuestMenu = 'idle';

        return await ctx.reply(ctx.t('empty-address'), {
          reply_markup: createMainMenuKeyboard(),
        });
      }

      if (res !== -1) {
        ctx.session.secretGuestFormData.date = res;
        ctx.session.secretGuestMenu = 'address';

        ctx.reply(ctx.t('secret-guest.address'), {
          reply_markup: await createSelectAddressKeyboard(addresses),
        });
      }
    }
    return;
  });

date.use((ctx) =>
  ctx.reply(ctx.t('secret-guest-not-valid.date'))
);


const address = secretGuestRouter.route("address");

address.callbackQuery(
  selectAddressData.filter(),
  logHandle('keyboard-address-select'),
  async (ctx) => {
    const addresses = await getAddresses() as string[];

    const { address: i } = selectAddressData.unpack(
      ctx.callbackQuery.data,
    );
    ctx.session.secretGuestFormData.address = addresses[i];
    const time = (ctx.session.secretGuestFormData.date as string).replace(/-/gi, '/').replace('T', ' ');
    ctx.chatAction = 'typing';
    await sleep(DEFAULT_SLEEP);

    await ctx.deleteMessage();
    await ctx.reply(ctx.t('secret-guest.addressAndDate', {
      address: addresses[i],
      date: time,
    }));
    ctx.session.secretGuestMenu = 'fasade';
    ctx.reply(ctx.t('secret-guest.fasade'), {
      reply_markup: createCustomSelectGradeKeyboard(),
    });
  }
);

address.use((ctx) =>
  ctx.reply(ctx.t('secret-guest-not-valid.address'))
);

const facade = secretGuestRouter.route("fasade");

facade.on("msg:text",
  logHandle("keyboard-facade-select"),
  async (ctx) => {
    const grade = validateNumber(ctx.msg.text);

    if (typeof grade === 'undefined') return;

    ctx.session.secretGuestFormData["facadeGrade"] = grade;
    ctx.session.secretGuestMenu = "zale";

    ctx.chatAction = 'typing';
    await sleep(DEFAULT_SLEEP);

    await ctx.reply(ctx.t("secret-guest.zale"));
  }
);

facade.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const zal = secretGuestRouter.route("zale");

zal.on("msg:text",
  logHandle("keyboard-zal-select"),
  async (ctx) => {
    const grade = validateNumber(ctx.msg.text);

    if (typeof grade === 'undefined') return;

    ctx.session.secretGuestFormData["zalGrade"] = grade;
    ctx.session.secretGuestMenu = "chistotaVitrin";

    ctx.chatAction = 'typing';
    await sleep(DEFAULT_SLEEP);

    await ctx.reply(ctx.t("secret-guest.chistotaVitrin"));
  }
);

zal.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);


const chistotaVitrin = secretGuestRouter.route("chistotaVitrin");

chistotaVitrin.on("msg:text",
  logHandle("keyboard-chistotaVitrin-select"),
  async (ctx) => {
    const grade = validateNumber(ctx.msg.text);

    if (typeof grade === 'undefined') return;

    ctx.session.secretGuestFormData["chistotaVitrinGrade"] = grade;
    ctx.session.secretGuestMenu = "privitnist";

    ctx.chatAction = 'typing';
    await sleep(DEFAULT_SLEEP);

    await ctx.reply(ctx.t("secret-guest.privitnist"));

  }
);

chistotaVitrin.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);


const privitnist = secretGuestRouter.route("privitnist");

privitnist.on("msg:text",
  logHandle("keyboard-privitnist-select"),
  async (ctx) => {
    const grade = validateNumber(ctx.msg.text);

    if (typeof grade === 'undefined') return;

    ctx.session.secretGuestFormData["privitnistGrade"] = grade;
    ctx.session.secretGuestMenu = "noticeAndGreet";

    ctx.chatAction = 'typing';
    await sleep(DEFAULT_SLEEP);

    await ctx.reply(ctx.t('secret-guest.noticeAndGreet'), {
      reply_markup: new Keyboard()
        .text(ctx.t('noticeAndGreetQuestion.yes')).row()
        .text(ctx.t('noticeAndGreetQuestion.not')).row()
        .text(ctx.t('noticeAndGreetQuestion.definitelyNot')).row()
        .resized(),
    });
  }
);

privitnist.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);


const noticeAndGreet = secretGuestRouter.route("noticeAndGreet");

noticeAndGreet
  .filter((ctx) => validateAnswer(ctx, [
    ctx.t('noticeAndGreetQuestion.yes'),
    ctx.t('noticeAndGreetQuestion.not'),
    ctx.t('noticeAndGreetQuestion.definitelyNot'),
  ]))
  .on("msg:text",
    logHandle("keyboard-noticeAndGreet-select"),
    async (ctx) => {
      const text = ctx.msg.text;
      ctx.session.secretGuestFormData["noticeAndGreet"] = text;
      ctx.session.secretGuestMenu = "offerAdditional";

      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      await ctx.reply(ctx.t('secret-guest.offerAdditional'), {
        reply_markup: createCustomYesOrNotKeyboard(ctx),
      });
    }

  );

noticeAndGreet.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const offerAdditional = secretGuestRouter.route("offerAdditional");

offerAdditional
  .filter((ctx) => validateAnswer(ctx, [
    ctx.t('yes'),
    ctx.t('not'),
  ]))
  .on("msg:text",
    logHandle("keyboard-offerAdditional-select"),
    async (ctx) => {
      ctx.session.secretGuestFormData["offerAdditional"] = ctx.msg.text;
      ctx.session.secretGuestMenu = "giveReceipt";

      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      await ctx.reply(ctx.t('secret-guest.giveReceipt'), {
        reply_markup: createCustomYesOrNotKeyboard(ctx),
      });
    }
  );

offerAdditional.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const giveReceipt = secretGuestRouter.route("giveReceipt");

giveReceipt
  .filter((ctx) => validateAnswer(ctx, [
    ctx.t('yes'),
    ctx.t('not'),
  ]))
  .on("msg:text",
    logHandle("keyboard-giveReceipt-select"),
    async (ctx) => {
      ctx.session.secretGuestFormData["giveReceipt"] = ctx.msg.text;
      ctx.session.secretGuestMenu = "askApp";

      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      await ctx.reply(ctx.t('secret-guest.askApp'), {
        reply_markup: createCustomYesOrNotKeyboard(ctx),
      });
    }
  );

giveReceipt.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const askApp = secretGuestRouter.route("askApp");

askApp
  .filter((ctx) => validateAnswer(ctx, [
    ctx.t('yes'),
    ctx.t('not'),
  ]))
  .on("msg:text",
    logHandle("keyboard-askApp-select"),
    async (ctx) => {
      ctx.session.secretGuestFormData["askApp"] = ctx.msg.text;
      ctx.session.secretGuestMenu = "askTypeCoffee";

      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      await ctx.reply(ctx.t('secret-guest.askTypeCoffee'), {
        reply_markup: createCustomYesOrNotKeyboard(ctx, true),
      });
    }
  );

askApp.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const askTypeCoffee = secretGuestRouter.route("askTypeCoffee");

askTypeCoffee
  .filter((ctx) => validateAnswer(ctx, [
    ctx.t('yes'),
    ctx.t('not'),
    ctx.t('skip')
  ]))
  .on("msg:text",
    logHandle("keyboard-askTypeCoffee-select"),
    async (ctx) => {
      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      ctx.session.secretGuestFormData["askTypeCoffee"] = ctx.msg.text;
      ctx.session.secretGuestMenu = "rateAssortment";
      await ctx.reply(ctx.t('secret-guest.rateAssortment'), {
        reply_markup: createCustomSelectGradeKeyboard(),
      });
    }
  );

askTypeCoffee.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const rateAssortment = secretGuestRouter.route("rateAssortment");

rateAssortment
  .on("msg:text",
    logHandle("keyboard-rateAssortment-select"),
    async (ctx) => {
      const grade = validateNumber(ctx.msg.text);

      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      if (typeof grade === 'undefined') return;

      ctx.session.secretGuestFormData["rateAssortment"] = grade;
      ctx.session.secretGuestMenu = "ratePricingPolicy";
      await ctx.reply(ctx.t('secret-guest.ratePricingPolicy'), {
        reply_markup: createCustomSelectGradeKeyboard(),
      });
    }
  );

rateAssortment.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const ratePricingPolicy = secretGuestRouter.route("ratePricingPolicy");

ratePricingPolicy
  .on("msg:text",
    logHandle("keyboard-ratePricingPolicy-select"),
    async (ctx) => {
      const grade = validateNumber(ctx.msg.text);

      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      if (typeof grade === 'undefined') return;

      ctx.session.secretGuestFormData["ratePricingPolicy"] = grade;
      ctx.session.secretGuestMenu = "overallImpression";
      await ctx.reply(ctx.t('secret-guest.overallImpression'), {
        reply_markup: createCustomSelectGradeKeyboard(),
      });
    }
  );

ratePricingPolicy.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const overallImpression = secretGuestRouter.route("overallImpression");

overallImpression
  .on("msg:text",
    logHandle("keyboard-overallImpression-select"),
    async (ctx) => {
      const grade = validateNumber(ctx.msg.text);

      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      if (typeof grade === 'undefined') return;

      ctx.session.secretGuestFormData["overallImpression"] = grade;
      ctx.session.secretGuestMenu = "comeback";
      await ctx.reply(ctx.t('secret-guest.comeback'), {
        reply_markup: createCustomYesOrNotKeyboard(ctx),
      });
    }
  );

overallImpression.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);


const comeback = secretGuestRouter.route("comeback");

comeback
  .filter((ctx) => validateAnswer(ctx, [
    ctx.t('yes'),
    ctx.t('not'),
  ]))
  .on("msg:text",
    logHandle("keyboard-comeback-select"),
    async (ctx) => {
      ctx.session.secretGuestFormData["comeback"] = ctx.msg.text;
      ctx.session.secretGuestMenu = "dishesChose";

      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      await ctx.reply(ctx.t('secret-guest.dishesChose'), {
        reply_markup: {
          remove_keyboard: true,
        }
      });
    }
  );

comeback.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const dishesChose = secretGuestRouter.route("dishesChose");

dishesChose
  .on("msg:text",
    logHandle("keyboard-dishesChose-select"),
    async (ctx) => {
      ctx.session.secretGuestFormData["dishesChose"] = ctx.msg.text;
      ctx.session.secretGuestMenu = "ratedishes";

      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      await ctx.reply(ctx.t('secret-guest.ratedishes'), {
        reply_markup: createCustomSelectGradeKeyboard(),
      });
    }
  );

dishesChose.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const ratedishes = secretGuestRouter.route("ratedishes");

ratedishes
  .on("msg:text",
    logHandle("keyboard-ratedishes-select"),
    async (ctx) => {

      const grade = validateNumber(ctx.msg.text);

      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      if (typeof grade === 'undefined') return;

      ctx.session.secretGuestFormData["ratedishes"] = grade;
      ctx.session.secretGuestMenu = "clientFewWords";

      await ctx.reply(ctx.t('secret-guest.clientFewWords'), {
        reply_markup: {
          remove_keyboard: true,
        }
      });
    }
  );

ratedishes.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const clientFewWords = secretGuestRouter.route("clientFewWords");

clientFewWords
  .on("msg:text",
    logHandle("keyboard-clientFewWords-select"),
    async (ctx) => {
      ctx.session.secretGuestFormData["clientFewWords"] = ctx.msg.text;
      ctx.session.secretGuestMenu = "recommendEstablishment";

      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      await ctx.reply(ctx.t('secret-guest.recommendEstablishment'), {
        reply_markup: createCustomYesOrNotKeyboard(ctx)
      });
    }
  );

clientFewWords.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const recommendEstablishment = secretGuestRouter.route("recommendEstablishment");

recommendEstablishment
  .filter((ctx) => validateAnswer(ctx, [
    ctx.t('yes'),
    ctx.t('not'),
  ]))
  .on("msg:text",
    logHandle("keyboard-recommendEstablishment-select"),
    async (ctx) => {
      ctx.session.secretGuestFormData["recommendEstablishment"] = ctx.msg.text;
      ctx.session.secretGuestMenu = "photos";

      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      await ctx.reply(ctx.t('secret-guest.photos'), {
        reply_markup: {
          remove_keyboard: true,
        }
      });
    }
  );

recommendEstablishment.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const photos = secretGuestRouter.route("photos");

photos
  .on("msg:photo",
    logHandle("keyboard-photos-select"),
    async (ctx) => {
      ctx.session.secretGuestFormData["photos"] = ctx.msg.photo;
      ctx.session.secretGuestMenu = "idle";

      ctx.chatAction = 'typing';
      await sleep(DEFAULT_SLEEP);

      await ctx.reply(ctx.t('secret-guest.finish'), {
        reply_markup: createMainMenuKeyboard(),
      });
    }
  );

photos.use((ctx) =>
  ctx.reply(ctx.t("secret-guest.photos"))
);



secretGuestRouter.otherwise(async (ctx) => {
  ctx.chatAction = 'typing';

  await ctx.reply(`Step of menu in secret Guest = ${ctx.session.secretGuestMenu}`);
})