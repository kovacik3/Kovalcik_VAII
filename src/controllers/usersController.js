const userModel = require("../models/userModel");

const ALLOWED_ROLES = new Set(["admin", "trainer", "user"]);

async function list(req, res) {
  try {
    const users = await userModel.listAllUsers();
    return res.render("uzivatelia", {
      title: "Používatelia",
      users,
      errors: [],
    });
  } catch (err) {
    console.error("Chyba pri nacitani pouzivatelov:", err);
    return res.status(500).send("Chyba servera pri nacitani používateľov");
  }
}

async function updateRole(req, res) {
  const targetUserId = Number(req.params.id);
  const newRole = (req.body?.role || "").toString().trim();

  const errors = [];
  if (!targetUserId || Number.isNaN(targetUserId)) {
    errors.push("Neplatné ID používateľa.");
  }

  if (!ALLOWED_ROLES.has(newRole)) {
    errors.push("Neplatná rola.");
  }

  // Safety: nedovoľ adminovi odobrať admin rolu sám sebe (lockout)
  if (req.session.user?.id && Number(req.session.user.id) === targetUserId && newRole !== "admin") {
    errors.push("Nemôžeš si sám odobrať admin rolu.");
  }

  if (errors.length > 0) {
    const users = await userModel.listAllUsers();
    return res.render("uzivatelia", {
      title: "Používatelia",
      users,
      errors,
    });
  }

  try {
    const target = await userModel.getById(targetUserId);
    if (!target) {
      const users = await userModel.listAllUsers();
      return res.render("uzivatelia", {
        title: "Používatelia",
        users,
        errors: ["Používateľ neexistuje."],
      });
    }

    await userModel.updateRole(targetUserId, newRole);

    // Ak admin upraví sám seba (admin->admin), udržíme session konzistentnú
    if (req.session.user?.id && Number(req.session.user.id) === targetUserId) {
      req.session.user.role = newRole;
    }

    return res.redirect("/uzivatelia");
  } catch (err) {
    console.error("Chyba pri zmene role:", err);
    const users = await userModel.listAllUsers();
    return res.status(500).render("uzivatelia", {
      title: "Používatelia",
      users,
      errors: ["Chyba servera pri zmene role."],
    });
  }
}

module.exports = {
  list,
  updateRole,
};
