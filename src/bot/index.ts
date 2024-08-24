import { Context, createContextConstructor } from '#root/bot/context.js';
import { errorHandler } from '#root/bot/handlers/error.js';
import getPlugins from '#root/bot/plugins/plugins.js';
import { IConfig } from '#root/config/config.schema.js';
import { logger } from '#root/logger.js';
import BotServer from '#root/server/index.js';
import { parseMode } from '@grammyjs/parse-mode';
import { Router } from '@grammyjs/router';
import { Composer, Bot as TelegramBot, type Api, type Middleware, type RawApi } from 'grammy';
import { MaybePromise } from 'grammy-guard';
import process from 'node:process';
import { Calendar } from "telegram-inline-calendar";

interface ICommands {
  handler: Composer<Context>,
  filterPredicate: (ctx: Context) => MaybePromise<boolean>;
}
interface IRouters {
  handler: Router<Context>,
  filterPredicate: (ctx: Context) => MaybePromise<boolean>;
}

interface IBotOptions {
  commands?: Array<Composer<Context> | ICommands>;
  routers?: Array<Router<Context> | IRouters>;
  otherwiseCommand?: Composer<Context>;
}

export default class Bot {
  private botEntity: TelegramBot<Context, Api<RawApi>>;
  private plugins: Array<Middleware<Context>> = [];
  private commands: Array<Composer<Context> | ICommands> = [];
  private routers: Array<Router<Context> | IRouters> = [];
  private otherwiseCommand?: Composer<Context>;
  public readonly config: IConfig;
  public bot: Composer<Context>;
  public calendar: Calendar
  public server: ReturnType<BotServer['createServer']>;

  constructor(private readonly configSetup: IConfig, private serverService: BotServer, options?: IBotOptions) {
    this.config = this.configSetup;
    this.botEntity = new TelegramBot(this.config.BOT_TOKEN, {
      ...this.config,
      ContextConstructor: createContextConstructor({ logger }),
    });

    this.botEntity.api.config.use(parseMode('HTML'));
    this.bot = this.botEntity.errorBoundary(errorHandler);
    this.plugins = getPlugins(this.config);
    this.regPlugin(...this.plugins);

    this.calendar = new Calendar(this.botEntity, {
      date_format: 'YYYY-MM-DDTHH:mm',
      language: 'en',
      bot_api: 'grammy',
      time_selector_mod: true,
      custom_start_msg: "👇"

    });

    if (options?.commands) {
      this.addCommand(...options.commands)
    }

    if (options?.routers) {
      this.addRoute(...options.routers)
    }

    if (options?.otherwiseCommand) {
      this.otherwiseCommand = options.otherwiseCommand;
    }

    this.server = this.serverService.createServer(this.botEntity);
  }

  regPlugin(...plugin: Array<Middleware<Context>>) {
    this.bot.use(...plugin);
  }

  addCommand(...command: Array<Composer<Context> | ICommands>) {
    this.commands.push(...command);
  }

  addRoute(...router: Array<Router<Context> | IRouters>) {
    this.routers.push(...router);
  }

  private regHandlers() {
    for (let i = 0; i < this.commands.length; i++) {
      const handler = this.commands[i] as Composer<Context>;
      this.bot.use(handler);
    }
    for (let i = 0; i < this.routers.length; i++) {
      if ('handler' in this.routers[i]) {
        const { handler, filterPredicate } = this.routers[i] as IRouters;
        this.bot.filter(filterPredicate).use(handler);
      } else {
        const handler = this.routers[i] as Router<Context>;
        this.bot.use(handler);
      }
    }

    if (this.otherwiseCommand) {
      this.bot.use(this.otherwiseCommand);
    }
  }

  async init() {
    this.regHandlers();

    try {
      if (this.config.BOT_MODE === 'webhook')
        await this.serverService.startWebhook(this.botEntity)
      else if (this.config.BOT_MODE === 'polling')
        await this.serverService.startPolling(this.botEntity)
    }
    catch (error) {
      logger.error(error)
      process.exit(1)
    }
  }
}
