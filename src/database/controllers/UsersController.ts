import db from '../connection';
import { User } from '../../utils/interfaces';

export default class UsersController {
  async index(data?: number | string) {
    if (data && typeof data === 'number') {
      return await db('users')
        .where({ user_id: data })
        .select('*')
        .first();
    } else if (data && typeof data === 'string') {
      return await db('users')
        .where({ username: data })
        .select('*')
        .first();
    } else {
      return await db('users')
        .select('*');
    }
  }

  async create(user: Partial<User>) {
    const inserts: Partial<User> = {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
    }

    return await db('users')
      .insert(inserts);
  }

  async update(user_id: number, changes: Partial<User>) {
    // Check if user exists
    const user = await db('users')
      .where({ user_id })
      .select('*')
      .first();

    if (user) {
      return await db('users')
        .where({ user_id })
        .update(changes);
    } else {
      return false;
    }
  }

  async updateWhere(column: string, match: string | number, changes: Partial<User>) {
    // Check if user exists
    const user = await db('users')
      .where(column, '=', match)
      .select('*')
      .first();

    if (user) {
      return await db('users')
        .where(column, '=', match)
        .update(changes);
    } else {
      return false;
    }
  }

  async delete(user_id: number) {
    return await db('users')
      .where({ user_id })
      .delete();
  }
}