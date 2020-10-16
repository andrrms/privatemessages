import { Message } from '../../utils/interfaces';
import { createResponse } from '../../utils/util';
import MessagesController from '../controllers/MessagesController';

const Controller = new MessagesController();

export default class MessageServices {
  async registerNewMessage(message: Partial<Message>) {
    const create = Controller.create({
      unique_callback_id: message.unique_callback_id,
      from_user_id: message.from_user_id,
      message: message.message,
      value: message.value
    });

    return (create) ?
      createResponse("201") :
      createResponse("406")
  }

  async getMessageFromId(message_id: number) {
    const message = await Controller.index(message_id);

    return (message) ?
      createResponse("200", message) :
      createResponse("404");
  }

  async getMessageFromUCID(ucid: string) {
    const message = await Controller.index(ucid);

    return (message) ?
      createResponse("200", message) :
      createResponse("404");
  }

  async getSellerIdFromMsgUCID(ucid: string) {
    const message = await Controller.index(ucid);

    return (message) ?
      createResponse("200", message['from_user_id']) :
      createResponse("404");
  }
}