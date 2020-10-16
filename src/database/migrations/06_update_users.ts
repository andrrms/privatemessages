import knex from 'knex';

export const up = (knex: knex) => {
  return knex.transaction((trx) => {
    return knex.schema.transacting(trx).table('users', (table) => {
      table.boolean('notifications').notNullable().defaultTo(true);
      table.integer('pole_ouro').notNullable().defaultTo(0);
      table.integer('pole_prata').notNullable().defaultTo(0);
      table.integer('pole_bronze').notNullable().defaultTo(0);
    });
  });
}

export const down = (knex: knex) => {
  return knex.schema.table('users', (table) => {
    table.dropColumn('notifications');
    table.dropColumn('pole_ouro');
    table.dropColumn('pole_prata');
    table.dropColumn('pole_bronze');
  });
}