/**
 * Pomocná utilita pre bezpečné spracovanie ID (route param/query/body).
 *
 * Cieľ: mať jednotnú server-side validáciu typu "pozitívne celé číslo".
 */

function parsePositiveInt(value) {
  // Akceptuje string/number; vráti celé číslo > 0 alebo null.
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  if (n <= 0) return null;
  return n;
}

module.exports = {
  parsePositiveInt,
};
