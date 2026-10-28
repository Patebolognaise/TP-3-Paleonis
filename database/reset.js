// reset database
// load schema and data
require("dotenv").config({ quiet: true });
const fs = require("node:fs");
const path = require("node:path");
const pool = require("../src/config/db");

async function run(file) {
  const sql = fs.readFileSync(path.join(__dirname, file), "utf8");
  await pool.query(sql);
  console.log(`${file} chargé`);
}

run("schema.sql")
  .then(() => run("seed.sql"))
  .catch((err) => {
    console.error("Échec du chargement :", err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
