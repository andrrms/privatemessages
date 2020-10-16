import knex from 'knex';

export const up = async (knex: knex) => {
  return knex.schema.createTable('users', table => {
    table.increments('id').primary();
    table.integer('user_id').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name');
    table.string('username');
    table.integer('coins').notNullable().defaultTo(750);
    table.boolean('is_banned').notNullable().defaultTo(false);
    table.boolean('is_admin').notNullable().defaultTo(false);
  });
}

export const down = async (knex: knex) => {
  return knex.schema.dropTable('users');
}