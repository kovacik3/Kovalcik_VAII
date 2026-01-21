const db = require("../db");

/**
 * Model pre tabuľku `users`.
 *
 * Poznámka:
 * - autentifikácia používa bcrypt hash uložený v `password_hash`
 * - roly sú: admin / trainer / user
 */

async function findAuthUserByEmail(email) {
  // Vraciame aj `password_hash` – iba pre účely prihlásenia.
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

async function listAllUsers() {
  const [rows] = await db.query(
    "SELECT id, email, username, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC"
  );
  return rows;
}

async function getById(id) {
  const [rows] = await db.query(
    "SELECT id, email, username, first_name, last_name, role, created_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function updateRole(id, role) {
  const [res] = await db.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
  return res?.affectedRows || 0;
}

async function updateProfile(id, { username, first_name, last_name, password_hash }) {
  // Upravujeme len bezpečné profilové polia.
  // email/role sa tu zámerne nemenia.
  const fields = [];
  const params = [];

  if (username !== undefined) {
    fields.push("username = ?");
    params.push(username);
  }
  if (first_name !== undefined) {
    fields.push("first_name = ?");
    params.push(first_name);
  }
  if (last_name !== undefined) {
    fields.push("last_name = ?");
    params.push(last_name);
  }
  if (password_hash !== undefined) {
    fields.push("password_hash = ?");
    params.push(password_hash);
  }

  if (fields.length === 0) {
    return 0;
  }

  params.push(id);
  const [res] = await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, params);
  return res?.affectedRows || 0;
}

module.exports = {
  findAuthUserByEmail,
  existsByEmail,
  createUser,
  listAllUsers,
  getById,
  updateRole,
  updateProfile,
};
