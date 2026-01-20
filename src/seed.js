// Generated with AI: seeds default user accounts for the gym reservation portal.
require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("./db");

function deriveUsernameFromEmail(email) {
  if (!email || typeof email !== "string") return "user";
  const at = email.indexOf("@");
  if (at <= 0) return email.trim() || "user";
  return email.slice(0, at).trim() || "user";
}

function normalizeRequiredString(value, fallback) {
  const v = (value || "").toString().trim();
  return v.length > 0 ? v : fallback;
}

const users = [
  {
    email: process.env.ADMIN_EMAIL || "admin@gym.local",
    username: process.env.ADMIN_USERNAME || "admin",
    first_name: process.env.ADMIN_FIRST_NAME || "Admin",
    last_name: process.env.ADMIN_LAST_NAME || "Gym",
    password: process.env.ADMIN_PASSWORD || "admin123",
    role: "admin",
  },
  {
    email: process.env.TRAINER_EMAIL || "trainer@gym.local",
    username: process.env.TRAINER_USERNAME || "trainer",
    first_name: process.env.TRAINER_FIRST_NAME || "Trainer",
    last_name: process.env.TRAINER_LAST_NAME || "Gym",
    password: process.env.TRAINER_PASSWORD || "trainer123",
    role: "trainer",
  },
  {
    email: process.env.USER_ONE_EMAIL || "user1@gym.local",
    username: process.env.USER_ONE_USERNAME || "user1",
    first_name: process.env.USER_ONE_FIRST_NAME || "User",
    last_name: process.env.USER_ONE_LAST_NAME || "One",
    password: process.env.USER_ONE_PASSWORD || "userone123",
    role: "user",
  },
  {
    email: process.env.USER_TWO_EMAIL || "user2@gym.local",
    username: process.env.USER_TWO_USERNAME || "user2",
    first_name: process.env.USER_TWO_FIRST_NAME || "User",
    last_name: process.env.USER_TWO_LAST_NAME || "Two",
    password: process.env.USER_TWO_PASSWORD || "usertwo123",
    role: "user",
  },
];

(async () => {
  try {
    console.log("Seeding users... this may overwrite passwords for existing emails.");

    for (const u of users) {
      const email = normalizeRequiredString(u.email, "user@gym.local");
      const password = normalizeRequiredString(u.password, "changeme123");
      const role = normalizeRequiredString(u.role, "user");

      // Username je nezávislé od mena/priezviska – môže byť čokoľvek (napr. kovalcik3)
      const username = normalizeRequiredString(u.username, deriveUsernameFromEmail(email));

      // first_name/last_name musí byť explicitne, lebo DB schéma ich má ako NOT NULL
      const first_name = normalizeRequiredString(u.first_name, "User");
      const last_name = normalizeRequiredString(u.last_name, "Seed");

      const passwordHash = await bcrypt.hash(password, 10);

      await db.query(
        `INSERT INTO users (email, username, first_name, last_name, password_hash, role)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           username = VALUES(username),
           first_name = VALUES(first_name),
           last_name = VALUES(last_name),
           password_hash = VALUES(password_hash),
           role = VALUES(role)`,
        [email, username, first_name, last_name, passwordHash, role]
      );
      console.log(`Upserted user ${email} (${role}).`);
    }

    console.log("User seeding finished.");
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE") {
      console.error("Tabuľka 'users' neexistuje. Vytvor ju pomocou CREATE TABLE ... pred spustením seed skriptu.");
    } else {
      console.error("Chyba pri seedovaní užívateľov:", err);
    }
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
