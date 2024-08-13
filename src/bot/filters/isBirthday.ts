import { Context } from "../context.js";


export function isBirthdayCommand(ctx: Context) {
  return ctx
    .hasCommand('birthday')
    && ctx.session.secretGuestMenu === 'idle';
}
export function isBirthdayRouter(ctx: Context) {
  return ctx.session.step !== 'idle'
    && ctx.session.secretGuestMenu === 'idle'
    && ctx.session.addAddressMenu === 'idle';
}