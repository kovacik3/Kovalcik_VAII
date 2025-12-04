const express = require("express");
const path = require("path");
const db = require("./db"); 

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.static(path.join(__dirname, "..", "public")));
app.use(express.urlencoded({ extended: true }));
  
app.get("/", (req, res) => {
  const nadchadzajuceTreningy = [
    { nazov: "Silový tréning", den: "Pondelok", cas: "18:00" },
    { nazov: "HIIT tréning", den: "Streda", cas: "19:00" },
    { nazov: "Full body", den: "Piatok", cas: "17:00" },
  ];

  res.render("index", {
    title: "Domov",
    treningy: nadchadzajuceTreningy,
  });
});

// Formulár pre nového trénera
app.get("/treneri/new", (req, res) => {
  res.render("treneri-new", {
    title: "Nový tréner",
    errors: [],
    formData: {}
  });
});


app.get("/treneri", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, specialization FROM trainers"
    );

    res.render("treneri", {
      title: "Tréneri",
      treneri: rows,
    });
  } catch (err) {
    console.error("Chyba pri nacitani trenerov z DB:", err);
    res.status(500).send("Chyba servera pri nacitani trenerov");
  }
});

// Formulár na úpravu trénera
app.get("/treneri/:id/edit", async (req, res) => {
  const trainerId = req.params.id;

  try {
    const [rows] = await db.query(
      "SELECT id, name, specialization FROM trainers WHERE id = ?",
      [trainerId]
    );

    if (rows.length === 0) {
      return res.status(404).send("Tréner nenájdený");
    }

    const trainer = rows[0];

    res.render("treneri-edit", {
      title: "Upraviť trénera",
      trainer,
      errors: []
    });
  } catch (err) {
    console.error("Chyba pri nacitani trenera:", err);
    res.status(500).send("Chyba servera pri nacitani trenera");
  }
});

// Spracovanie úpravy trénera
app.post("/treneri/:id/edit", async (req, res) => {
  const trainerId = req.params.id;
  const { name, specialization } = req.body;

  const errors = [];
  if (!name || !name.trim()) {
    errors.push("Meno je povinné");
  }
  if (!specialization || !specialization.trim()) {
    errors.push("Špecializácia je povinná");
  }

  if (errors.length > 0) {
    // znovu načítame trénera pre zobrazenie formulara
    return res.render("treneri-edit", {
      title: "Upraviť trénera",
      trainer: { id: trainerId, name, specialization },
      errors
    });
  }

  try {
    await db.query(
      "UPDATE trainers SET name = ?, specialization = ? WHERE id = ?",
      [name.trim(), specialization.trim(), trainerId]
    );

    res.redirect("/treneri");
  } catch (err) {
    console.error("Chyba pri uprave trenera:", err);
    res.status(500).send("Chyba servera pri uprave trenera");
  }
}); 


// Spracovanie formulára - vytvorenie trénera
app.post("/treneri/new", async (req, res) => {
  const { name, specialization } = req.body;

  const errors = [];
  if (!name || !name.trim()) {
    errors.push("Meno je povinné");
  }
  if (!specialization || !specialization.trim()) {
    errors.push("Špecializácia je povinná");
  }

  if (errors.length > 0) {
    return res.render("treneri-new", {
      title: "Nový tréner",
      errors,
      formData: { name, specialization }
    });
  }

  try {
    await db.query(
      "INSERT INTO trainers (name, specialization) VALUES (?, ?)",
      [name.trim(), specialization.trim()]
    );

    // po úspešnom uložení presmeruj na zoznam trénerov
    res.redirect("/treneri");
  } catch (err) {
    console.error("Chyba pri ukladani trenera:", err);
    res.status(500).send("Chyba servera pri vytvarani trenera");
  }
});

app.post("/treneri/:id/delete", async (req, res) => {
  const trainerId = req.params.id;

  try {
    await db.query("DELETE FROM trainers WHERE id = ?", [trainerId]);
    res.redirect("/treneri");
  } catch (err) {
    console.error("Chyba pri mazani trenera:", err);
    res.status(500).send("Chyba servera pri mazani trenera");
  }
});

