const userModel = require("../models/userModel");
const { parsePositiveInt } = require("../utils/id");

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
  const targetUserId = parsePositiveInt(req.params.id);
  const newRole = (req.body?.role || "").toString().trim();

  const errors = [];
  if (!targetUserId) {
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

// AJAX variant – returns JSON instead of rendering a page
async function updateRoleAjax(req, res) {
  const targetUserId = parsePositiveInt(req.params.id);
  const newRole = (req.body?.role || "").toString().trim();

  const errors = [];
  if (!targetUserId) {
    errors.push("Neplatné ID používateľa.");
  }

  if (!ALLOWED_ROLES.has(newRole)) {
    errors.push("Neplatná rola.");
  }

  // Safety: nedovoľ adminovi odobrať admin rolu sám sebe (lockout)
  if (req.session.user?.id && Number(req.session.user.id) === targetUserId && newRole !== "admin") {
    errors.push("Seba nevieš demotnúť (ochrana pred lockoutom).");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const target = await userModel.getById(targetUserId);
    if (!target) {
      return res.status(404).json({ success: false, error: "Používateľ neexistuje." });
    }

    if ((target.role || "").toString() === newRole) {
      return res.status(409).json({
        success: false,
        error: "Používateľ už má nastavenú túto rolu.",
      });
    }

    const affected = await userModel.updateRole(targetUserId, newRole);
    if (!affected) {
      return res.status(500).json({
        success: false,
        error: "Rolu sa nepodarilo uložiť (nebola vykonaná žiadna zmena).",
      });
    }

    // Ak admin upraví sám seba, udržíme session konzistentnú
    if (req.session.user?.id && Number(req.session.user.id) === targetUserId) {
      req.session.user.role = newRole;
    }

    return res.json({ success: true, role: newRole });
  } catch (err) {
    console.error("Chyba pri AJAX update role:", err);
    return res.status(500).json({ success: false, error: "Chyba servera pri ukladaní roly" });
  }
}

module.exports = {
  list,
  updateRole,
  updateRoleAjax,
};
