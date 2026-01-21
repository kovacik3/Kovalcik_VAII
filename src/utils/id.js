// Generated with AI: small helper for consistent server-side ID validation.

function parsePositiveInt(value) {
  // Accepts strings/numbers; returns integer > 0 or null.
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  if (n <= 0) return null;
  return n;
}

module.exports = {
  parsePositiveInt,
};