app.get("/sessions/new", (req, res) => {
  res.render("sessions-new", {
    title: "Nový tréning",
    errors: [],
    formData: {}
  });
});
app.post("/sessions/new", async (req, res) => {
  const { title, start_at, end_at, capacity, trainer_id } = req.body;

  const errors = [];

  if (!title || !title.trim()) {
    errors.push("Názov je povinný");
  }
  if (!start_at) {
    errors.push("Začiatok je povinný");
  }
  if (!end_at) {
    errors.push("Koniec je povinný");
  }
  if (!capacity || isNaN(capacity) || Number(capacity) <= 0) {
    errors.push("Kapacita musí byť kladné číslo");
  }

  // jednoduchý check: začiatok pred koncom (ak sú obe zadané)
  if (start_at && end_at && start_at >= end_at) {
    errors.push("Začiatok musí byť pred koncom");
  }

  const formData = { title, start_at, end_at, capacity, trainer_id };

  if (errors.length > 0) {
    return res.render("sessions-new", {
      title: "Nový tréning",
      errors,
      formData
    });
  }

  // pre MySQL: datetime-local je vo formáte "YYYY-MM-DDTHH:MM"
  const startForDb = start_at.replace("T", " ") + ":00";
  const endForDb = end_at.replace("T", " ") + ":00";

  try {
    await db.query(
      `INSERT INTO sessions (title, start_at, end_at, capacity, trainer_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        title.trim(),
        startForDb,
        endForDb,
        Number(capacity),
        trainer_id ? Number(trainer_id) : null
      ]
    );

    res.redirect("/sessions");
  } catch (err) {
    console.error("Chyba pri vytvarani session:", err);
    res.status(500).send("Chyba servera pri vytvarani treningu");
  }
});

app.get("/sessions/:id/edit", async (req, res) => {
  const sessionId = req.params.id;

  try {
    const [rows] = await db.query(
      "SELECT id, title, start_at, end_at, capacity, trainer_id FROM sessions WHERE id = ?",
      [sessionId]
    );

    if (rows.length === 0) {
      return res.status(404).send("Tréning nenájdený");
    }

    const session = rows[0];

    res.render("sessions-edit", {
      title: "Upraviť tréning",
      session,
      errors: []
    });
  } catch (err) {
    console.error("Chyba pri nacitani session:", err);
    res.status(500).send("Chyba servera pri nacitani treningu");
  }
});

app.post("/sessions/:id/edit", async (req, res) => {
  const sessionId = req.params.id;
  const { title, start_at, end_at, capacity, trainer_id } = req.body;

  const errors = [];

  if (!title || !title.trim()) {
    errors.push("Názov je povinný");
  }
  if (!start_at) {
    errors.push("Začiatok je povinný");
  }
  if (!end_at) {
    errors.push("Koniec je povinný");
  }
  if (!capacity || isNaN(capacity) || Number(capacity) <= 0) {
    errors.push("Kapacita musí byť kladné číslo");
  }
  if (start_at && end_at && start_at >= end_at) {
    errors.push("Začiatok musí byť pred koncom");
  }

  // ak sú chyby, vrátime formulár s pôvodnými dátami
  if (errors.length > 0) {
    return res.render("sessions-edit", {
      title: "Upraviť tréning",
      session: {
        id: sessionId,
        title,
        // späť do datetime-local formátu
        start_at: start_at ? new Date(start_at) : null,
        end_at: end_at ? new Date(end_at) : null,
        capacity,
        trainer_id
      },
      errors
    });
  }

  const startForDb = start_at.replace("T", " ") + ":00";
  const endForDb = end_at.replace("T", " ") + ":00";

  try {
    await db.query(
      `UPDATE sessions
       SET title = ?, start_at = ?, end_at = ?, capacity = ?, trainer_id = ?
       WHERE id = ?`,
      [
        title.trim(),
        startForDb,
        endForDb,
        Number(capacity),
        trainer_id ? Number(trainer_id) : null,
        sessionId
      ]
    );

    res.redirect("/sessions");
  } catch (err) {
    console.error("Chyba pri uprave session:", err);
    res.status(500).send("Chyba servera pri uprave treningu");
  }
});

app.post("/sessions/:id/delete", async (req, res) => {
  const sessionId = req.params.id;

  try {
    await db.query("DELETE FROM sessions WHERE id = ?", [sessionId]);
    res.redirect("/sessions");
  } catch (err) {
    console.error("Chyba pri mazani session:", err);
    res.status(500).send("Chyba servera pri mazani treningu");
  }
});

app.get("/rezervacie/new", async (req, res) => {
  const sessionId = req.query.sessionId;

  if (!sessionId) {
    return res.status(400).send("Chýba sessionId");
  }

  try {
    const [rows] = await db.query(
      "SELECT id, title, start_at FROM sessions WHERE id = ?",
      [sessionId]
    );

    if (rows.length === 0) {
      return res.status(404).send("Tréning nenájdený");
    }

    const session = rows[0];

    res.render("rezervacie-new", {
      title: "Nová rezervácia",
      session,
      errors: [],
      formData: { client_name: "", note: "" }
    });
  } catch (err) {
    console.error("Chyba pri nacitani session pre rezervaciu:", err);
    res.status(500).send("Chyba servera pri priprave rezervacie");
  }
});

app.get("/sessions", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         s.id,
         s.title,
         s.start_at,
         s.end_at,
         s.capacity,
         t.name AS trainer_name
       FROM sessions s
       LEFT JOIN trainers t ON s.trainer_id = t.id
       ORDER BY s.start_at`
    );

    res.render("sessions", {
      title: "Tréningy",
      sessions: rows,
    });
  } catch (err) {
    console.error("Chyba pri nacitani sessions:", err);
    res.status(500).send("Chyba servera pri nacitani treningov");
  }
});

