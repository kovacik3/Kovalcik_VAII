const express = require("express");
const profileController = require("../controllers/profileController");
const { requireAuth } = require("../middlewares/auth");

const router = express.Router();

router.get("/profil", requireAuth, profileController.getProfile);
router.get("/profil/edit", requireAuth, profileController.getEditProfile);
router.post("/profil/edit", requireAuth, profileController.postEditProfile);

module.exports = router;
