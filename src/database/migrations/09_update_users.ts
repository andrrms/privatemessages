import knex from 'knex';

export const up = (knex: knex) => {
  return knex.transaction((trx) => {
    return knex.schema.transacting(trx).table('users', (table) => {
      table.string('language').notNullable().defaultTo('pt-BR');
    });
  });
}

export const down = (knex: knex) => {
  return knex.schema.table('users', (table) => {
    table.dropColumn('language');
  });
}