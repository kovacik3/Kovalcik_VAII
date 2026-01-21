const express = require("express");
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middlewares/rate-limiters");

const router = express.Router();

// Prihlásenie
router.get("/login", authController.getLogin);
// POST /login je limitovaný (ochrana pred brute-force)
router.post("/login", loginLimiter, authController.postLogin);

// Odhlásenie
router.post("/logout", authController.postLogout);

// Registrácia
router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

module.exports = router;
