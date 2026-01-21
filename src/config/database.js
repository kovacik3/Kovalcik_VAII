/**
 * Centrálna konfigurácia DB (MySQL pool).
 *
 * Používame mysql2 pool + promise API.
 * Premenné sú v `.env`:
 * - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
 */

require("dotenv").config();
const mysql = require("mysql2");

if (!process.env.DB_NAME) {
  throw new Error(
    "Chýba DB_NAME v .env. Nastav názov databázy, do ktorej si importoval schema.sql (napr. DB_NAME=moja_databaza)."
  );
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "VAII",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Exportujeme promise pool, aby modely mohli používať `await db.query(...)`.
module.exports = pool.promise();
