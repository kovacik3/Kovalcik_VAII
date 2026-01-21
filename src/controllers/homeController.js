const sessionModel = require("../models/sessionModel");

/**
 * Controller pre domovskú stránku.
 * Načítava najbližšie tréningy (sessions) do boxu "Nadchádzajúce skupinové tréningy".
 */
async function getHome(req, res) {
  try {
    // Z DB vytiahneme len limitovaný počet najbližších tréningov.
    const rows = await sessionModel.getUpcomingHome(3);
    res.render("index", {
      title: "Domov",
      treningy: rows,
    });
  } catch (err) {
    console.error("Chyba pri nacitani nadchadzajucich treningov:", err);
    // Fail-safe: domov sa zobrazí aj pri chybe DB.
    res.render("index", {
      title: "Domov",
      treningy: [],
    });
  }
}

module.exports = {
  getHome,
};
