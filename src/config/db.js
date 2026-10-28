const { Pool, types } = require("pg");

// date
types.setTypeParser(types.builtins.DATE, (value) => value);

// prix numerique
types.setTypeParser(types.builtins.NUMERIC, (value) => parseFloat(value));

// pool connexion
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;
