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
import { resolve } from 'path';
import Telegraf, { Stage } from 'telegraf';
import { MenuMiddleware } from 'telegraf-inline-menu';
import LocalSession from 'telegraf-session-local';
import TelegrafI18n from 'telegraf-i18n';
import UserIsBanned from './middlewares/UserIsBanned';
import SetUserLanguage from './middlewares/SetUserLanguage';
import InlineQueryListener from './listeners/InlineQueryListener';
import ChosenResultListener from './listeners/ChosenResultListener';
import CallbackQueryListener from './listeners/CallbackQueryListener';
import NewChatMemberListener from './listeners/NewChatMemberListener';
import { TContextWithState } from './utils/interfaces';
import { parseCommand } from './utils/util';
import db from './database/connection';
import {
  StartCommand,
  HelpCommand,
  BalanceCommand,
  SettingsCommand,
  SettingsCommandScene,
  RestoreCommandScene,
} from './commands';

// Requires
require('dotenv').config();

// Instance bot
const bot = new Telegraf<TContextWithState>(process.env.BOT_TOKEN || '<token>');

// Instance i18n for translation
export const i18n = new TelegrafI18n({
  defaultLanguage: 'en-US',
  allowMissing: false,
  directory: resolve(__dirname, 'locales'),
  defaultLanguageOnMissing: true,
});

// Define stage and scenes
const stage = new Stage([SettingsCommandScene, RestoreCommandScene]);
stage.command('cancel', ctx => {
  ctx.reply(ctx.i18n.t('common.not_saved'))
  ctx.scene.leave();
});

// Define pre-command middlewares
// E.g. Message checking
bot.use(new LocalSession({ database: 'src/constants/localSession.json' }).middleware());
bot.use(i18n.middleware());
bot.use(stage.middleware());
bot.use(SetUserLanguage);
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
bot.hears([new RegExp(`/help@${process.env.BOT_USERNAME}`, 'g'), /\/help/, /\/help (.+)?/g], HelpCommand);
// TODO: Add /commands command

const menuMiddleware = new MenuMiddleware('/', SettingsCommand);
bot.command(parseCommand('settings'), async ctx => {
  if (ctx.state.chat_is_private) {
    menuMiddleware.replyToContext(ctx);
  } else {
    if (ctx.message) {
      ctx.reply(ctx.i18n.t('common.message_on_private', {
        username: process.env.BOT_USERNAME
      }), {
        parse_mode: 'HTML',
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
  { command: '/start', description: 'Starts the bot' },
  { command: '/help', description: 'Shows the help message' },
  { command: '/wallet', description: 'Shows your wallet information' },
  { command: '/settings', description: 'Shows the bot settings' },
  { command: '/restore', description: 'Restores your account if you have a backup key' }
]);

bot.startPolling();
console.log('Bot iniciado.');
