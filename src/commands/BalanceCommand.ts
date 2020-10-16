import { TContextWithState } from '../utils/interfaces';
import { UserServices } from '../database/services';

const service = new UserServices();

export default async function BalanceCommand(ctx: TContextWithState) {
  if (ctx.message && ctx.message.from && ctx.message.text) {
    const isAdm = await service.userIsAdmin(ctx.message.from.id);

    // if @username was given
    // ADMIN ONLY
    if (ctx.match) {
      const [_, unm] = ctx.match;

      if (unm) {
        if (isAdm.response && isAdm.payload) {
          const target = await service.getUserFromUsername((unm.startsWith('@')) ? unm.substr(1) : unm);

          if (target.response && target.payload) {
            ctx.reply(`O saldo de *${target.payload['first_name']}* é de *${target.payload['coins']}* moedas\\.`, {
              parse_mode: 'MarkdownV2'
            });
          } else {
            ctx.reply('Usuário não encontrado.');
          }
        } else {
          ctx.reply('Apenas administradores do bot podem ver o saldo de outros usuários. :/');
        }
      } else {
        const target = await service.getUserFromId(ctx.message.from.id);

        if (target.response && target.payload) {
          ctx.reply(`O seu saldo é de *${target.payload['coins']}* moedas\\.`, {
            parse_mode: 'MarkdownV2'
          })
        } else {
          ctx.reply('Ocorreu um erro ao obter seu saldo.');
        }
      }
    } else {
      ctx.reply('Ocorreu um erro ao obter seu saldo.');
    }
  }
}