/**
 * Centrálna konfigurácia sessions.
 *
 * Poznámka:
 * - V produkcii odporúčam použiť persistent store (napr. Redis) namiesto default memory store.
 */

require("dotenv").config();

module.exports = {
  secret: process.env.SESSION_SECRET || "dev-session-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // V produkcii za HTTPS chceš secure cookies.
    secure: process.env.NODE_ENV === "production",
    // Pomáha proti CSRF; aj tak používame `csurf` pre POSTy.
    sameSite: "lax",
    // 24h
    maxAge: 24 * 60 * 60 * 1000,
  },
};
