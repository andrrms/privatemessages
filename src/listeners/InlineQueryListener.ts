import { TContextWithState } from '../utils/interfaces';
import { randomString, createMessage, answerKeyboard } from '../utils/util';
import { UserServices } from '../database/services';
import { InlineQueryResultArticle } from 'telegraf/typings/telegram-types';

const userService = new UserServices();

export default async function InlineQueryListener(ctx: TContextWithState) {
  if (ctx.inlineQuery && ctx.inlineQuery.query) {
    const userExists = await userService.userExists(ctx.inlineQuery.from.id);
    const query = ctx.inlineQuery.query;

    if (userExists.payload === true) {
      // Store user vars
      const user_id = ctx.inlineQuery.from.id,
        first_name = ctx.inlineQuery.from.first_name,
        last_name = ctx.inlineQuery.from.last_name,
        username = ctx.inlineQuery.from.username;
      // Store values
      const ucid = randomString(25),
        messages = 1, // TODO: Add msg count
        sell_msg = await (await userService.getSellMessage(user_id)).payload,
        pay_once = await (await userService.getPayOnce(user_id)).payload;
      let balance = await (await userService.getBalance(user_id)).payload;
      if (balance === undefined) balance = 0;
      // Prices and result array
      const values = [50, 100, 200, 300, 500, 1000];
      let results: InlineQueryResultArticle[] = [];

      // If query is only text show options
      if (query.length > 0 && query.length <= 200) {
        values.forEach(value => {
          results.push({
            type: 'article',
            id: `sellMsg_${value}_${ucid}`,
            title: `Vender por ${value}c`,
            description: query,
            input_message_content: createMessage(sell_msg, pay_once, {
              firstname: first_name,
              username: username,
              totalamount: balance,
              value: value
            }),
            reply_markup: answerKeyboard(value, ucid),
          });
        });

        ctx.answerInlineQuery(results, {
          cache_time: 0,
          is_personal: true,
          switch_pm_text: `Seu saldo: ${balance}c`,
          switch_pm_parameter: 'showBlc'
        });

        // Else show message to long
      } else if (query.length > 200) {
        ctx.answerInlineQuery([], {
          switch_pm_text: 'Mensagem muito longa.',
          switch_pm_parameter: 'tooLong_null'
        });
        // Else show custom message button and user balance
      }
    } else {
      ctx.answerInlineQuery([], {
        switch_pm_text: 'Você precisa iniciar o bot.',
        switch_pm_parameter: `newUser_${ctx.chat?.id}`
      });
    }
  }
}