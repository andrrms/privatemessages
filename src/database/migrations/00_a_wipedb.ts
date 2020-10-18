import knex from 'knex';

export const up = async (knex: knex) => {
  await knex.schema.dropTable('users');
  await knex.schema.dropTable('payments');
  return await knex.schema.dropTable('messages');
}