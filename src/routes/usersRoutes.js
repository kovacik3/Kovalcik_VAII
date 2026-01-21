const express = require("express");
const usersController = require("../controllers/usersController");
const { requireRole } = require("../middlewares/auth");

const router = express.Router();

// Správa používateľov – iba admin
router.get("/uzivatelia", requireRole("admin"), usersController.list);
router.post("/uzivatelia/:id/role", requireRole("admin"), usersController.updateRole);

// AJAX (bez refreshu stránky)
router.post("/api/uzivatelia/:id/role", requireRole("admin"), usersController.updateRoleAjax);

module.exports = router;
