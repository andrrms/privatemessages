import { DataTransport, ISellMsg } from './interfaces';
import DataCodes from '../constants/dataCodes.json';
import { InlineKeyboardMarkup } from 'telegraf/typings/telegram-types';

// Creates a Data Transport object
export function createResponse<K extends keyof typeof DataCodes>(code: K, data?: any): DataTransport {
  const response = DataCodes[code].response;

  const dataReturn: DataTransport = {
    response,
    response_code: code,
    payload: (data) ? data : undefined,
    message: DataCodes[code].description,
  }

  return dataReturn;
}

export function parsePayload(payload: string) {
  const [arg1, arg2] = payload.split('_');

  return {
    method: arg1,
    parameter: arg2
  }
}

export function randomString(length: number) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';

  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

export function stringSplice(string: string, index: number, length: number, newSubStr: string) {
  return string.slice(0, index) + newSubStr + string.slice(index + Math.abs(length))
}

export function sellMsgHasValue(message: string) {
  const msg = message.match(/(\$value)/);

  return msg ? true : false;
}

export function parseSellMessage(message: string, params: Partial<ISellMsg>) {
  let msg = message;

  if (params.firstname) {
    const match = msg.match(/(\$firstname)/);
    if (match) {
      const index = msg.indexOf(match[0]);
      msg = stringSplice(msg, index, match[0].length, params.firstname);
    }
  }

  if (params.username) {
    const match = msg.match(/(\$username)/);
    if (match) {
      const index = msg.indexOf(match[0]);
      msg = stringSplice(msg, index, match[0].length, params.username);
    }
  }

  if (params.totalamount) {
    const match = msg.match(/(\$totalamount)/);
    if (match) {
      const index = msg.indexOf(match[0]);
      msg = stringSplice(msg, index, match[0].length, params.totalamount.toString());
    }
  }

  if (params.value) {
    const match = msg.match(/(\$value)/);
    if (match) {
      const index = msg.indexOf(match[0]);
      msg = stringSplice(msg, index, match[0].length, params.value.toString());
    }
  }

  return msg;
}

export function createMessage(message: string, pay_once: boolean, params: Partial<ISellMsg>) {
  const POtxt = pay_once ? 'Compra única' : 'Compra recorrente';
  const POlink = pay_once ? 'https://t.me/heimerdingerbot?start=payonce' : 'https://t.me/heimerdingerbot?start=paymult';
  return {
    message_text: `${parseSellMessage(message, params)}\n\n[${POtxt}](${POlink})`,
    parse_mode: 'Markdown'
  }
}

export function answerKeyboard(value: number, ucid: string): InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: `Comprar por ${value}c`,
          callback_data: `buyMsg_${value}_${ucid}`
        },
        {
          text: 'Vender uma mensagem',
          switch_inline_query_current_chat: ''
        }
      ]
    ]
  }
}

export function parseCommand(names: string | Array<string>) {
  const username = process.env.BOT_USERNAME;

  if (Array.isArray(names)) {
    const final: Array<string> = [];

    names.forEach((name: any) => {
      final.push(name);
      final.push(`${name}@${username}`);
    });

    return final;
  } else {
    return [names, `${names}@${username}`];
  }
}

export function MarkdownV2Escape(str: string) {
  return str
    .replace('[', '\\[')
    .replace('(', '\\(')
    .replace('{', '\\{')
    .replace('>', '\\>')
    .replace('#', '\\#')
    .replace('+', '\\+')
    .replace('-', '\\-')
    .replace('=', '\\=')
    .replace('|', '\\|')
    .replace('.', '\\.')
    .replace('!', '\\!');
}