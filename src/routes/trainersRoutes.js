const express = require("express");
const trainersController = require("../controllers/trainersController");
const { requireRole } = require("../middlewares/auth");

const router = express.Router();

router.get("/treneri", trainersController.list);
router.get("/treneri/new", requireRole("admin"), trainersController.newForm);
router.post("/treneri/new", requireRole("admin"), trainersController.create);
router.get("/treneri/:id/edit", requireRole("admin"), trainersController.editForm);
router.post("/treneri/:id/edit", requireRole("admin"), trainersController.update);
router.post("/treneri/:id/delete", requireRole("admin"), trainersController.remove);

module.exports = router;
