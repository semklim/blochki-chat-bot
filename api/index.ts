import { bot } from '#root/main.js';
import { handle } from '@hono/node-server/vercel';

export default handle(bot.server)