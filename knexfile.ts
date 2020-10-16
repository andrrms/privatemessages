const path = require('path');
const dotenv = require('dotenv').config();

module.exports =
  (process.env.NODE_ENV === 'PRODUCTION') ?
    {
      client: 'pg',
      connection: process.env.DATABASE_URL,
      migrations: {
        directory: path.join(__dirname, 'src', 'database', 'migrations'),
      },
      useNullAsDefault: true,
    } : {
      client: 'sqlite3',
      connection: {
        filename: path.join(__dirname, 'src', 'database', 'db.sqlite'),
      },
      migrations: {
        directory: path.join(__dirname, 'src', 'database', 'migrations'),
      },
      useNullAsDefault: true,
    }