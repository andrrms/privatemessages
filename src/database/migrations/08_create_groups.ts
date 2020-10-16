import knex from 'knex';

export const up = async (knex: knex) => {
  return knex.schema.createTable('groups', table => {
    table.increments('id').primary();
    table.integer('chat_id').notNullable();
    table.string('chat_title').notNullable();
    table.integer('chat_members_count').notNullable();
    table.boolean('chat_banned').notNullable().defaultTo(false);
  });
}

export const down = async (knex: knex) => {
  return knex.schema.dropTable('groups');
}