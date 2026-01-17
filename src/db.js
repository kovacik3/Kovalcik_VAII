// Načítame .env (DB údaje, heslá)
require("dotenv").config();
const mysql = require("mysql2");

// Vytvoríme pool pripojení na MySQL, aby sa spojenia recyklovali
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",           
  password: process.env.DB_PASSWORD || "VAII", 
  database: process.env.DB_NAME || "gym_rezervacie",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Exportujeme promisified verziu poolu (ľahšie await-ovanie)
module.exports = pool.promise();
