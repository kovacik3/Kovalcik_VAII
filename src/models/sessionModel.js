const db = require("../db");

/**
 * Model pre tabuľku `sessions` (tréningy).
 *
 * Tento model nerieši autorizáciu – to je na úrovni routes/middlewares.
 * Funkcie tu vracajú buď:
 * - pole riadkov (rows)
 * - jeden riadok alebo null
 */

async function listAllWithTrainer(options = {}) {
  const trainerIdRaw = options?.trainerId;
  const trainerId = trainerIdRaw === null || trainerIdRaw === undefined ? null : Number(trainerIdRaw);

  // Zoznam tréningov + meno trénera (LEFT JOIN, lebo trainer_id môže byť NULL)
  let sql =
    `SELECT 
       s.id,
       s.title,
       s.start_at,
       s.end_at,
       s.capacity,
       t.name AS trainer_name
     FROM sessions s
     LEFT JOIN trainers t ON s.trainer_id = t.id`;

  const params = [];
  if (trainerIdRaw !== null && trainerIdRaw !== undefined && trainerIdRaw !== "") {
    if (!Number.isNaN(trainerId) && Number.isFinite(trainerId)) {
      sql += "\n     WHERE s.trainer_id = ?";
      params.push(trainerId);
    }
  }

  sql += "\n     ORDER BY s.start_at";

  const [rows] = await db.query(sql, params);
  return rows;
}

async function getUpcomingHome(limit = 3) {
  // Home page potrebuje „ľahké“ dáta – názov + deň + čas v už formátovanej podobe.
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
    "SELECT id, title, start_at, capacity FROM sessions WHERE id = ?",
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
  // Automatické čistenie: zmažeme tréningy, ktoré už skončili.
  // Rezervácie sa zmažú cez FOREIGN KEY ON DELETE CASCADE (v DB schéme).
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
