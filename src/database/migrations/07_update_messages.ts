import knex from 'knex';

export const up = (knex: knex) => {
  return knex.transaction((trx) => {
    return knex.schema.transacting(trx).table('messages', (table) => {
      table.renameColumn('price', 'value');
    });
  });
}

export const down = (knex: knex) => {
  return knex.schema.table('messages', (table) => {
    table.renameColumn('value', 'price');
  });
}