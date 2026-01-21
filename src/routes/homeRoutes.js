const express = require("express");
const homeController = require("../controllers/homeController");

const router = express.Router();

// Domovská stránka
router.get("/", homeController.getHome);

module.exports = router;
