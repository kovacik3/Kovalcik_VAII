/**
 * Seed skript – naplní databázu základnými dátami (users, trainers, sessions, reservations).
 *
 * Použitie: `npm run seed`
 *
 * Upozornenie:
 * - Pre existujúce e-maily robí UPSERT a môže prepísať heslo/roly podľa `.env`.
 * - Pred spustením musí byť importovaná DB schéma (`MySQL/schema.sql`).
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const db = require("./db");

function deriveUsernameFromEmail(email) {
  // Jednoduché odvodenie username z emailu (časť pred @).
  if (!email || typeof email !== "string") return "user";
  const at = email.indexOf("@");
  if (at <= 0) return email.trim() || "user";
  return email.slice(0, at).trim() || "user";
}

function normalizeRequiredString(value, fallback) {
  const v = (value || "").toString().trim();
  return v.length > 0 ? v : fallback;
}

function pad2(n) {
  return n.toString().padStart(2, "0");
}

function toMySqlDatetime(d) {
  // Formát pre MySQL DATETIME: YYYY-MM-DD HH:MM:SS (lokálny čas)
  return (
    d.getFullYear() +
    "-" +
    pad2(d.getMonth() + 1) +
    "-" +
    pad2(d.getDate()) +
    " " +
    pad2(d.getHours()) +
    ":" +
    pad2(d.getMinutes()) +
    ":" +
    pad2(d.getSeconds())
  );
}

function buildFutureDate({ daysFromNow, hour, minute }) {
  const d = new Date();
  d.setSeconds(0, 0);
  d.setDate(d.getDate() + Number(daysFromNow || 0));
  d.setHours(Number(hour || 0), Number(minute || 0), 0, 0);
  return d;
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
  {
    email: "kovalcik3@gmail.com",
    username: "kovalcik3",
    first_name: "Jozef",
    last_name: "Kovačík",
    password: "josko123",
    role: "user",
  },
];

const trainers = [
  {
    name: "Peter Pumpos",
    specialization: "Trening s pumpou",
    photo_path: "/images/trener1.jpg",
  },
  {
    name: "Mária Jógová",
    specialization: "Jóga a mobilita",
    photo_path: "/images/trenerw4.jpg",
  },
  {
    name: "Tomáš Kondičný",
    specialization: "Kondičné tréningy",
    photo_path: "/images/trener3.jpg",
  },
  {
    name: "Martin Železo",
    specialization: "Ťežky váhy",
    photo_path: "/images/trener2.jpg",
  },
];

function buildSeedSessions() {
  // Dynamicky do budúcnosti, aby sa zobrazovali aj na domovskej stránke (start_at > NOW())
  const s1Start = buildFutureDate({ daysFromNow: 1, hour: 18, minute: 0 });
  const s1End = new Date(s1Start.getTime() + 60 * 60 * 1000);

  const s2Start = buildFutureDate({ daysFromNow: 2, hour: 17, minute: 30 });
  const s2End = new Date(s2Start.getTime() + 60 * 60 * 1000);

  const s3Start = buildFutureDate({ daysFromNow: 3, hour: 19, minute: 0 });
  const s3End = new Date(s3Start.getTime() + 75 * 60 * 1000);

  const s4Start = buildFutureDate({ daysFromNow: 4, hour: 16, minute: 0 });
  const s4End = new Date(s4Start.getTime() + 45 * 60 * 1000);

  return [
    {
      title: "Silový tréning – full body",
      start_at: toMySqlDatetime(s1Start),
      end_at: toMySqlDatetime(s1End),
      capacity: 12,
      trainer_name: "Peter Tréner",
    },
    {
      title: "Jóga pre začiatočníkov",
      start_at: toMySqlDatetime(s2Start),
      end_at: toMySqlDatetime(s2End),
      capacity: 20,
      trainer_name: "Mária Jógová",
    },
    {
      title: "Kruhový tréning",
      start_at: toMySqlDatetime(s3Start),
      end_at: toMySqlDatetime(s3End),
      capacity: 16,
      trainer_name: "Tomáš Kondičný",
    },
    {
      title: "Mobilita a core",
      start_at: toMySqlDatetime(s4Start),
      end_at: toMySqlDatetime(s4End),
      capacity: 18,
      trainer_name: "Mária Jógová",
    },
  ];
}

async function upsertTrainerByName({ name, specialization, photo_path = null }) {
  // UPSERT trénera podľa mena (v tomto projekte je to jednoduchý identifikátor pre seedovanie).
  const [rows] = await db.query("SELECT id FROM trainers WHERE name = ? LIMIT 1", [name]);
  if (rows.length > 0) {
    // Aktualizujeme špecializáciu, aby seed vedel upratať staré dáta.
    await db.query("UPDATE trainers SET specialization = ?, photo_path = ? WHERE id = ?", [
      specialization,
      photo_path,
      rows[0].id,
    ]);
    return rows[0].id;
  }

  const [result] = await db.query(
    "INSERT INTO trainers (name, specialization, photo_path) VALUES (?, ?, ?)",
    [name, specialization, photo_path]
  );
  return result.insertId;
}

async function ensureSession({ title, start_at, end_at, capacity, trainer_id }) {
  // Session identifikujeme kombináciou (title + start_at), aby sa seed dal spúšťať opakovane.
  const [existing] = await db.query(
    "SELECT id FROM sessions WHERE title = ? AND start_at = ? LIMIT 1",
    [title, start_at]
  );

  if (existing.length > 0) {
    await db.query(
      "UPDATE sessions SET end_at = ?, capacity = ?, trainer_id = ? WHERE id = ?",
      [end_at, Number(capacity), trainer_id ?? null, existing[0].id]
    );
    return existing[0].id;
  }

  const [result] = await db.query(
    "INSERT INTO sessions (title, start_at, end_at, capacity, trainer_id) VALUES (?, ?, ?, ?, ?)",
    [title, start_at, end_at, Number(capacity), trainer_id ?? null]
  );
  return result.insertId;
}

async function getUserByEmail(email) {
  const [rows] = await db.query(
    "SELECT id, email, username, first_name, last_name FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] || null;
}

async function ensureReservation({ session_id, user_id, client_name, note = null }) {
  // Rezervácie v schéme majú unikát (session_id, user_id) – vďaka tomu vieme robiť UPSERT.
  await db.query(
    `INSERT INTO reservations (session_id, client_name, note, user_id)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       client_name = VALUES(client_name),
       note = VALUES(note)`,
    [session_id, client_name, note, user_id]
  );
}

(async () => {
  try {
    console.log("Seeding users... môže prepísať heslá pre existujúce e-maily.");

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

    console.log("Seeding trainers...");
    const trainerIdsByName = new Map();
    for (const t of trainers) {
      const name = normalizeRequiredString(t.name, "Tréner");
      const specialization = normalizeRequiredString(t.specialization, "Všeobecný tréning");
      const photo_path = normalizeRequiredString(t.photo_path, null);
      const id = await upsertTrainerByName({ name, specialization, photo_path });
      trainerIdsByName.set(name, id);
      console.log(`Upserted trainer ${name} (id=${id}).`);
    }
    console.log("Trainer seeding finished.");

    console.log("Seeding sessions (tréningy)...");
    const sessions = buildSeedSessions();
    const ensuredSessionIds = [];
    for (const s of sessions) {
      const trainer_id = s.trainer_name ? trainerIdsByName.get(s.trainer_name) ?? null : null;
      const id = await ensureSession({
        title: normalizeRequiredString(s.title, "Tréning"),
        start_at: s.start_at,
        end_at: s.end_at,
        capacity: Number(s.capacity || 10),
        trainer_id,
      });
      ensuredSessionIds.push(id);
      console.log(`Ensured session ${s.title} @ ${s.start_at} (id=${id}).`);
    }
    console.log("Session seeding finished.");

    console.log("Seeding reservations (user1/user2)...");
    const user1Email = normalizeRequiredString(process.env.USER_ONE_EMAIL || "user1@gym.local", "user1@gym.local");
    const user2Email = normalizeRequiredString(process.env.USER_TWO_EMAIL || "user2@gym.local", "user2@gym.local");

    const user1 = await getUserByEmail(user1Email);
    const user2 = await getUserByEmail(user2Email);

    const s1Id = ensuredSessionIds[0] || null;
    const s2Id = ensuredSessionIds[1] || ensuredSessionIds[0] || null;

    if (user1 && s1Id) {
      const clientName = `${user1.first_name} ${user1.last_name}`.trim() || user1.username || "User One";
      await ensureReservation({
        session_id: s1Id,
        user_id: user1.id,
        client_name: clientName,
        note: "Seed: automatická rezervácia (user1)",
      });
      console.log(`Ensured reservation: ${user1.email} -> session_id=${s1Id}`);
    } else {
      console.log("Skipped reservation for user1 (missing user or session).");
    }

    if (user2 && s2Id) {
      const clientName = `${user2.first_name} ${user2.last_name}`.trim() || user2.username || "User Two";
      await ensureReservation({
        session_id: s2Id,
        user_id: user2.id,
        client_name: clientName,
        note: "Seed: automatická rezervácia (user2)",
      });
      console.log(`Ensured reservation: ${user2.email} -> session_id=${s2Id}`);
    } else {
      console.log("Skipped reservation for user2 (missing user or session).");
    }

    console.log("Reservation seeding finished.");
  } catch (err) {
    if (err.code === "ER_NO_SUCH_TABLE") {
      console.error(
        "Niektorá tabuľka neexistuje (users/trainers/sessions). Najprv naimportuj schému (schema.sql) do vybranej DB a až potom spusti seed."
      );
    } else {
      console.error("Chyba pri seedovaní užívateľov:", err);
    }
    process.exitCode = 1;
  } finally {
    await db.end();
  }
})();
