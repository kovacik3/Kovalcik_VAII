const sessionModel = require("../models/sessionModel");

async function getHome(req, res) {
  try {
    const rows = await sessionModel.getUpcomingHome(3);
    res.render("index", {
      title: "Domov",
      treningy: rows,
    });
  } catch (err) {
    console.error("Chyba pri nacitani nadchadzajucich treningov:", err);
    res.render("index", {
      title: "Domov",
      treningy: [],
    });
  }
}

module.exports = {
  getHome,
};
