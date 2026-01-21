const express = require("express");
const usersController = require("../controllers/usersController");
const { requireRole } = require("../middlewares/auth");

const router = express.Router();

router.get("/uzivatelia", requireRole("admin"), usersController.list);
router.post("/uzivatelia/:id/role", requireRole("admin"), usersController.updateRole);

// AJAX (no page reload)
router.post("/api/uzivatelia/:id/role", requireRole("admin"), usersController.updateRoleAjax);

module.exports = router;
