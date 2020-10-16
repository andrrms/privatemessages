import knex from 'knex';

export const up = (knex: knex) => {
  return knex.schema.createTable('messages', table => {
    table.increments('id').primary();
    table.string('from_user_id').notNullable();
    table.integer('price').notNullable();
    table.string('message').notNullable();
    table.string('unique_callback_id', 64).notNullable();
    table.string('buyers').notNullable();
  });
}

export const down = (knex: knex) => {
  return knex.schema.dropTable('messages');
}