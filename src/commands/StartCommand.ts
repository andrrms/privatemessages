import { parsePayload } from '../utils/util';
import { UserServices } from '../database/services';
import { TContextWithState } from '../utils/interfaces';

const service = new UserServices();

export default async function StartCommand(ctx: TContextWithState) {
  if (ctx.message && ctx.message.from && ctx.message.text) {
    const { method } = parsePayload(ctx.message.text.substr(7));

    if (method) {
      console.log(method);

      switch (method) {
        case 'showBlc':
          const amount = await service.getBalance(ctx.message.from.id);

          if (amount.response && amount.payload) {
            const coins = await amount.payload;

            return ctx.reply(ctx.i18n.t('commands.balance.self_amount', { coins }), { parse_mode: 'HTML' });
          } else {
            return ctx.reply(ctx.i18n.t('commands.balance.error'));
          }
        case 'payonce':
          return ctx.reply(ctx.i18n.t('commands.start.payment.once'), {
            parse_mode: 'HTML'
          });
        case 'paymult':
          return ctx.reply(ctx.i18n.t('commands.start.payment.multiple'), {
            parse_mode: 'HTML'
          });
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
      return ctx.reply(ctx.i18n.t('commands.start.user.new'));
    } else {
      return ctx.reply(ctx.i18n.t('commands.start.user.existing'));
    }
  }
}