app.post("/rezervacie/new", async (req, res) => {
  const { session_id, client_name, note } = req.body;

  const errors = [];
  if (!session_id) {
    errors.push("Chýba tréning (session_id).");
  }
  if (!client_name || !client_name.trim()) {
    errors.push("Meno klienta je povinné.");
  }

  let session = null;

  try {
    // vždy načítame session, aby sme ju vedeli zobraziť vo formulári
    const [rows] = await db.query(
      "SELECT id, title, start_at FROM sessions WHERE id = ?",
      [session_id]
    );

    if (rows.length === 0) {
      errors.push("Zvolený tréning neexistuje.");
    } else {
      session = rows[0];
    }

    if (errors.length > 0) {
      return res.render("rezervacie-new", {
        title: "Nová rezervácia",
        session,
        errors,
        formData: { client_name, note }
      });
    }

    await db.query(
      "INSERT INTO reservations (session_id, client_name, note) VALUES (?, ?, ?)",
      [
        Number(session_id),
        client_name.trim(),
        note && note.trim() ? note.trim() : null
      ]
    );

    res.redirect("/rezervacie");
  } catch (err) {
    console.error("Chyba pri vytvarani rezervacie:", err);
    res.status(500).send("Chyba servera pri vytvarani rezervacie");
  }
});

app.get("/rezervacie", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
         r.id,
         r.client_name,
         r.note,
         r.created_at,
         s.title AS session_title,
         s.start_at AS session_start
       FROM reservations r
       JOIN sessions s ON r.session_id = s.id
       ORDER BY r.created_at DESC`
    );

    res.render("rezervacie", {
      title: "Moje rezervácie",
      rezervacie: rows,
    });
  } catch (err) {
    console.error("Chyba pri nacitani rezervacii:", err);
    res.status(500).send("Chyba servera pri nacitani rezervacii");
  }
});

app.post("/rezervacie/:id/delete", async (req, res) => {
  const reservationId = req.params.id;

  try {
    await db.query("DELETE FROM reservations WHERE id = ?", [reservationId]);
    res.redirect("/rezervacie");
  } catch (err) {
    console.error("Chyba pri mazani rezervacie:", err);
    res.status(500).send("Chyba servera pri mazani rezervacie");
  }
});


app.listen(PORT, () => {
  console.log(`Server beží na http://localhost:${PORT}`);
});
