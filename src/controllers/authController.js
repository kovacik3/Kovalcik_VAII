const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const validaciaServer = require("../validacia-server");

async function getLogin(req, res) {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("login", { title: "Prihlásenie", errors: [], formData: {} });
}

async function postLogin(req, res) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !password) {
    errors.push("E-mail a heslo sú povinné.");
  }

  if (errors.length === 0) {
    try {
      const user = await userModel.findAuthUserByEmail(email);

      if (!user) {
        errors.push("Nesprávne prihlasovacie údaje.");
      } else {
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) {
          errors.push("Nesprávne prihlasovacie údaje.");
        } else {
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

async function postLogout(req, res) {
  req.session.destroy(() => {
    res.redirect("/login");
  });
}

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

async function postRegister(req, res) {
  if (req.session.user) {
    return res.redirect("/");
  }

  const { first_name, last_name, email, password } = req.body;
  const errors = validaciaServer.validujRegistraciu({ first_name, last_name, email, password });

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
      const username = [normalizedFirst, normalizedLast].filter(Boolean).join(" ");

      const passwordHash = await bcrypt.hash(password, 10);

      const userId = await userModel.createUser({
        email: email.trim(),
        username: username || email.trim(),
        first_name: normalizedFirst,
        last_name: normalizedLast,
        password_hash: passwordHash,
        role: "user",
      });

      req.session.user = {
        id: userId,
        email: email.trim(),
        role: "user",
        username: username || email.trim(),
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
    formData: { first_name, last_name, email },
  });
}

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  getRegister,
  postRegister,
};
