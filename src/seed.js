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

const users = [
  {
    email: process.env.ADMIN_EMAIL || "admin@gym.local",
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin123",
    role: "admin",
  },
  {
    email: process.env.TRAINER_EMAIL || "trainer@gym.local",
    username: process.env.TRAINER_USERNAME || "trainer",
    password: process.env.TRAINER_PASSWORD || "trainer123",
    role: "trainer",
  },
  {
    email: process.env.USER_ONE_EMAIL || "user1@gym.local",
    username: process.env.USER_ONE_USERNAME || "user1",
    password: process.env.USER_ONE_PASSWORD || "userone123",
    role: "user",
  },
  {
    email: process.env.USER_TWO_EMAIL || "user2@gym.local",
    username: process.env.USER_TWO_USERNAME || "user2",
    password: process.env.USER_TWO_PASSWORD || "usertwo123",
    role: "user",
  },
];

(async () => {
  try {
    console.log("Seeding users... this may overwrite passwords for existing emails.");

    for (const u of users) {
      const email = u.email;
      const password = u.password;
      const role = u.role;
      const username = u.username || deriveUsernameFromEmail(email);

      const passwordHash = await bcrypt.hash(password, 10);

      await db.query(
        `INSERT INTO users (email, username, password_hash, role)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE username = VALUES(username), password_hash = VALUES(password_hash), role = VALUES(role)`,
        [email, username, passwordHash, role]
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
