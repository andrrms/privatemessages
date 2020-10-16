import db from '../connection';
import { Message } from '../../utils/interfaces';

export default class MessagesController {
  async index(data?: string | number) {
    if (data && typeof data === 'string') {
      return await db('messages')
        .where({
          unique_callback_id: data,
        })
        .select('*')
        .first();
    } else if (data && typeof data === 'number') {
      return await db('messages')
        .where({
          id: data
        })
        .select('*')
        .first();
    } else {
      return await db('messages')
        .select('*');
    }
  }

  async create(message: Partial<Message>) {
    const inserts: Partial<Message> = {
      from_user_id: message.from_user_id,
      unique_callback_id: message.unique_callback_id,
      message: message.message,
      value: message.value,
    }

    return await db('messages')
      .insert(inserts);
  }

  async update(ucid: string, changes: Partial<Message>) {
    // Verify if a message with the given UCID exists
    const message = await db('messages')
      .where({
        unique_callback_id: ucid,
      })
      .select('*')
      .first();

    if (message) {
      return await db('messages')
        .where({
          unique_callback_id: ucid,
        })
        .update(changes);
    } else {
      return false;
    }
  }

  async delete(ucid: string) {
    return await db('messages')
      .where({
        unique_callback_id: ucid,
      })
      .delete();
  }
}