const express = require("express");
const reservationsController = require("../controllers/reservationsController");
const { requireAuth, requireCustomer } = require("../middlewares/auth");

const router = express.Router();

// Vytvorenie novej rezervácie – iba zákazník (role "user")
router.get("/rezervacie/new", requireCustomer, reservationsController.newForm);
router.post("/rezervacie/new", requireCustomer, reservationsController.create);

// Zoznam rezervácií – prihlásený používateľ
// - admin/trainer vidí všetky
// - user vidí iba svoje
router.get("/rezervacie", requireAuth, reservationsController.list);

// Mazanie rezervácie cez klasický POST (full refresh)
router.post("/rezervacie/:id/delete", requireAuth, reservationsController.remove);

// AJAX (bez refreshu stránky)
router.post("/api/rezervacie/:id/delete", requireAuth, reservationsController.removeAjax);

module.exports = router;
