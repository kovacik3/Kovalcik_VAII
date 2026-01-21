const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const { validateProfileUpdate } = require("../validators");

async function getProfile(req, res) {
  const userId = req.session.user?.id;
  if (!userId) {
    return res.redirect("/login");
  }

  try {
    const user = await userModel.getById(userId);
    if (!user) {
      return res.status(404).send("Používateľ neexistuje.");
    }

    return res.render("profil", {
      title: "Profil",
      user,
    });
  } catch (err) {
    console.error("Chyba pri nacitani profilu:", err);
    return res.status(500).send("Chyba servera pri načítaní profilu.");
  }
}

async function getEditProfile(req, res) {
  const userId = req.session.user?.id;
  if (!userId) {
    return res.redirect("/login");
  }

  try {
    const user = await userModel.getById(userId);
    if (!user) {
      return res.status(404).send("Používateľ neexistuje.");
    }

    return res.render("profil-edit", {
      title: "Upraviť profil",
      errors: [],
      formData: {
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
      },
    });
  } catch (err) {
    console.error("Chyba pri nacitani edit profilu:", err);
    return res.status(500).send("Chyba servera pri načítaní profilu.");
  }
}

async function postEditProfile(req, res) {
  const userId = req.session.user?.id;
  if (!userId) {
    return res.redirect("/login");
  }

  const { first_name, last_name, username, password, password_confirm } = req.body;
  const errors = validateProfileUpdate({ first_name, last_name, username, password, password_confirm });

  const formData = {
    first_name: (first_name || "").toString(),
    last_name: (last_name || "").toString(),
    username: (username || "").toString(),
    email: req.session.user?.email || "",
  };

  if (errors.length > 0) {
    return res.status(400).render("profil-edit", {
      title: "Upraviť profil",
      errors,
      formData,
    });
  }

  try {
    const normalizedFirst = formData.first_name.trim();
    const normalizedLast = formData.last_name.trim();
    const normalizedUsername = formData.username.trim();

    const update = {
      first_name: normalizedFirst,
      last_name: normalizedLast,
      username: normalizedUsername,
    };

    if (password && password.toString().trim() !== "") {
      const passwordHash = await bcrypt.hash(password.toString(), 10);
      update.password_hash = passwordHash;
    }

    await userModel.updateProfile(userId, update);

    // Keep session user info in sync for navbar.
    if (req.session.user) {
      req.session.user.username = normalizedUsername;
    }

    return res.redirect("/profil");
  } catch (err) {
    console.error("Chyba pri ukladani profilu:", err);
    return res.status(500).render("profil-edit", {
      title: "Upraviť profil",
      errors: ["Chyba servera pri ukladaní profilu. Skús to znova."],
      formData,
    });
  }
}

module.exports = {
  getProfile,
  getEditProfile,
  postEditProfile,
};
