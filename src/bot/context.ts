import type { Logger } from "#root/logger.js";
import { type AutoChatActionFlavor } from "@grammyjs/auto-chat-action";
import type { HydrateFlavor } from "@grammyjs/hydrate";
import type { I18nFlavor } from "@grammyjs/i18n";
import type { ParseModeFlavor } from "@grammyjs/parse-mode";
import type { Contact, Update, UserFromGetMe } from "@grammyjs/types";
import {
  Context as DefaultContext,
  type Api,
  type SessionFlavor,
} from "grammy";

export interface IBotMenus {
  step: "idle" | "changeBd" | "day" | "month"; // крок форми, на якому ми знаходимося
  secretGuestMenu: "idle"
  | "contact"
  | "date"
  | "address"
  | "fasade"
  | "zale"
  | "chistotaVitrin"
  | "privitnist"
  | "noticeAndGreet"
  | "offerAdditional"
  | "giveReceipt"
  | "askApp"
  | "askTypeCoffee"
  | "rateAssortment"
  | "ratePricingPolicy"
  | "overallImpression"
  | "comeback"
  | "dishesChose"
  | "ratedishes"
  | "clientFewWords"
  | "recommendEstablishment"
  | "photos";
  addAddressMenu: "idle" | "add" | "edit";
}

export interface SessionData extends IBotMenus {
  contact?: Contact | string;
  secretGuestFormData: Record<string, unknown>;
  __language_code?: string;
  timeout?: number;
  prevMenu?: string;
  userId?: number;
  shopAddresses?: string[];
  dayOfMonth?: number; // день місяця
  month?: number;
}

interface ExtendedContextFlavor {
  logger: Logger;
}

export type Context = ParseModeFlavor<
  HydrateFlavor<
    DefaultContext &
    ExtendedContextFlavor &
    SessionFlavor<SessionData> &
    I18nFlavor &
    AutoChatActionFlavor
  >
>;

interface Dependencies {
  logger: Logger;
}

export function createContextConstructor({ logger }: Dependencies) {
  return class extends DefaultContext implements ExtendedContextFlavor {
    logger: Logger;

    constructor(update: Update, api: Api, me: UserFromGetMe) {
      super(update, api, me);
      this.logger = logger.child({
        update_id: this.update.update_id,
      });
    }
  } as unknown as new (update: Update, api: Api, me: UserFromGetMe) => Context;
}
