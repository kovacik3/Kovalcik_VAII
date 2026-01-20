// ============================================
// KNIŽNICE A ZÁKLADNÉ NASTAVENIA (MVC bootstrap)
// ============================================

// Čítame konfiguráciu z .env (heslá, DB, session secret)
require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const csrf = require("csurf");

const viewLocals = require("./middlewares/view-locals");
const csrfErrorHandler = require("./middlewares/csrf-error-handler");

const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const trainersRoutes = require("./routes/trainersRoutes");
const trainingsRoutes = require("./routes/trainingsRoutes");
const reservationsRoutes = require("./routes/reservationsRoutes");

const { scheduleCleanup } = require("./services/cleanupService");

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

// CSRF ochrana – musí byť po sessions a body parsingu
app.use(csrf());
// CSRF token + user info do šablón
app.use(viewLocals);

// Routes (MVC)
app.use(homeRoutes);
app.use(authRoutes);
app.use(trainersRoutes);
app.use(trainingsRoutes);
app.use(reservationsRoutes);


// ============================================
// SPUSTENIE SERVERA
// ============================================

// CSRF error handler (user-friendly 403)
app.use(csrfErrorHandler);

/**
 * Spustí Express server na zadanom porte
 */
app.listen(PORT, () => {
  console.log(`Server beží na http://localhost:${PORT}`);
  scheduleCleanup();
});
