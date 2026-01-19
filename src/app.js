// ============================================
// KNIŽNICE A ZÁKLADNÉ NASTAVENIA
// ============================================

// Čítame konfiguráciu z .env (heslá, DB, session secret)
require("dotenv").config();
// Express je webový server, path na prácu s cestami
const express = require("express");
const path = require("path");
// Session: aby si server pamätal, kto je prihlásený
const session = require("express-session");
// bcrypt: bezpečné ukladanie a porovnávanie hesiel
const bcrypt = require("bcrypt");
// db: pripojenie do MySQL
const db = require("./db");
// validácia vstupov pre formuláre
const validaciaServer = require('./validacia-server');

// Tu sa vytvorí Express aplikácia a nastaví port
const app = express();
const PORT = 3000;

// Konfigurácia template engine (EJS) pre vykresľovanie HTML stránok
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

// Sprístupní CSS/JS/obrázky z public/
app.use(express.static(path.join(__dirname, "..", "public")));

// Umožní čítať dáta z formulárov (req.body)
app.use(express.urlencoded({ extended: true }));

// Sessions: uloží info o prihlásenom užívateľovi na serveri,
// prehliadač má len cookie s identifikátorom
app.use(session({
  secret: process.env.SESSION_SECRET || "dev-session-secret-change-me",
  resave: false,
  saveUninitialized: false,
}));

// Do EJS šablón posielame info o prihlásenom (kvôli skrytiu/zobrazeniu tlačidiel)
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  res.locals.isAdmin = req.session.user?.role === "admin";
  res.locals.isTrainer = req.session.user?.role === "trainer";
  next();
});

// Ak nie si prihlásený, pošleme ťa na /login
function requireAuth(req, res, next) {
  if (!req.session.user) {
    // Zapamätáme si, kam sa user chcel dostať (napr. /rezervacie/new?treningId=...)
    req.session.returnTo = req.originalUrl;
    return res.redirect("/login");
  }
  next();
}

// Ak nemáš požadovanú rolu (napr. admin), dostaneš 403
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).send("Nedostatočné oprávnenie");
    }
    next();
  };
}

// ============================================
// AUTENTIFIKÁCIA
// ============================================

// Formulár na prihlásenie. Ak už si prihlásený, presmerujeme domov.
app.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("login", { title: "Prihlásenie", errors: [], formData: {} });
});

// Spracovanie prihlásenia: nájdeme usera podľa emailu, porovnáme heslo cez bcrypt
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !password) {
    errors.push("E-mail a heslo sú povinné.");
  }

  if (errors.length === 0) {
    try {
      const [rows] = await db.query(
        "SELECT id, email, password_hash, role FROM users WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        errors.push("Nesprávne prihlasovacie údaje.");
      } else {
        const user = rows[0];
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
          errors.push("Nesprávne prihlasovacie údaje.");
        } else {
          req.session.user = { id: user.id, email: user.email, role: user.role };
          const returnTo = req.session.returnTo;
          delete req.session.returnTo;
          return res.redirect(returnTo || "/");
        }
      }
    } catch (err) {
      console.error("Chyba pri prihlasovaní:", err);
      errors.push("Chyba servera pri prihlasovaní.");
    }
  }

  res.render("login", { title: "Prihlásenie", errors, formData: { email } });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// ============================================
// DOMOVSKÁ STRÁNKA
// ============================================

/**
 * GET /
 * Zobrazí domovskú stránku s nadchádzajúcimi tréningami
 */
app.get("/", async (req, res) => {
  try {
    // Načítaj nadchádzajúce tréningy z databázy
    const [rows] = await db.query(
      `SELECT 
         s.id,
         s.title as nazov,
         DATE_FORMAT(s.start_at, '%W') as den,
         DATE_FORMAT(s.start_at, '%H:%i') as cas
       FROM sessions s
       WHERE s.start_at > NOW()
       ORDER BY s.start_at
       LIMIT 3`
    );

    res.render("index", {
      title: "Domov",
      treningy: rows,
    });
  } catch (err) {
    console.error("Chyba pri nacitani nadchadzajucich treningov:", err);
    res.render("index", {
      title: "Domov",
      treningy: [],
    });
  }
});



