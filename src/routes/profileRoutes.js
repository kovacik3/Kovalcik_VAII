const express = require("express");
const profileController = require("../controllers/profileController");
const { requireAuth } = require("../middlewares/auth");

const router = express.Router();

// Profil – iba prihlásený používateľ
router.get("/profil", requireAuth, profileController.getProfile);
router.get("/profil/edit", requireAuth, profileController.getEditProfile);
router.post("/profil/edit", requireAuth, profileController.postEditProfile);

module.exports = router;
