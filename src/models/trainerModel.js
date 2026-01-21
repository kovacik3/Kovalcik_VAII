const db = require("../db");

/**
 * Model pre tabuľku `trainers`.
 * Obsahuje CRUD operácie a pomocné výpisy (napr. pre <select>).
 */

async function listAll() {
  // Výpis trénerov pre verejnú stránku.
  const [rows] = await db.query("SELECT id, name, specialization, photo_path FROM trainers");
  return rows;
}

async function getById(id) {
  const [rows] = await db.query(
    "SELECT id, name, specialization, photo_path FROM trainers WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function listForSelect() {
  // Minimalistický výpis pre dropdown (id + name).
  const [rows] = await db.query("SELECT id, name FROM trainers ORDER BY name");
  return rows;
}

async function create({ name, specialization, photo_path = null }) {
  const [res] = await db.query(
    "INSERT INTO trainers (name, specialization, photo_path) VALUES (?, ?, ?)",
    [name, specialization, photo_path]
  );
  return res.insertId;
}

async function update(id, { name, specialization, photo_path }) {
  if (photo_path !== undefined) {
    await db.query(
      "UPDATE trainers SET name = ?, specialization = ?, photo_path = ? WHERE id = ?",
      [name, specialization, photo_path, id]
    );
    return;
  }

  await db.query("UPDATE trainers SET name = ?, specialization = ? WHERE id = ?", [
    name,
    specialization,
    id,
  ]);
}

async function remove(id) {
  await db.query("DELETE FROM trainers WHERE id = ?", [id]);
}

module.exports = {
  listAll,
  getById,
  listForSelect,
  create,
  update,
  remove,
};
