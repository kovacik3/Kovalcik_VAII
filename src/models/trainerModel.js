const db = require("../db");

async function listAll() {
  const [rows] = await db.query("SELECT id, name, specialization FROM trainers");
  return rows;
}

async function getById(id) {
  const [rows] = await db.query(
    "SELECT id, name, specialization FROM trainers WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function listForSelect() {
  const [rows] = await db.query("SELECT id, name FROM trainers ORDER BY name");
  return rows;
}

async function create({ name, specialization }) {
  await db.query("INSERT INTO trainers (name, specialization) VALUES (?, ?)", [
    name,
    specialization,
  ]);
}

async function update(id, { name, specialization }) {
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
