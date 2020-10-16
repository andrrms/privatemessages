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
              ctx.telegram.sendMessage(seller.payload['user_id'], `[${from_name}](tg://user?id=${user_id}) comprou sua mensagem por *${value}* moedas\\.`, {
                parse_mode: 'MarkdownV2'
              });
              ctx.answerCbQuery(unescape(msg.payload['message']), true);
            } else {
              ctx.answerCbQuery(unescape(msg.payload['message']), true);
            }
          } else {
            ctx.answerCbQuery('Ocorreu um erro ao registrar o pagamento.');
          }
        } else {
          ctx.answerCbQuery('Você não tem saldo suficiente.');
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