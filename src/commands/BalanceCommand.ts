import { TContextWithState } from '../utils/interfaces';
import { PaymentServices, UserServices } from '../database/services';

const service = new UserServices();
const paymentService = new PaymentServices();

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
            ctx.reply(ctx.i18n.t('commands.balance.user_amount', {
              first_name: target.payload['first_name'],
              coins: target.payload['coins']
            }), {
              parse_mode: 'HTML'
            });
          } else {
            ctx.reply(ctx.i18n.t('common.user_not_found'));
          }
        } else {
          ctx.reply(ctx.i18n.t('common.admin_only'));
        }
      } else {
        const target = await service.getUserFromId(ctx.message.from.id);

        if (target.response && target.payload) {
          const targetPayments = await paymentService.countPaymentsFromUser(parseInt(target.payload['user_id']));

          if (targetPayments.response) {
            console.log(targetPayments.payload);

            ctx.reply(ctx.i18n.t('commands.balance.self_amount', {
              coins: target.payload['coins'],
              buys: (targetPayments.payload === undefined) ? 0 : targetPayments.payload
            }), {
              parse_mode: 'HTML'
            });
          }
        } else {
          ctx.reply(ctx.i18n.t('common.command_error'));
        }
      }
    } else {
      ctx.reply(ctx.i18n.t('common.command_error'));
    }
  }
}