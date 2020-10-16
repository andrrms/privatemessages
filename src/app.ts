/**
 *   Private messages bot for telegram.
 *   Copyright (C) 2020  André Silveira
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// Imports
import Telegraf, { Stage } from 'telegraf';
import { MenuMiddleware } from 'telegraf-inline-menu';
import LocalSession from 'telegraf-session-local';
import UserIsBanned from './middlewares/UserIsBanned';
import InlineQueryListener from './listeners/InlineQueryListener';
import ChosenResultListener from './listeners/ChosenResultListener';
import CallbackQueryListener from './listeners/CallbackQueryListener';
import NewChatMemberListener from './listeners/NewChatMemberListener';
import { TContextWithState } from './utils/interfaces';
import { parseCommand } from './utils/util';
import {
  StartCommand,
  BalanceCommand,
  SettingsCommand,
  SettingsCommandScene,
  RestoreCommandScene,
} from './commands';

// Requires
require('dotenv').config();

// Instance bot
const bot = new Telegraf<TContextWithState>(process.env.BOT_TOKEN || '<token>');

// Define stage and scenes
const stage = new Stage([SettingsCommandScene, RestoreCommandScene]);
stage.command('cancel', ctx => {
  ctx.reply('As modificações não foram salvas.')
  ctx.scene.leave();
});

// Define pre-command middlewares
// E.g. Message checking
bot.use(new LocalSession({ database: 'src/constants/localSession.json' }).middleware());
bot.use(stage.middleware());
bot.use(UserIsBanned);
bot.use(async (ctx, next) => {
  if (ctx.chat) {
    ctx.state.chat_is_private = ctx.chat.type === 'private';
  }

  next();
});

// Define commands
bot.command(parseCommand('start'), StartCommand);
bot.hears([/\/wallet (@\w+.)/g, /\/wallet/g], BalanceCommand);
// TODO: Add /help command
// TODO: Add /commands command

const menuMiddleware = new MenuMiddleware('/', SettingsCommand);
bot.command(parseCommand('settings'), async ctx => {
  if (ctx.state.chat_is_private) {
    menuMiddleware.replyToContext(ctx);
  } else {
    if (ctx.message) {
      ctx.reply('Você deve usar esse comando no [chat privado](https://t.me/heimerdingerbot) comigo\\.', {
        parse_mode: 'MarkdownV2',
        reply_to_message_id: ctx.message.message_id
      });
    }
  }
});
bot.command(parseCommand('restore'), (ctx) => {
  ctx.scene.enter('restore');
});


// Define listeners
bot.on('inline_query', InlineQueryListener);
bot.on('chosen_inline_result', ChosenResultListener);
// Callback query
bot.action(/([a-zA-Z]+)_([a-zA-Z0-9].+)/, async (ctx, next) => {
  CallbackQueryListener(ctx);
  next();
});
bot.on('new_chat_members', NewChatMemberListener);

/**
 * Define post-command middlewares
 * E.g. Menus and buttons
 */
bot.use(menuMiddleware.middleware());
console.log(menuMiddleware.tree());

// Set commands and starts the bot
bot.telegram.setMyCommands([
  { command: '/start', description: 'Inicia o bot' },
  { command: '/wallet', description: 'Mostra as informações da sua carteira' },
  { command: '/settings', description: 'Mostra as configurações do bot' },
  { command: '/restore', description: 'Restaura a sua conta se tiver uma chave de backup.' }
]);

bot.startPolling();
console.log('Bot iniciado.');
