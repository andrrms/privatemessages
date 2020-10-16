import knex from 'knex';

const def = {
  message: '*$firstname* está vendendo uma mensagem por *$valuec*',
  pay_once: true
};

export const up = (knex: knex) => {
  return knex.transaction((trx) => {
    return knex.schema.transacting(trx).table('users', (table) => {
      table.string('sell_msg').notNullable().defaultTo(def.message);
      table.boolean('pay_once').notNullable().defaultTo(true);
    });
  });
}

export const down = (knex: knex) => {
  return knex.schema.table('users', (table) => {
    table.dropColumn('sell_msg');
    table.dropColumn('pay_once');
  });
}