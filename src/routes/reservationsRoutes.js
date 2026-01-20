const express = require("express");
const reservationsController = require("../controllers/reservationsController");
const { requireAuth, requireCustomer } = require("../middlewares/auth");

const router = express.Router();

router.get("/rezervacie/new", requireCustomer, reservationsController.newForm);
router.post("/rezervacie/new", requireCustomer, reservationsController.create);

router.get("/rezervacie", requireAuth, reservationsController.list);
router.post("/rezervacie/:id/delete", requireAuth, reservationsController.remove);

module.exports = router;
