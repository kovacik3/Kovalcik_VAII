// ============================================
// KNIŽNICE A ZÁKLADNÉ NASTAVENIA (MVC bootstrap)
// ============================================

// Čítame konfiguráciu z .env (heslá, DB, session secret)
require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const csrf = require("csurf");
const helmet = require("helmet");

const viewLocals = require("./middlewares/view-locals");
const csrfErrorHandler = require("./middlewares/csrf-error-handler");

const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const trainersRoutes = require("./routes/trainersRoutes");
const trainingsRoutes = require("./routes/trainingsRoutes");
const reservationsRoutes = require("./routes/reservationsRoutes");
const usersRoutes = require("./routes/usersRoutes");
const profileRoutes = require("./routes/profileRoutes");

const sessionConfig = require("./config/session");

// Tu sa vytvorí Express aplikácia
const app = express();

// Bezpečnostné HTTP hlavičky (pozor: CSP je vypnuté, lebo používame CDN Bootstrap/FontAwesome)
app.disable("x-powered-by");
app.use(
	helmet({
		contentSecurityPolicy: false,
	})
);

// Konfigurácia template engine (EJS) pre vykresľovanie HTML stránok
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

// Sprístupní CSS/JS/obrázky z public/
app.use(express.static(path.join(__dirname, "..", "public")));

// Umožní čítať dáta z formulárov (req.body)
app.use(express.urlencoded({ extended: true }));

// Sessions: uloží info o prihlásenom užívateľovi na serveri,
// prehliadač má len cookie s identifikátorom
app.use(session(sessionConfig));

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
app.use(usersRoutes);
app.use(profileRoutes);


// CSRF error handler (user-friendly 403)
app.use(csrfErrorHandler);

module.exports = app;
