import { TContextWithState } from '../utils/interfaces';
import { UserServices, MessageServices, PaymentServices } from '../database/services';

const userService = new UserServices();
const messageService = new MessageServices();
const paymentService = new PaymentServices();

// functions for switch case
async function caseBuyMsg(ctx: TContextWithState, payload: string) {
  if (ctx.callbackQuery) {
    const [value, ucid] = payload.split('_'),
      user_id = ctx.callbackQuery.from.id

    const msg = await messageService.getMessageFromUCID(ucid);

    if (msg.response && msg.payload) {
      const seller = await userService.getUserFromId(parseInt(msg.payload['from_user_id']));
      const seller_pay_once = seller.payload['pay_once'] === 1 ? true : false;
      const payment = await paymentService.userPaid(user_id, parseInt(msg.payload['id']));

      // If the buyer is the seller
      if (parseInt(msg.payload['from_user_id']) === user_id) {
        console.log('no need, payment is from itself');

        return ctx.answerCbQuery(unescape(msg.payload['message']), true);
      }

      if (seller.response && payment.response && payment.payload && seller_pay_once) {
        ctx.answerCbQuery(unescape(msg.payload['message']), true);
      } else {
        const trx = await userService.makeTransaction(user_id, seller.payload['user_id'], parseInt(value));

        const from_name = ctx.callbackQuery.from.first_name;
        if (trx.response) {
          const pmt = await paymentService.createNewPayment(user_id, seller.payload['user_id'], msg.payload['id']);

          if (pmt.response) {
            const notifUser = seller.payload['notifications'] === 1 ? true : false;

            if (notifUser) {
              ctx.i18n.locale(seller.payload['language']);
              ctx.telegram.sendMessage(seller.payload['user_id'], ctx.i18n.t('system.callback_query.buy_notification', {
                user_id,
                from_name,
                value
              }), {
                parse_mode: 'HTML'
              });
              ctx.i18n.locale(await (await userService.getUserLanguage(user_id)).payload);
              ctx.answerCbQuery(unescape(msg.payload['message']), true);
            } else {
              ctx.answerCbQuery(unescape(msg.payload['message']), true);
            }
          } else {
            ctx.answerCbQuery(ctx.i18n.t('system.callback_query.error'));
          }
        } else {
          ctx.answerCbQuery(ctx.i18n.t('common.not_enough_amount'));
        }
      }
    } else {
      ctx.answerCbQuery();
    }
  }
}

export default async function CallbackQueryListener(ctx: TContextWithState) {
  if (ctx.callbackQuery && ctx.callbackQuery.data) {
    const user_id = ctx.callbackQuery.from.id,
      userExists = await userService.userExists(user_id);

    const [_, method, payload] = ctx.callbackQuery.data.match(/([a-zA-Z]+)_([a-zA-Z0-9].+)/)!;

    // If user exists
    if (userExists.response && userExists.payload) {
      switch (method) {
        case 'buyMsg':
          caseBuyMsg(ctx, payload);
          break;
        default:
          ctx.answerCbQuery();
          break;
      }
    }
  }
}