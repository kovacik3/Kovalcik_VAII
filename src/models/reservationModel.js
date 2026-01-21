const db = require("../db");

/**
 * Model pre tabuľku `reservations`.
 *
 * Obsahuje helpery pre:
 * - listovanie s detailmi (JOIN na sessions/users)
 * - kontrolu duplikátu rezervácie (session_id + user_id)
 * - kontrolu kapacity tréningu (COUNT)
 */

async function listWithDetails({ isStaff, userId }) {
  // Staff vidí všetky rezervácie, user iba svoje.
  let sql =
    `SELECT 
       r.id,
       r.client_name,
       r.note,
       r.created_at,
       u.email AS user_email,
       u.username AS client_username,
       s.title AS session_title,
       s.start_at AS session_start
     FROM reservations r
     JOIN sessions s ON r.session_id = s.id
     LEFT JOIN users u ON r.user_id = u.id`;
  const params = [];
  if (!isStaff) {
    sql += "\n     WHERE r.user_id = ?";
    params.push(userId);
  }
  sql += "\n     ORDER BY r.created_at DESC";

  const [rows] = await db.query(sql, params);
  return rows;
}

async function existsForUser(sessionId, userId) {
  const [rows] = await db.query(
    "SELECT id FROM reservations WHERE session_id = ? AND user_id = ? LIMIT 1",
    [sessionId, userId]
  );
  return rows.length > 0;
}

async function countForSession(sessionId) {
  // Použité pri kontrole kapacity tréningu.
  const [rows] = await db.query(
    "SELECT COUNT(*) AS cnt FROM reservations WHERE session_id = ?",
    [sessionId]
  );
  return Number(rows?.[0]?.cnt) || 0;
}

async function create({ session_id, client_name, note, user_id }) {
  await db.query(
    "INSERT INTO reservations (session_id, client_name, note, user_id) VALUES (?, ?, ?, ?)",
    [session_id, client_name, note, user_id]
  );
}

async function remove({ reservationId, isStaff, userId }) {
  let result;
  if (isStaff) {
    [result] = await db.query("DELETE FROM reservations WHERE id = ?", [reservationId]);
  } else {
    [result] = await db.query(
      "DELETE FROM reservations WHERE id = ? AND user_id = ?",
      [reservationId, userId]
    );
  }
  return result;
}

module.exports = {
  listWithDetails,
  existsForUser,
  countForSession,
  create,
  remove,
};
