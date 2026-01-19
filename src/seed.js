// Generated with AI: seeds default user accounts for the gym reservation portal.
require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("./db");

const users = [
  {
    email: process.env.ADMIN_EMAIL || "admin@gym.local",
    password: process.env.ADMIN_PASSWORD || "admin123",
    role: "admin",
  },
  {
    email: process.env.TRAINER_EMAIL || "trainer@gym.local",
    password: process.env.TRAINER_PASSWORD || "trainer123",
    role: "trainer",
  },
  {
    email: process.env.USER_ONE_EMAIL || "user1@gym.local",
    password: process.env.USER_ONE_PASSWORD || "userone123",
    role: "user",
  },
  {
    email: process.env.USER_TWO_EMAIL || "user2@gym.local",
    password: process.env.USER_TWO_PASSWORD || "usertwo123",
    role: "user",
  },
];

(async () => {
  try {
    console.log("Seeding users... this may overwrite passwords for existing emails.");

    for (const { email, password, role } of users) {
      const passwordHash = await bcrypt.hash(password, 10);
      await db.query(
        `INSERT INTO users (email, password_hash, role)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)`,
        [email, passwordHash, role]
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
