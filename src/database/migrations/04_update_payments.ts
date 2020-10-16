import knex from 'knex';

export const up = (knex: knex) => {
  return knex.transaction((trx) => {
    return knex.schema.transacting(trx).table('payments', (table) => {
      table.renameColumn('buyer', 'buyer_id');
      table.renameColumn('seller', 'seller_id');
      table.renameColumn('message', 'message_id');
    });
  });
}

export const down = (knex: knex) => {
  return knex.schema.table('payments', (table) => {
    table.renameColumn('buyer_id', 'buyer');
    table.renameColumn('seller_id', 'seller');
    table.renameColumn('message_id', 'message');
  });
}