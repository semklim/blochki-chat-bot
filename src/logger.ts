import { config } from '#root/config/config.js'
import { pino } from 'pino'


/**
 * Creates and configures a Pino logger instance based on the environment configuration.
 *
 * The logger will use different transports depending on whether the application is in development or production mode.
 * - In development mode, logs are formatted with colors and human-readable timestamps using `pino-pretty`.
 * - In production mode, logs are written to a file using the default Pino file transport.
 *
 * The logging level is determined by the `LOG_LEVEL` value in the configuration.
 *
 * @example
 * ```ts
 * logger.info('This is an info message');
 * logger.error('This is an error message');
 *```
 * Development mode:
 * ```bash
 * [2024-08-24 10:00:00] INFO  (12345 on localhost): This is an info message
 * [2024-08-24 10:00:00] ERROR (12345 on localhost): This is an error message
 * ```
 * Production mode:
 * ```bash
 * {"level":30,"time":1692864000000,"msg":"This is an info message","pid":12345,"hostname":"localhost"}
 * {"level":50,"time":1692864000000,"msg":"This is an error message","pid":12345,"hostname":"localhost"}
 * ```
 */
export const logger = pino({
  level: config.LOG_LEVEL,
  transport: {
    targets: [
      ...(config.isDev
        ? [
          {
            target: 'pino-pretty',
            level: config.LOG_LEVEL,
            options: {
              ignore: 'pid,hostname',
              colorize: true,
              translateTime: true,
            },
          },
        ]
        : [
          {
            target: 'pino/file',
            level: config.LOG_LEVEL,
            options: {},
          },
        ]),
    ],
  },
})

export type Logger = typeof logger
