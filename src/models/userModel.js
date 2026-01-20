const db = require("../db");

async function findAuthUserByEmail(email) {
  const [rows] = await db.query(
    "SELECT id, email, username, password_hash, role FROM users WHERE email = ?",
    [email]
  );
  return rows[0] || null;
}

async function existsByEmail(email) {
  const [rows] = await db.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
  return rows.length > 0;
}

async function createUser({ email, username, first_name, last_name, password_hash, role }) {
  const [result] = await db.query(
    "INSERT INTO users (email, username, first_name, last_name, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)",
    [email, username, first_name, last_name, password_hash, role]
  );
  return result.insertId;
}

module.exports = {
  findAuthUserByEmail,
  existsByEmail,
  createUser,
};
