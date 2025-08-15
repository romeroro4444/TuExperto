const { Pool } = require("pg");
const { db } = require("./config");

const config = {
  user: db.user,
  host: db.host,
  password: db.password,
  port: db.port,
  database: db.database,
};

const pool = new Pool(config);

module.exports = pool;
