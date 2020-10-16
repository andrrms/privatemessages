import { Payment } from '../../utils/interfaces';
import { createResponse } from '../../utils/util';
import PaymentsController from '../controllers/PaymentsController';
import UserServices from './UserServices';
import MessageServices from './MessageServices';

const Controller = new PaymentsController(),
  userService = new UserServices(),
  messageService = new MessageServices();

export default class PaymentServices {
  async getPaymentFromMessageId(message_id: number) {
    const payment = await Controller.index(message_id);

    return (payment) ?
      createResponse("200", payment) :
      createResponse("404");
  }

  async userPaid(buyer_id: number, message_id: number) {
    const payment = await Controller.index(message_id);

    if (payment) {
      return (payment['buyer_id'] === buyer_id) ?
        createResponse("200", true) :
        createResponse("200", false);
    } else {
      return createResponse("200", false);
    }
  }

  async createNewPayment(buyer_id: number, seller_id: number, message_id: number) {
    const buyer = await userService.getUserFromId(buyer_id),
      seller = await userService.getUserFromId(seller_id);

    // Check if both users exists
    if (buyer && seller) {
      const msg = await messageService.getMessageFromId(message_id);

      if (msg) {
        const insert = await Controller.create({
          buyer_id,
          seller_id,
          message_id
        });

        return (insert) ?
          createResponse("201") :
          createResponse("406");
      } else {
        return createResponse("404", "Message not found");
      }
    } else {
      return createResponse("404", "User not found");
    }
  }
}