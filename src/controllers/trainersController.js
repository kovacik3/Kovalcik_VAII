const trainerModel = require("../models/trainerModel");
const { validateTrainer } = require("../validators");

async function list(req, res) {
  try {
    const rows = await trainerModel.listAll();
    res.render("treneri", {
      title: "Tréneri",
      treneri: rows,
    });
  } catch (err) {
    console.error("Chyba pri nacitani trenerov z DB:", err);
    res.status(500).send("Chyba servera pri nacitani trenerov");
  }
}

async function newForm(req, res) {
  res.render("treneri-new", {
    title: "Nový tréner",
    errors: [],
    formData: {},
  });
}

async function create(req, res) {
  const { name, specialization } = req.body;
  const errors = validateTrainer(req.body);

  if (errors.length > 0) {
    return res.render("treneri-new", {
      title: "Nový tréner",
      errors,
      formData: { name, specialization },
    });
  }

  try {
    await trainerModel.create({ name: name.trim(), specialization: specialization.trim() });
    res.redirect("/treneri");
  } catch (err) {
    console.error("Chyba pri ukladani trenera:", err);
    res.status(500).send("Chyba servera pri vytvarani trenera");
  }
}

async function editForm(req, res) {
  const trainerId = req.params.id;
  try {
    const trainer = await trainerModel.getById(trainerId);
    if (!trainer) {
      return res.status(404).send("Tréner nenájdený");
    }
    res.render("treneri-edit", {
      title: "Upraviť trénera",
      trainer,
      errors: [],
    });
  } catch (err) {
    console.error("Chyba pri nacitani trenera:", err);
    res.status(500).send("Chyba servera pri nacitani trenera");
  }
}

async function update(req, res) {
  const trainerId = req.params.id;
  const { name, specialization } = req.body;
  const errors = validateTrainer(req.body);

  if (errors.length > 0) {
    return res.render("treneri-edit", {
      title: "Upraviť trénera",
      trainer: { id: trainerId, name, specialization },
      errors,
    });
  }

  try {
    await trainerModel.update(trainerId, { name: name.trim(), specialization: specialization.trim() });
    res.redirect("/treneri");
  } catch (err) {
    console.error("Chyba pri uprave trenera:", err);
    res.status(500).send("Chyba servera pri uprave trenera");
  }
}

async function remove(req, res) {
  const trainerId = req.params.id;
  try {
    await trainerModel.remove(trainerId);
    res.redirect("/treneri");
  } catch (err) {
    console.error("Chyba pri mazani trenera:", err);
    res.status(500).send("Chyba servera pri mazani trenera");
  }
}

module.exports = {
  list,
  newForm,
  create,
  editForm,
  update,
  remove,
};
