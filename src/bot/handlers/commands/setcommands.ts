import type { Context } from '#root/bot/context.js'
import { i18n, isMultipleLocales } from '#root/bot/i18n.js'
import { config } from '#root/config/config.js'
import type { BotCommand } from '@grammyjs/types'
import type { CommandContext } from 'grammy'

interface ICommands {
  command: string;
  description: (lang: string) => string;
  isAdmin?: true;
}

const commands: ICommands[] = [
  {
    command: 'start',
    description: (lang) => i18n.t(lang, 'start_command.description'),
  },
  {
    command: 'setcommands',
    description: (lang) => i18n.t(lang, 'setcommands_command.description'),
    isAdmin: true,
  },
  {
    command: 'birthday',
    description: () => 'change bd date',
  },
  {
    command: 'change_bd',
    description: () => 'reset bd date',
  },
  {
    command: 'addaddress',
    description: () => 'Add address to database',
    isAdmin: true,
  },
  {
    command: 'editaddress',
    description: () => 'set new address in database',
    isAdmin: true,
  }

]

function getCommands(lang: string, adminCommand = false): BotCommand[] {
  const DEFAULT_LANGUAGE_CODE = lang || 'en';
  if (adminCommand) {
    return commands.map(({ command, description }) => {
      return {
        command,
        description: description(DEFAULT_LANGUAGE_CODE),
      }
    });
  }
  return commands.filter((el) => el.isAdmin !== true).map(({ command, description }) => {
    return {
      command,
      description: description(DEFAULT_LANGUAGE_CODE),
    }
  });

}


function getLanguageCommand(localeCode: string): BotCommand {
  return {
    command: 'language',
    description: i18n.t(localeCode, 'language_command.description'),
  }
}


function getGroupChatCommands(_localeCode: string): BotCommand[] {
  return [
  ]
}

export async function setCommandsHandler(ctx: CommandContext<Context>) {
  const DEFAULT_LANGUAGE_CODE = await ctx.i18n.getLocale() ?? 'en';
  console.log(getCommands(DEFAULT_LANGUAGE_CODE));
  // set private chat commands
  await ctx.api.setMyCommands(
    [
      ...getCommands(DEFAULT_LANGUAGE_CODE),
      ...(isMultipleLocales ? [getLanguageCommand(DEFAULT_LANGUAGE_CODE)] : []),
    ],
    {
      scope: {
        type: 'all_private_chats',
      },
    },
  )

  if (isMultipleLocales) {
    const requests = i18n.locales.map(code =>
      ctx.api.setMyCommands(
        [
          ...getCommands(code),
          ...(isMultipleLocales
            ? [getLanguageCommand(code)]
            : []),
        ],
        {
          language_code: code,
          scope: {
            type: 'all_private_chats',
          },
        },
      ),
    )

    await Promise.all(requests)
  }

  // set group chat commands
  await ctx.api.setMyCommands(getGroupChatCommands(DEFAULT_LANGUAGE_CODE), {
    scope: {
      type: 'all_group_chats',
    },
  })

  if (isMultipleLocales) {
    const requests = i18n.locales.map(code =>
      ctx.api.setMyCommands(getCommands(code), {
        language_code: code,
        scope: {
          type: 'all_group_chats',
        },
      }),
    )

    await Promise.all(requests)
  }

  // set private chat commands for owner
  await ctx.api.setMyCommands(
    [
      ...getCommands(DEFAULT_LANGUAGE_CODE, true),
      ...(isMultipleLocales ? [getLanguageCommand(DEFAULT_LANGUAGE_CODE)] : []),
    ],
    {
      language_code: DEFAULT_LANGUAGE_CODE,
      scope: {
        type: 'chat',
        chat_id: Number(config.BOT_ADMINS),
      },
    },
  )

  return ctx.reply(ctx.t('admin.commands-updated'))
}
