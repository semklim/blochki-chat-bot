import { selectAddressData } from "#root/bot/callback-data/select-address.js";
import { Context } from "#root/bot/context.js";
import { isImage } from "#root/bot/filters/fileType.js";
import validateAnswer from "#root/bot/filters/secret-guest/validateAnswer.js";
import { saveFormLocal } from "#root/bot/handlers/saveDataLocale/secretGuest/saveFormLocal.js";
import { saveUser } from "#root/bot/handlers/saveDataLocale/users/users.js";
import { documentPhotoHandler, photoHandler, rateSelectorHandler, textHandler } from "#root/bot/handlers/secretGuest/index.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import createMainMenuKeyboard from "#root/bot/keyboards/mainMenu.js";
import { createSelectAddressKeyboard } from "#root/bot/keyboards/select-address.js";
import { createCustomSelectGradeKeyboard } from "#root/bot/keyboards/select-grade.js";
import { createCustomYesOrNotKeyboard } from "#root/bot/keyboards/yesOrNot.js";
import { getAddresses } from "#root/db/addresses.js";
import { bot } from "#root/main.js";
import { Router } from "@grammyjs/router";
import { Keyboard } from "grammy";


export const secretGuestRouter = new Router<Context>((ctx) => ctx.session.secretGuestMenu);

// Визначаємо крок, який обробляє день.
const contact = secretGuestRouter.route("contact");

