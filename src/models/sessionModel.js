const db = require("../db");

async function listAllWithTrainer() {
  const [rows] = await db.query(
    `SELECT 
       s.id,
       s.title,
       s.start_at,
       s.end_at,
       s.capacity,
       t.name AS trainer_name
     FROM sessions s
     LEFT JOIN trainers t ON s.trainer_id = t.id
     ORDER BY s.start_at`
  );
  return rows;
}

async function getUpcomingHome(limit = 3) {
  const [rows] = await db.query(
    `SELECT 
       s.id,
       s.title as nazov,
       DATE_FORMAT(s.start_at, '%W') as den,
       DATE_FORMAT(s.start_at, '%H:%i') as cas
     FROM sessions s
     WHERE s.start_at > NOW()
     ORDER BY s.start_at
     LIMIT ?`,
    [Number(limit)]
  );
  return rows;
}

async function getById(id) {
  const [rows] = await db.query(
    "SELECT id, title, start_at, end_at, capacity, trainer_id FROM sessions WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function getForReservationNew(id) {
  const [rows] = await db.query(
    "SELECT id, title, start_at FROM sessions WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function create({ title, start_at, end_at, capacity, trainer_id }) {
  await db.query(
    `INSERT INTO sessions (title, start_at, end_at, capacity, trainer_id)
     VALUES (?, ?, ?, ?, ?)`,
    [title, start_at, end_at, capacity, trainer_id]
  );
}

async function update(id, { title, start_at, end_at, capacity, trainer_id }) {
  await db.query(
    `UPDATE sessions
     SET title = ?, start_at = ?, end_at = ?, capacity = ?, trainer_id = ?
     WHERE id = ?`,
    [title, start_at, end_at, capacity, trainer_id, id]
  );
}

async function remove(id) {
  await db.query("DELETE FROM sessions WHERE id = ?", [id]);
}

async function cleanupExpiredSessions() {
  const [resSessions] = await db.query(
    `DELETE FROM sessions
     WHERE end_at IS NOT NULL AND end_at < NOW()`
  );
  return resSessions?.affectedRows || 0;
}

module.exports = {
  listAllWithTrainer,
  getUpcomingHome,
  getById,
  getForReservationNew,
  create,
  update,
  remove,
  cleanupExpiredSessions,
};
