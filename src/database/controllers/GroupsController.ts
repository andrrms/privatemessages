import db from '../connection';
import { Group } from '../../utils/interfaces';

export default class GroupsController {
  async index(id?: number) {
    if (id) {
      return await db('groups')
        .where({ chat_id: id })
        .select('*')
        .first();
    } else {
      return await db('groups')
        .select('*');
    }
  }

  async create(chat: Partial<Group>) {
    const inserts: Partial<Group> = {
      chat_id: chat.chat_id,
      chat_title: chat.chat_title,
      chat_banned: chat.chat_banned,
      chat_members_count: chat.chat_members_count
    }

    return await db('groups')
      .insert(inserts);
  }

  async update(chat_id: number, changes: Partial<Group>) {
    // Check if chat exists
    const group = await db('groups')
      .where({ chat_id })
      .select('*')
      .first();

    if (group) {
      return await db('groups')
        .where({ chat_id })
        .update(changes);
    } else {
      return false;
    }
  }

  async delete(chat_id: number) {
    return await db('groups')
      .where({ chat_id })
      .delete();
  }
}