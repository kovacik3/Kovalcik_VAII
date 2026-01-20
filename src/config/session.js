// Central session configuration

require("dotenv").config();

module.exports = {
  secret: process.env.SESSION_SECRET || "dev-session-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    // In production behind HTTPS you want secure cookies.
    secure: process.env.NODE_ENV === "production",
    // Helps against CSRF; still keep csurf for form posts.
    sameSite: "lax",
    // 24h
    maxAge: 24 * 60 * 60 * 1000,
  },
};
