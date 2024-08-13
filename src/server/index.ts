import { Context } from '#root/bot/context.js'
import { config } from '#root/config/config.js'
import { IConfig } from '#root/config/config.schema.js'
import { logger } from '#root/logger.js'
import { requestLogger } from '#root/server/middlewares/request-logger.js'
import { serve } from '@hono/node-server'
import { Api, RawApi, Bot as TelegramBot, webhookCallback } from 'grammy'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { getPath } from 'hono/utils/url'
import type { AddressInfo } from 'node:net'
import type { Env } from './environment.js'
import { logger as middlewaresLogger } from './middlewares/logger.js'
import { requestId } from './middlewares/request-id.js'

export default class BotServer {
  config: IConfig
  constructor(config: IConfig) {
    this.config = config;
  }

  private createServerManager(server: Awaited<ReturnType<typeof this.createServer>>) {
    let handle: undefined | ReturnType<typeof serve>
    return {
      start: (host: string, port: number) =>
        new Promise<AddressInfo>((resolve) => {
          handle = serve(
            {
              fetch: server.fetch,
              hostname: host,
              port,
            },
            info => resolve(info),
          )
        }),
      stop: () =>
        new Promise<void>((resolve) => {
          if (handle)
            handle.close(() => resolve())
          else
            resolve()
        }),
    }
  }

  createServer(bot: TelegramBot<Context, Api<RawApi>>) {
    const server = new Hono<Env>()

    server.use(requestId())
    server.use(middlewaresLogger())

    if (config.isDev)
      server.use(requestLogger())

    server.onError(async (error, c) => {
      if (error instanceof HTTPException) {
        if (error.status < 500)
          c.var.logger.info(error)
        else
          c.var.logger.error(error)

        return error.getResponse()
      }

      // unexpected error
      c.var.logger.error({
        err: error,
        method: c.req.raw.method,
        path: getPath(c.req.raw),
      })
      return c.json(
        {
          error: 'Oops! Something went wrong.',
        },
        500,
      )
    })

    server.get('/', c => c.json({ status: true }))

    if (config.BOT_MODE === 'webhook') {

      server.get(`/${bot.token}`, async (c) => {
        const hostname = c.req.header('x-forwarded-host')
        if (typeof hostname === 'string') {
          const webhookUrl = new URL('webhook', `https://${hostname}`).href
          await bot.api.setWebhook(webhookUrl, {
            allowed_updates: config.BOT_ALLOWED_UPDATES,
            secret_token: config.BOT_WEBHOOK_SECRET,
          })
          return c.json({
            status: true,
          })
        }
        c.status(500)
        return c.json({
          status: false,
        })
      })


      server.post(
        '/webhook',
        webhookCallback(bot, 'hono', {
          secretToken: config.BOT_WEBHOOK_SECRET,
        }),
      )
    }
    return server
  }

  private onShutdown(cleanUp: () => Promise<void>) {
    let isShuttingDown = false
    const handleShutdown = async () => {
      if (isShuttingDown)
        return
      isShuttingDown = true
      logger.info('Shutdown')
      await cleanUp()
    }
    process.on('SIGINT', handleShutdown)
    process.on('SIGTERM', handleShutdown)
  }

  async startPolling(botEntity: TelegramBot<Context, Api<RawApi>>) {
    // graceful shutdown
    this.onShutdown(async () => {
      await botEntity.stop()
    })

    // start bot
    await botEntity.start({
      allowed_updates: this.config.BOT_ALLOWED_UPDATES,
      onStart: ({ username }) => {
        logger.info({
          msg: `Bot running with db - ${config.BOT_DB}`,
          username,
        });
      }
    })
  }

  async startWebhook(botEntity: TelegramBot<Context, Api<RawApi>>) {
    const server = this.createServer(botEntity)
    const serverManager = this.createServerManager(server)

    // graceful shutdown
    this.onShutdown(async () => {
      await serverManager.stop()
    })

    // to prevent receiving updates before the bot is ready
    await botEntity.init()

    // start server
    const info = await serverManager.start(
      this.config.BOT_SERVER_HOST,
      this.config.BOT_SERVER_PORT,
    )
    logger.info({
      msg: 'Server started',
      url:
        info.family === 'IPv6'
          ? `http://[${info.address}]:${info.port}`
          : `http://${info.address}:${info.port}`,
    })

    // set webhook
    await botEntity.api.setWebhook(this.config.BOT_WEBHOOK, {
      allowed_updates: this.config.BOT_ALLOWED_UPDATES,
      secret_token: this.config.BOT_WEBHOOK_SECRET,
    })
    logger.info({
      msg: 'Webhook was set',
      url: this.config.BOT_WEBHOOK,
    })
  }
}