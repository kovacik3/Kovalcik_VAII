// ============================================
// KNIŽNICE A ZÁKLADNÉ NASTAVENIA
// ============================================

// Import potrebných modulov
const express = require("express");
const path = require("path");
const db = require("./db");
const {
  validujNovehoTrenera,
  validujNovyTrening,
  validujNovuRezervaciju,
} = require("./validacia-server"); 

// Inicializácia Express aplikácie
const app = express();
const PORT = 3000;

// Konfigurácia template engine (EJS) pre vykresľovanie HTML stránok
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

// Middleware pre statické súbory (CSS, obrázky, atď.)
app.use(express.static(path.join(__dirname, "..", "public")));

// Middleware pre parsovanie POST dát z formulárov
app.use(express.urlencoded({ extended: true }));

// ============================================
// DOMOVSKÁ STRÁNKA
// ============================================

/**
 * GET /
 * Zobrazí domovskú stránku s nadchádzajúcimi tréningami
 */
app.get("/", (req, res) => {
  // Dočasný zoznam nadchádzajúcich tréningov (neskôr sa budú načítavať z DB)
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



// ============================================
// SPRÁVA TRÉNEROV (TRAINERS)
// ============================================

/**
 * GET /treneri/new
 * Zobrazí formulár pre vytvorenie nového trénera
 */
// Formulár pre nového trénera
app.get("/treneri/new", (req, res) => {
  res.render("treneri-new", {
    title: "Nový tréner",
    errors: [],
    formData: {}
  });
});

/**
 * GET /treneri
 * Načíta a zobrazí zoznam všetkých trénerov z databázy
 */
app.get("/treneri", async (req, res) => {
  try {
    // Dotaz na databázu: získaj ID, meno a špecializáciu všetkých trénerov
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

/**
 * POST /treneri/new
 * Spracuje odoslanie formulára pre vytvorenie nového trénera
 * Validuje vstupné dáta a uloží trénera do databázy
 */
// Spracovanie formulára - vytvorenie trénera
app.post("/treneri/new", async (req, res) => {
  const { name, specialization } = req.body;

  // Validácia pomocou modulu validacia-server
  const errors = validujNovehoTrenera(name, specialization);

  // Ak sú chyby, vrátime formulár s chybovými správami
  if (errors.length > 0) {
    return res.render("treneri-new", {
      title: "Nový tréner",
      errors,
      formData: { name, specialization }
    });
  }

  try {
    // Vloží nového trénera do databázy
    await db.query(
      "INSERT INTO trainers (name, specialization) VALUES (?, ?)",
      [name.trim(), specialization.trim()]
    );

    // Po úspešnom uložení presmeruj na zoznam trénerov
    res.redirect("/treneri");
  } catch (err) {
    console.error("Chyba pri ukladani trenera:", err);
    res.status(500).send("Chyba servera pri vytvarani trenera");
  }
});

/**
 * GET /treneri/:id/edit
 * Načíta údaje konkrétneho trénera a zobrazí formulár na úpravu
 */
// Formulár na úpravu trénera
app.get("/treneri/:id/edit", async (req, res) => {
  const trainerId = req.params.id;

  try {
    // Dotaz na databázu: získaj údaje konkrétneho trénera podľa ID
    const [rows] = await db.query(
      "SELECT id, name, specialization FROM trainers WHERE id = ?",
      [trainerId]
    );

    // Ak tréner neexistuje, vráť chybu 404
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

/**
 * POST /treneri/:id/edit
 * Spracuje odoslanie formulára pre úpravu existujúceho trénera
 * Validuje dáta a aktualizuje databázu
 */
// Spracovanie úpravy trénera
app.post("/treneri/:id/edit", async (req, res) => {
  const trainerId = req.params.id;
  const { name, specialization } = req.body;

  // Validácia vstupných dát pomocou modulu validacia-server
  const errors = validujNovehoTrenera(name, specialization);

  if (errors.length > 0) {
    // Znovu načítame trénera pre zobrazenie formulara s chybami
    return res.render("treneri-edit", {
      title: "Upraviť trénera",
      trainer: { id: trainerId, name, specialization },
      errors
    });
  }

  try {
    // Aktualizuje údaje trénera v databáze
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

/**
 * POST /treneri/:id/delete
 * Vymaže trénera z databázy podľa ID
 */
app.post("/treneri/:id/delete", async (req, res) => {
  const trainerId = req.params.id;

  try {
    // Vymaž trénera z databázy
    await db.query("DELETE FROM trainers WHERE id = ?", [trainerId]);
    res.redirect("/treneri");
  } catch (err) {
    console.error("Chyba pri mazani trenera:", err);
    res.status(500).send("Chyba servera pri mazani trenera");
  }
});



// ============================================
// SPRÁVA TRÉNINGOV (TRENINGY)
// ============================================

/**
 * GET /treningy/new
 * Zobrazí formulár pre vytvorenie nového tréningového kurzu
 */
app.get("/treningy/new", (req, res) => {
  res.render("treningy-new", {
    title: "Nový tréning",
    errors: [],
    formData: {}
  });
});

/**
 * POST /treningy/new
 * Spracuje vytvorenie nového tréningového kurzu
 * Validuje vstupné údaje (názov, časy, kapacitu) a uloží do DB
 */
app.post("/treningy/new", async (req, res) => {
  const { title, start_at, end_at, capacity, trainer_id } = req.body;

  // Validácia pomocou modulu validacia-server
  const errors = validujNovyTrening(title, start_at, end_at, capacity);

  const formData = { title, start_at, end_at, capacity, trainer_id };

  if (errors.length > 0) {
    return res.render("treningy-new", {
      title: "Nový tréning",
      errors,
      formData
    });
  }

  // Pre MySQL: datetime-local je vo formáte "YYYY-MM-DDTHH:MM"
  // Musíme to konvertovať na formát "YYYY-MM-DD HH:MM:SS"
  const startForDb = start_at.replace("T", " ") + ":00";
  const endForDb = end_at.replace("T", " ") + ":00";

  try {
    // Vloží nový tréning do databázy
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

    res.redirect("/treningy");
  } catch (err) {
    console.error("Chyba pri vytvarani tréningov:", err);
    res.status(500).send("Chyba servera pri vytvarani treningu");
  }
});

/**
 * GET /treningy
 * Načíta a zobrazí zoznam všetkých tréningov s menom priraadeného trénera
 */
app.get("/treningy", async (req, res) => {
  try {
    // SQL JOIN pre spojenie tréningov s trénerni
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

    res.render("treningy", {
      title: "Tréningy",
      treningy: rows,
    });
  } catch (err) {
    console.error("Chyba pri nacitani tréningov:", err);
    res.status(500).send("Chyba servera pri nacitani treningov");
  }
});

/**
 * GET /treningy/:id/edit
 * Načíta údaje konkrétneho tréningového kurzu a zobrazí formulár na úpravu
 */
app.get("/treningy/:id/edit", async (req, res) => {
  const treningId = req.params.id;

  try {
    // Dotaz na databázu: získaj údaje konkrétneho tréningového kurzu
    const [rows] = await db.query(
      "SELECT id, title, start_at, end_at, capacity, trainer_id FROM sessions WHERE id = ?",
      [treningId]
    );

    // Ak tréning neexistuje, vráť chybu 404
    if (rows.length === 0) {
      return res.status(404).send("Tréning nenájdený");
    }

    const trening = rows[0];

    res.render("treningy-edit", {
      title: "Upraviť tréning",
      trening,
      errors: []
    });
  } catch (err) {
    console.error("Chyba pri nacitani tréningov:", err);
    res.status(500).send("Chyba servera pri nacitani treningu");
  }
});

/**
 * POST /treningy/:id/edit
 * Spracuje úpravu existujúceho tréningového kurzu
 * Validuje dáta a aktualizuje databázu
 */
app.post("/treningy/:id/edit", async (req, res) => {
  const treningId = req.params.id;
  const { title, start_at, end_at, capacity, trainer_id } = req.body;

  // Validácia vstupných údajov pomocou modulu validacia-server
  const errors = validujNovyTrening(title, start_at, end_at, capacity);

  // Ak sú chyby, vrátime formulár s pôvodnými dátami a chybami
  if (errors.length > 0) {
    return res.render("treningy-edit", {
      title: "Upraviť tréning",
      trening: {
        id: treningId,
        title,
        // Späť do datetime-local formátu
        start_at: start_at ? new Date(start_at) : null,
        end_at: end_at ? new Date(end_at) : null,
        capacity,
        trainer_id
      },
      errors
    });
  }

  // Konvertovanie dátumu pre databázu
  const startForDb = start_at.replace("T", " ") + ":00";
  const endForDb = end_at.replace("T", " ") + ":00";

  try {
    // Aktualizuje údaje tréningového kurzu v databáze
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
        treningId
      ]
    );

    res.redirect("/treningy");
  } catch (err) {
    console.error("Chyba pri uprave tréningov:", err);
    res.status(500).send("Chyba servera pri uprave treningu");
  }
});

/**
 * POST /treningy/:id/delete
 * Vymaže tréningový kurz z databázy podľa ID
 */
app.post("/treningy/:id/delete", async (req, res) => {
  const treningId = req.params.id;

  try {
    // Vymaž tréningový kurz z databázy
    await db.query("DELETE FROM sessions WHERE id = ?", [treningId]);
    res.redirect("/treningy");
  } catch (err) {
    console.error("Chyba pri mazani tréningov:", err);
    res.status(500).send("Chyba servera pri mazani treningu");
  }
});



// ============================================
// SPRÁVA REZERVÁCIÍ (RESERVATIONS)
// ============================================

/**
 * GET /rezervacie/new
 * Zobrazí formulár pre vytvorenie novej rezervácie
 * Query parameter: ?treningId=ID pre sprehľadnenie, ktorý tréning sa rezervuje
 */
app.get("/rezervacie/new", async (req, res) => {
  const treningId = req.query.treningId;

  // Validácia: musí byť zadané ID tréningového kurzu
  if (!treningId) {
    return res.status(400).send("Chýba treningId");
  }

  try {
    // Načítame konkrétny tréningový kurz pre zobrazenie v rezervačnom formulári
    const [rows] = await db.query(
      "SELECT id, title, start_at FROM sessions WHERE id = ?",
      [treningId]
    );

    if (rows.length === 0) {
      return res.status(404).send("Tréning nenájdený");
    }

    const trening = rows[0];

    res.render("rezervacie-new", {
      title: "Nová rezervácia",
      session: trening,
      errors: [],
      formData: { client_name: "", note: "" }
    });
  } catch (err) {
    console.error("Chyba pri nacitani session pre rezervaciu:", err);
    res.status(500).send("Chyba servera pri priprave rezervacie");
  }
});

/**
 * POST /rezervacie/new
 * Spracuje vytvorenie novej rezervácie
 * Validuje meno klienta a uloží rezerváciu do databázy
 */
app.post("/rezervacie/new", async (req, res) => {
  const { session_id, client_name, note } = req.body;

  // Validácia pomocou modulu validacia-server
  const errors = validujNovuRezervaciju(session_id, client_name, note);

  let session = null;

  try {
    // Vždy načítame session, aby sme ju vedeli zobraziť vo formulári
    const [rows] = await db.query(
      "SELECT id, title, start_at FROM sessions WHERE id = ?",
      [session_id]
    );

    if (rows.length === 0) {
      errors.push("Zvolený tréning neexistuje.");
    } else {
      session = rows[0];
    }

    // Ak sú chyby, vráti formulár s chybovými správami
    if (errors.length > 0) {
      return res.render("rezervacie-new", {
        title: "Nová rezervácia",
        session,
        errors,
        formData: { client_name, note }
      });
    }

    // Vloží novú rezerváciu do databázy
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

/**
 * GET /rezervacie
 * Načíta a zobrazí zoznam všetkých rezervácií s informáciami o tréningi
 */
app.get("/rezervacie", async (req, res) => {
  try {
    // SQL JOIN pre spojenie rezervácií s tréningi a ich informáciami
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

/**
 * POST /rezervacie/:id/delete
 * Vymaže rezerváciu z databázy podľa ID
 */
app.post("/rezervacie/:id/delete", async (req, res) => {
  const reservationId = req.params.id;

  try {
    // Vymaž rezerváciu z databázy
    await db.query("DELETE FROM reservations WHERE id = ?", [reservationId]);
    res.redirect("/rezervacie");
  } catch (err) {
    console.error("Chyba pri mazani rezervacie:", err);
    res.status(500).send("Chyba servera pri mazani rezervacie");
  }
});


// ============================================
// SPUSTENIE SERVERA
// ============================================

/**
 * Spustí Express server na zadanom porte
 */
app.listen(PORT, () => {
  console.log(`Server beží na http://localhost:${PORT}`);
});