// ============================================
// SPRÁVA TRÉNEROV (TRAINERS)
// ============================================

// Zoznam trénerov (viditeľný každému)
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

// Formulár pre nového trénera (iba admin)
app.get("/treneri/new", requireRole("admin"), (req, res) => {
  res.render("treneri-new", {
    title: "Nový tréner",
    errors: [],
    formData: {}
  });
});

// Spracovanie formulára – vytvorenie trénera (iba admin)
app.post("/treneri/new", requireRole("admin"), async (req, res) => {
  const { name, specialization } = req.body;
  const errors = validaciaServer.validujNovehoTrenera(req.body);

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
    res.redirect("/treneri");
  } catch (err) {
    console.error("Chyba pri ukladani trenera:", err);
    res.status(500).send("Chyba servera pri vytvarani trenera");
  }
});

// Formulár na úpravu trénera (iba admin)
app.get("/treneri/:id/edit", requireRole("admin"), async (req, res) => {
  const trainerId = req.params.id;

  try {
    const [rows] = await db.query(
      "SELECT id, name, specialization FROM trainers WHERE id = ?",
      [trainerId]
    );

    if (rows.length === 0) {
      return res.status(404).send("Tréner nenájdený");
    }

    res.render("treneri-edit", {
      title: "Upraviť trénera",
      trainer: rows[0],
      errors: []
    });
  } catch (err) {
    console.error("Chyba pri nacitani trenera:", err);
    res.status(500).send("Chyba servera pri nacitani trenera");
  }
});