contact.on("msg:contact",
  logHandle('secret-guest-contact'),
  async (ctx) => {
    const contacts = ctx.msg.contact;
    ctx.session.contact = contacts;
    ctx.session.secretGuestMenu = 'date';
    await ctx.reply(ctx.t('secret-guest.contact-answer'), {
      reply_markup: {
        remove_keyboard: true,
      }
    });

    saveUser({
      username: ctx.from?.username,
      chat_id: ctx.chat.id,
      lang: ctx.session.__language_code,
      contact: {
        first_name: contacts.first_name,
        last_name: contacts.last_name,
        phone_number: contacts.phone_number,
        user_id: contacts.user_id || ctx.chat.id,
        vcard: contacts.vcard,
      },
    });
    await ctx.reply(ctx.t('secret-guest.dateAndTime'), {
      reply_markup: {
        remove_keyboard: true,
        is_persistent: false,
      },
    });

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

      if (!addresses) {
        ctx.session.secretGuestMenu = 'idle';

        return await ctx.reply(ctx.t('empty-address'), {
          reply_markup: await createMainMenuKeyboard(ctx),
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
  rateSelectorHandler({
    currStep: 'fasade',
    nextStep: 'zale',
  })
);

facade.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const zal = secretGuestRouter.route("zale");

zal.on("msg:text",
  rateSelectorHandler({
    currStep: 'zale',
    nextStep: 'chistotaVitrin',
  })
);

zal.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);


const chistotaVitrin = secretGuestRouter.route("chistotaVitrin");

chistotaVitrin.on("msg:text",
  rateSelectorHandler({
    currStep: 'chistotaVitrin',
    nextStep: 'privitnist',
  })
);

chistotaVitrin.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);


const privitnist = secretGuestRouter.route("privitnist");

privitnist.on("msg:text",
  rateSelectorHandler({
    currStep: 'privitnist',
    nextStep: 'noticeAndGreet',
    customKeyboard: (ctx) => new Keyboard()
      .text(ctx.t('noticeAndGreetQuestion.yes')).row()
      .text(ctx.t('noticeAndGreetQuestion.not')).row()
      .text(ctx.t('noticeAndGreetQuestion.definitelyNot')).row()
      .resized(),
  })
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
    textHandler({
      currStep: 'noticeAndGreet',
      nextStep: 'offerAdditional',
      customKeyboard: (ctx) => createCustomYesOrNotKeyboard(ctx),
    })
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
    textHandler({
      currStep: 'offerAdditional',
      nextStep: 'giveReceipt',
      customKeyboard: (ctx) => createCustomYesOrNotKeyboard(ctx),
    })
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
    textHandler({
      currStep: 'giveReceipt',
      nextStep: 'askApp',
      customKeyboard: (ctx) => createCustomYesOrNotKeyboard(ctx),
    })
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
    textHandler({
      currStep: 'askApp',
      nextStep: 'askTypeCoffee',
      customKeyboard: (ctx) => createCustomYesOrNotKeyboard({ ctx, addBtnSkip: true }),
    })
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
    textHandler({
      currStep: 'askTypeCoffee',
      nextStep: 'rateAssortment',
      customKeyboard: () => createCustomSelectGradeKeyboard(),
    })
  );

askTypeCoffee.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const rateAssortment = secretGuestRouter.route("rateAssortment");

rateAssortment
  .on("msg:text",
    logHandle("keyboard-rateAssortment-select"),
    rateSelectorHandler({
      currStep: 'rateAssortment',
      nextStep: 'ratePricingPolicy'
    })
  );

rateAssortment.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const ratePricingPolicy = secretGuestRouter.route("ratePricingPolicy");

ratePricingPolicy
  .on("msg:text",
    logHandle("keyboard-ratePricingPolicy-select"),
    rateSelectorHandler({
      currStep: 'ratePricingPolicy',
      nextStep: 'overallImpression'
    })
  );

ratePricingPolicy.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const overallImpression = secretGuestRouter.route("overallImpression");

overallImpression
  .on("msg:text",
    logHandle("keyboard-overallImpression-select"),
    rateSelectorHandler({
      currStep: 'overallImpression',
      nextStep: 'comeback',
      customKeyboard: (ctx) => createCustomYesOrNotKeyboard(ctx),
    })
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
    textHandler({
      currStep: 'comeback',
      nextStep: 'dishesChose',
      customKeyboard: () => ({ remove_keyboard: true }),
    })
  );

comeback.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const dishesChose = secretGuestRouter.route("dishesChose");

dishesChose
  .on("msg:text",
    textHandler({
      currStep: 'dishesChose',
      nextStep: 'ratedishes',
      customKeyboard: () => createCustomSelectGradeKeyboard(),
    })
  );

dishesChose.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const ratedishes = secretGuestRouter.route("ratedishes");

ratedishes
  .on("msg:text",
    rateSelectorHandler({
      currStep: 'ratedishes',
      nextStep: 'clientFewWords',
      customKeyboard: () => ({ remove_keyboard: true })
    })
  );

ratedishes.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const clientFewWords = secretGuestRouter.route("clientFewWords");

clientFewWords
  .on("msg:text",
    textHandler({
      currStep: 'clientFewWords',
      nextStep: 'recommendEstablishment',
      customKeyboard: (ctx) => createCustomYesOrNotKeyboard(ctx),
    })
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
    textHandler({
      currStep: 'recommendEstablishment',
      nextStep: 'photos',
      customKeyboard: (ctx) => new Keyboard().text(ctx.t('secret-guest.allPhotosBtn')).resized(),
    })
  );

recommendEstablishment.use((ctx) =>
  ctx.reply(ctx.t("secret-guest-not-valid.grade"))
);

const photos = secretGuestRouter.route("photos");

photos
  .filter(async (ctx) => {
    return typeof ctx.msg?.document !== "object";
  })
  .on(["msg:photo"],
    photoHandler({
      currStep: 'photos'
    })
    // logHandle("keyboard-photos-select"),
    // async (ctx) => {
    //   // const date = (ctx.session.secretGuestFormData.date as string).slice(0, 10);
    //   // const folderPath = `localeStore/photos/secretGuest/${ctx.chat.id}/${date}`;
    //   // if (!existsSync(folderPath)) {
    //   //   await mkdir(folderPath, {
    //   //     recursive: true,
    //   //   });
    //   // }
    //   // const path = await file.download(`./${folderPath}/${file.file_unique_id}.jpg`);
    //   // await ctx.reply(ctx.t('secret-guest.finish'), {
    //   //   reply_markup: createMainMenuKeyboard(),
    //   // });
    // }
  );

photos
  .filter(isImage)
  .on("msg:document",
    documentPhotoHandler({
      currStep: 'photos'
    })
  );


photos
  .filter((ctx) => validateAnswer(ctx, [
    ctx.t('secret-guest.allPhotosBtn'),
  ]))
  .on("msg:text",
    async (ctx) => {
      ctx.session.secretGuestMenu = 'idle';

      await saveFormLocal({ user_id: ctx.chat.id, value: ctx.session.secretGuestFormData });
      ctx.session.secretGuestFormData = {};

      ctx.reply(ctx.t('secret-guest.finish'), {
        reply_markup: await createMainMenuKeyboard(ctx)
      });
    }
  )

photos.use((ctx) =>
  ctx.reply(ctx.t("secret-guest.photos"))
);




secretGuestRouter.otherwise(async (ctx) => {
  ctx.chatAction = 'typing';

  await ctx.reply(`Step of menu in secret Guest = ${ctx.session.secretGuestMenu}`);
})