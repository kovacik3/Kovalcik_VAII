const sessionModel = require("../models/sessionModel");
const trainerModel = require("../models/trainerModel");
const { validateTraining } = require("../validators");
const { datetimeLocalToMySql, datetimeLocalToDate } = require("../utils/datetime");

async function newForm(req, res) {
  try {
    const trainers = await trainerModel.listForSelect();
    res.render("treningy-new", {
      title: "Nový tréning",
      errors: [],
      formData: {},
      trainers,
    });
  } catch (err) {
    console.error("Chyba pri nacitani trenerov pre novy trening:", err);
    res.status(500).send("Chyba servera pri priprave formulára");
  }
}

async function create(req, res) {
  const { title, start_at, end_at, capacity, trainer_id } = req.body;
  const errors = validateTraining(req.body);

  const formData = { title, start_at, end_at, capacity, trainer_id };
  if (errors.length > 0) {
    try {
      const trainers = await trainerModel.listForSelect();
      return res.render("treningy-new", {
        title: "Nový tréning",
        errors,
        formData,
        trainers,
      });
    } catch (err) {
      console.error("Chyba pri nacitani trenerov pri validacii noveho treningu:", err);
      return res.status(500).send("Chyba servera pri validacii formulára");
    }
  }

  const startForDb = datetimeLocalToMySql(start_at);
  const endForDb = datetimeLocalToMySql(end_at);

  try {
    await sessionModel.create({
      title: title.trim(),
      start_at: startForDb,
      end_at: endForDb,
      capacity: Number(capacity),
      trainer_id: trainer_id ? Number(trainer_id) : null,
    });
    res.redirect("/treningy");
  } catch (err) {
    console.error("Chyba pri vytvarani tréningov:", err);
    res.status(500).send("Chyba servera pri vytvarani treningu");
  }
}

async function list(req, res) {
  try {
    const rawTrainerId = (req.query?.trainerId || "").toString().trim();
    let selectedTrainerId = null;
    if (rawTrainerId !== "") {
      const n = Number(rawTrainerId);
      if (!Number.isNaN(n) && Number.isFinite(n) && n > 0) {
        selectedTrainerId = n;
      }
    }

    const trainers = await trainerModel.listForSelect();
    const rows = await sessionModel.listAllWithTrainer({ trainerId: selectedTrainerId });
    res.render("treningy", {
      title: "Tréningy",
      treningy: rows,
      trainers,
      selectedTrainerId,
    });
  } catch (err) {
    console.error("Chyba pri nacitani tréningov:", err);
    res.status(500).send("Chyba servera pri nacitani treningov");
  }
}

async function editForm(req, res) {
  const treningId = req.params.id;
  try {
    const trening = await sessionModel.getById(treningId);
    if (!trening) {
      return res.status(404).send("Tréning nenájdený");
    }
    const trainers = await trainerModel.listForSelect();
    res.render("treningy-edit", {
      title: "Upraviť tréning",
      trening,
      trainers,
      errors: [],
    });
  } catch (err) {
    console.error("Chyba pri nacitani tréningov:", err);
    res.status(500).send("Chyba servera pri nacitani treningu");
  }
}

async function update(req, res) {
  const treningId = req.params.id;
  const { title, start_at, end_at, capacity, trainer_id } = req.body;
  const errors = validateTraining(req.body);

  if (errors.length > 0) {
    try {
      const trainers = await trainerModel.listForSelect();
      return res.render("treningy-edit", {
        title: "Upraviť tréning",
        trening: {
          id: treningId,
          title,
          start_at: datetimeLocalToDate(start_at),
          end_at: datetimeLocalToDate(end_at),
          capacity,
          trainer_id,
        },
        trainers,
        errors,
      });
    } catch (err) {
      console.error("Chyba pri nacitani trenerov pri validacii upravy treningu:", err);
      return res.status(500).send("Chyba servera pri validacii formulára");
    }
  }

  const startForDb = datetimeLocalToMySql(start_at);
  const endForDb = datetimeLocalToMySql(end_at);

  try {
    await sessionModel.update(treningId, {
      title: title.trim(),
      start_at: startForDb,
      end_at: endForDb,
      capacity: Number(capacity),
      trainer_id: trainer_id ? Number(trainer_id) : null,
    });

    res.redirect("/treningy");
  } catch (err) {
    console.error("Chyba pri uprave tréningov:", err);
    res.status(500).send("Chyba servera pri uprave treningu");
  }
}

async function remove(req, res) {
  const treningId = req.params.id;
  try {
    await sessionModel.remove(treningId);
    res.redirect("/treningy");
  } catch (err) {
    console.error("Chyba pri mazani tréningov:", err);
    res.status(500).send("Chyba servera pri mazani treningu");
  }
}

module.exports = {
  newForm,
  create,
  list,
  editForm,
  update,
  remove,
};
