const express = require("express");
const usersController = require("../controllers/usersController");
const { requireRole } = require("../middlewares/auth");

const router = express.Router();

router.get("/uzivatelia", requireRole("admin"), usersController.list);
router.post("/uzivatelia/:id/role", requireRole("admin"), usersController.updateRole);

module.exports = router;
