import { ChatTypeContext } from "grammy";
import { Context } from "../context.js";


export function isSecretGuestCommand(ctx: ChatTypeContext<Context, "private">) {
  return ctx
    && ctx.session.secretGuestMenu !== 'idle'
    && ctx.session.step === 'idle'
    && ctx.session.addAddressMenu === 'idle';
}


export function isSecretGuestRouter(ctx: Context) {
  return ctx
    && ctx.session.secretGuestMenu !== 'idle'
    && ctx.session.step === 'idle'
    && ctx.session.addAddressMenu === 'idle';
}