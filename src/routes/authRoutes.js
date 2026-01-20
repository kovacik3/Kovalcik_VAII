const express = require("express");
const authController = require("../controllers/authController");
const { loginLimiter } = require("../middlewares/rate-limiters");

const router = express.Router();

router.get("/login", authController.getLogin);
router.post("/login", loginLimiter, authController.postLogin);
router.post("/logout", authController.postLogout);

router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

module.exports = router;
