import knex from 'knex';

export const up = (knex: knex) => {
  return knex.schema.createTable('payments', table => {
    table.increments('id').primary();
    table.integer('buyer').notNullable();
    table.integer('seller').notNullable();
    table.integer('message').notNullable().references('messages.id');
  });
}

export const down = (knex: knex) => {
  return knex.schema.dropTable('users');
}