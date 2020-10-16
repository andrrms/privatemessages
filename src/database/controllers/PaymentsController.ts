import db from '../connection';
import { Payment } from '../../utils/interfaces';

export default class PaymentsController {
  async index(message_id?: number) {
    if (message_id) {
      return await db('payments')
        .where({
          message_id
        })
        .select('*')
        .first();
    } else {
      return await db('payments')
        .select('*');
    }
  }

  async create(payment: Partial<Payment>) {
    const inserts: Partial<Payment> = {
      message_id: payment.message_id,
      buyer_id: payment.buyer_id,
      seller_id: payment.seller_id
    }

    return await db('payments')
      .insert(inserts);
  }

  async delete(payment_id: number) {
    return await db('payments')
      .where({ id: payment_id })
      .delete();
  }
}