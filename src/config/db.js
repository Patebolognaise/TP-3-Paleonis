const { Pool, types } = require("pg");

// DATE : on garde la chaîne "YYYY-MM-DD". Sinon pg crée un Date à minuit heure locale,
// qui ressort décalé d'un jour en UTC dans le JSON ("2024-01-14T23:00:00.000Z").
types.setTypeParser(types.builtins.DATE, (value) => value);

// NUMERIC : pg le renvoie en chaîne pour ne pas perdre de précision.
// Nos prix (NUMERIC(10,2)) tiennent sans problème dans un nombre JS.
types.setTypeParser(types.builtins.NUMERIC, (value) => parseFloat(value));

// Un pool garde quelques connexions ouvertes et les prête à chaque requête
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;
