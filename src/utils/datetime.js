/**
 * Utility pre prácu s dátumom/časom.
 *
 * V UI používame input type="datetime-local" (format: YYYY-MM-DDTHH:MM).
 * MySQL typicky očakáva `YYYY-MM-DD HH:MM:SS`.
 */
function datetimeLocalToMySql(value) {
  // input: "YYYY-MM-DDTHH:MM" -> output: "YYYY-MM-DD HH:MM:SS"
  if (!value || typeof value !== "string") return null;
  return value.replace("T", " ") + ":00";
}

function datetimeLocalToDate(value) {
  // Pomocné: pre renderovanie do formulára (EJS) / validáciu.
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

module.exports = {
  datetimeLocalToMySql,
  datetimeLocalToDate,
};
