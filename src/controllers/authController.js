const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const { validateRegistration } = require("../validators");

/**
 * Auth controller.
 *
 * Zodpovednosti:
 * - zobraziť login/register formulár
 * - overiť prihlasovacie údaje a zapísať používateľa do session
 * - vytvoriť nového používateľa (registrácia) + auto-login
 */

/**
 * GET /login – zobrazí prihlasovací formulár.
 * Ak je user už prihlásený, presmeruje ho na domov.
 */
async function getLogin(req, res) {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("login", { title: "Prihlásenie", errors: [], formData: {} });
}

/**
 * POST /login – spracuje prihlásenie.
 * Pri úspechu nastaví `req.session.user` a presmeruje na `returnTo` (ak existuje).
 */
async function postLogin(req, res) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !password) {
    errors.push("E-mail a heslo sú povinné.");
  }

  if (errors.length === 0) {
    try {
      // Získame údaje potrebné na autentifikáciu (vrátane password_hash).
      const user = await userModel.findAuthUserByEmail(email);

      if (!user) {
        errors.push("Nesprávne prihlasovacie údaje.");
      } else {
          // Heslo porovnávame cez bcrypt, nikdy nie plain text.
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
          errors.push("Nesprávne prihlasovacie údaje.");
        } else {
            // Do session ukladáme len minimum (bez hash-u).
          req.session.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            username: user.username,
          };

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
}

/**
 * POST /logout – zruší session a presmeruje na login.
 */
async function postLogout(req, res) {
  req.session.destroy(() => {
    res.redirect("/login");
  });
}

/**
 * GET /register – zobrazí registračný formulár.
 */
async function getRegister(req, res) {
  if (req.session.user) {
    return res.redirect("/");
  }

  res.render("register", {
    title: "Registrácia",
    errors: [],
    formData: {},
  });
}

/**
 * POST /register – spracuje registráciu.
 * - validuje input
 * - skontroluje unikátnosť emailu
 * - uloží používateľa s bcrypt hashom hesla
 * - auto-login a redirect
 */
async function postRegister(req, res) {
  if (req.session.user) {
    return res.redirect("/");
  }

  const { first_name, last_name, username, email, password } = req.body;
  const errors = validateRegistration({ first_name, last_name, username, email, password });

  if (errors.length === 0) {
    try {
      const exists = await userModel.existsByEmail(email);
      if (exists) {
        errors.push("Používateľ s týmto e-mailom už existuje.");
      }
    } catch (err) {
      console.error("Chyba pri kontrole existujúceho emailu:", err);
      errors.push("Chyba servera pri overovaní e-mailu.");
    }
  }

  if (errors.length === 0) {
    try {
      const normalizedFirst = (first_name || "").trim();
      const normalizedLast = (last_name || "").trim();
      const normalizedUsername = (username || "").trim();

      // Password hashujeme – v DB sa nikdy neukladá plain heslo.
      const passwordHash = await bcrypt.hash(password, 10);

      const userId = await userModel.createUser({
        email: email.trim(),
        username: normalizedUsername,
        first_name: normalizedFirst,
        last_name: normalizedLast,
        password_hash: passwordHash,
        role: "user",
      });

      req.session.user = {
        id: userId,
        email: email.trim(),
        role: "user",
        username: normalizedUsername,
      };

      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      return res.redirect(returnTo || "/");
    } catch (err) {
      console.error("Chyba pri registrácii používateľa:", err);
      errors.push("Chyba servera pri registrácii. Skúste to znova neskôr.");
    }
  }

  res.render("register", {
    title: "Registrácia",
    errors,
    formData: { first_name, last_name, username, email },
  });
}

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getRegister,
  postRegister,
};
