import { Context } from "../context.js";

export function isAddAddressRouter(ctx: Context) {
  return ctx
    && ctx.session.addAddressMenu !== 'idle'
    && ctx.session.secretGuestMenu === 'idle'
    && ctx.session.step === 'idle';
}