// Uloženie zmien trénera (iba admin)
app.post("/treneri/:id/edit", requireRole("admin"), async (req, res) => {
  const trainerId = req.params.id;
  const { name, specialization } = req.body;
  const errors = validaciaServer.validujNovehoTrenera(req.body);

  if (errors.length > 0) {
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

// Vymazanie trénera (iba admin)
app.post("/treneri/:id/delete", requireRole("admin"), async (req, res) => {
  const trainerId = req.params.id;

  try {
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

// Formulár na nový tréning (admin aj tréner) + select trénera
app.get("/treningy/new", requireRole("admin", "trainer"), async (req, res) => {
  try {
    const [trainers] = await db.query("SELECT id, name FROM trainers ORDER BY name");
    res.render("treningy-new", {
      title: "Nový tréning",
      errors: [],
      formData: {},
      trainers,
    });
  } catch (err) {
    console.error("Chyba pri nacitani trenerov pre novy trening:", err);
    res.status(500).send("Chyba servera pri priprave formulára");
  }
});

// Uloženie nového tréningu (admin aj tréner)
app.post("/treningy/new", requireRole("admin", "trainer"), async (req, res) => {
  const { title, start_at, end_at, capacity, trainer_id } = req.body;

  // Validácia pomocou modulu validacia-server
  const errors = validaciaServer.validujNovyTrening(req.body);

  const formData = { title, start_at, end_at, capacity, trainer_id };

  if (errors.length > 0) {
    try {
      const [trainers] = await db.query("SELECT id, name FROM trainers ORDER BY name");
      return res.render("treningy-new", {
        title: "Nový tréning",
        errors,
        formData,
        trainers,
      });
    } catch (err) {
      console.error("Chyba pri nacitani trenerov pri validacii noveho treningu:", err);
      return res.status(500).send("Chyba servera pri validacii formulára");
    }
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

// Zoznam všetkých tréningov + meno trénera
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

// Formulár na úpravu tréningu (admin aj tréner) + select trénera
app.get("/treningy/:id/edit", requireRole("admin", "trainer"), async (req, res) => {
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

    const [trainers] = await db.query("SELECT id, name FROM trainers ORDER BY name");

    res.render("treningy-edit", {
      title: "Upraviť tréning",
      trening,
      trainers,
      errors: []
    });
  } catch (err) {
    console.error("Chyba pri nacitani tréningov:", err);
    res.status(500).send("Chyba servera pri nacitani treningu");
  }
});

// Uloženie zmien tréningu (admin aj tréner)
app.post("/treningy/:id/edit", requireRole("admin", "trainer"), async (req, res) => {
  const treningId = req.params.id;
  const { title, start_at, end_at, capacity, trainer_id } = req.body;

  // Validácia vstupných údajov pomocou modulu validacia-server
  const errors = validaciaServer.validujNovyTrening(req.body);

  // Ak sú chyby, vrátime formulár s pôvodnými dátami a chybami
  if (errors.length > 0) {
    try {
      const [trainers] = await db.query("SELECT id, name FROM trainers ORDER BY name");
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
        trainers,
        errors
      });
    } catch (err) {
      console.error("Chyba pri nacitani trenerov pri validacii upravy treningu:", err);
      return res.status(500).send("Chyba servera pri validacii formulára");
    }
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

// Vymazanie tréningu (admin aj tréner)
app.post("/treningy/:id/delete", requireRole("admin", "trainer"), async (req, res) => {
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

// Rezervačný formulár pre vybraný tréning
app.get("/rezervacie/new", requireAuth, async (req, res) => {
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

// Uloženie novej rezervácie
app.post("/rezervacie/new", requireAuth, async (req, res) => {
  const { session_id, client_name, note } = req.body;

  // Validácia pomocou modulu validacia-server
  const errors = validaciaServer.validujNovuRezervaciju(req.body);

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
      "INSERT INTO reservations (session_id, client_name, note, user_id) VALUES (?, ?, ?, ?)",
      [
        Number(session_id),
        client_name.trim(),
        note && note.trim() ? note.trim() : null,
        req.session.user.id
      ]
    );

    res.redirect("/rezervacie");
  } catch (err) {
    console.error("Chyba pri vytvarani rezervacie:", err);
    res.status(500).send("Chyba servera pri vytvarani rezervacie");
  }
});

// Zoznam všetkých rezervácií (s detailmi tréningu)
app.get("/rezervacie", requireAuth, async (req, res) => {
  try {
    // Admin môže vidieť všetky, ostatní iba svoje
    const isAdmin = req.session.user?.role === "admin";
    let sql =
      `SELECT 
         r.id,
         r.client_name,
         r.note,
         r.created_at,
         s.title AS session_title,
         s.start_at AS session_start
       FROM reservations r
       JOIN sessions s ON r.session_id = s.id`;
    const params = [];

    if (!isAdmin) {
      sql += "\n       WHERE r.user_id = ?";
      params.push(req.session.user.id);
    }

    sql += "\n       ORDER BY r.created_at DESC";

    const [rows] = await db.query(sql, params);

    res.render("rezervacie", {
      title: "Moje rezervácie",
      rezervacie: rows,
    });
  } catch (err) {
    console.error("Chyba pri nacitani rezervacii:", err);
    res.status(500).send("Chyba servera pri nacitani rezervacii");
  }
});

// Vymazanie rezervácie
app.post("/rezervacie/:id/delete", requireAuth, async (req, res) => {
  const reservationId = req.params.id;

  try {
    // Admin môže mazať všetky, ostatní iba svoje
    const isAdmin = req.session.user?.role === "admin";
    let result;
    if (isAdmin) {
      [result] = await db.query("DELETE FROM reservations WHERE id = ?", [reservationId]);
    } else {
      [result] = await db.query(
        "DELETE FROM reservations WHERE id = ? AND user_id = ?",
        [reservationId, req.session.user.id]
      );
    }

    if (!result || result.affectedRows === 0) {
      return res.status(404).send("Rezervácia nenájdená alebo nemáš oprávnenie.");
    }
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
