const express = require("express");
const trainingsController = require("../controllers/trainingsController");
const { requireRole } = require("../middlewares/auth");

const router = express.Router();

// Tréningy (sessions)
router.get("/treningy", trainingsController.list);

// Vytváranie/úprava tréningov – len admin alebo tréner
router.get("/treningy/new", requireRole("admin", "trainer"), trainingsController.newForm);
router.post("/treningy/new", requireRole("admin", "trainer"), trainingsController.create);
router.get("/treningy/:id/edit", requireRole("admin", "trainer"), trainingsController.editForm);
router.post("/treningy/:id/edit", requireRole("admin", "trainer"), trainingsController.update);
router.post("/treningy/:id/delete", requireRole("admin", "trainer"), trainingsController.remove);

module.exports = router;
