import { parsePayload } from '../utils/util';
import { UserServices } from '../database/services';
import { TContextWithState } from '../utils/interfaces';

const service = new UserServices();

export default async function StartCommand(ctx: TContextWithState) {
  if (ctx.message && ctx.message.from && ctx.message.text) {
    const { method } = parsePayload(ctx.message.text.substr(7));

    if (method) {
      switch (method) {
        case 'newUser':
          return ctx.reply(
            'Olá 😄\n' +
            'Esse é o Private Messages, um bot feito para comprar e vender mensagens pagas.\n\n' +
            'Se precisar de ajuda, você pode usar o comando /help'
          );
        case 'showBlc':
          const amount = await service.getBalance(ctx.message.from.id);

          if (amount.response && amount.payload) {
            const coins = await amount.payload;

            return ctx.reply(`Seu saldo é de *${coins}* moedas\\.`, { parse_mode: 'MarkdownV2' });
          } else {
            return ctx.reply('Não foi possível obter seu saldo.');
          }
        case 'payonce':
          return ctx.reply(
            'ℹ️ *Pagamento único*\n\n' +
            'A mensagem que o usuário está vendendo está em modo de pagamento único\\. ' +
            'Isso significa que, ao comprar a mensagem, você só será cobrado ' +
            'uma única vez, mesmo se comprar novamente a mesma mensagem\\.',
            { parse_mode: 'MarkdownV2' }
          );
        case 'paymult':
          return ctx.reply(
            'ℹ️ *Pagamento recorrente*\n\n' +
            'A mensagem que o usuário está vendendo está em modo de pagamento recorrente\\. ' +
            'Isso significa que, ao comprar a mensagem, você será cobrado ' +
            'múltiplas vezes sempre que clicar em comprar mensagem\\.',
            { parse_mode: 'MarkdownV2' }
          );
        default:
          break;
      }
    }

    const createUser = await service.createUserIfNew({
      user_id: ctx.message.from.id,
      first_name: ctx.message.from.first_name,
      last_name: ctx.message.from.last_name,
      username: ctx.message.from.username,
    });

    if (createUser.response === true) {
      return ctx.reply('Olá, seja bem vindo ao Private Messages. Caso tenha dúvidas, você pode usar o comando /help');
    } else {
      return ctx.reply('Já nos conhecemos, não?');
    }
  }
}