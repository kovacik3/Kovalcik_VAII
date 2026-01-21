const trainerModel = require("../models/trainerModel");
const { validateTrainer } = require("../validators");
const path = require("path");
const fs = require("fs");

function safeUnlink(absPath) {
  if (!absPath) return;
  try {
    fs.unlinkSync(absPath);
  } catch (_) {
    // ignore
  }
}

function toAbsolutePublicPath(photoPath) {
  if (!photoPath || typeof photoPath !== "string") return null;
  // We only delete files that were uploaded into /public/uploads/trainers.
  // Seeded/static images (e.g. /images/...) should never be deleted.
  if (!photoPath.startsWith("/uploads/trainers/")) return null;
  // photoPath is like: /uploads/trainers/filename.jpg
  const rel = photoPath.startsWith("/") ? photoPath.slice(1) : photoPath;
  return path.join(__dirname, "..", "..", "public", rel);
}

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

  // Upload error -> user-friendly render
  if (req.uploadError) {
    errors.push(req.uploadError);
  }

  if (errors.length > 0) {
    // ak už multer uložil súbor a validácia padla, vymažeme ho
    if (req.file?.path) {
      safeUnlink(req.file.path);
    }
    return res.render("treneri-new", {
      title: "Nový tréner",
      errors,
      formData: { name, specialization },
    });
  }

  try {
    const photo_path = req.file ? `/uploads/trainers/${req.file.filename}` : null;
    await trainerModel.create({
      name: name.trim(),
      specialization: specialization.trim(),
      photo_path,
    });
    res.redirect("/treneri");
  } catch (err) {
    if (req.file?.path) {
      safeUnlink(req.file.path);
    }
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

  if (req.uploadError) {
    errors.push(req.uploadError);
  }

  let existing = null;
  try {
    existing = await trainerModel.getById(trainerId);
  } catch (err) {
    console.error("Chyba pri nacitani trenera pred update:", err);
  }

  if (!existing) {
    if (req.file?.path) {
      safeUnlink(req.file.path);
    }
    return res.status(404).send("Tréner nenájdený");
  }

  if (errors.length > 0) {
    if (req.file?.path) {
      safeUnlink(req.file.path);
    }
    return res.render("treneri-edit", {
      title: "Upraviť trénera",
      trainer: {
        id: trainerId,
        name,
        specialization,
        photo_path: existing.photo_path,
      },
      errors,
    });
  }

  try {
    let newPhotoPath;
    if (req.file) {
      newPhotoPath = `/uploads/trainers/${req.file.filename}`;
    }

    await trainerModel.update(trainerId, {
      name: name.trim(),
      specialization: specialization.trim(),
      photo_path: newPhotoPath !== undefined ? newPhotoPath : undefined,
    });

    if (req.file && existing.photo_path) {
      safeUnlink(toAbsolutePublicPath(existing.photo_path));
    }

    res.redirect("/treneri");
  } catch (err) {
    if (req.file?.path) {
      safeUnlink(req.file.path);
    }
    console.error("Chyba pri uprave trenera:", err);
    res.status(500).send("Chyba servera pri uprave trenera");
  }
}

async function remove(req, res) {
  const trainerId = req.params.id;
  try {
    const trainer = await trainerModel.getById(trainerId);
    await trainerModel.remove(trainerId);
    if (trainer?.photo_path) {
      safeUnlink(toAbsolutePublicPath(trainer.photo_path));
    }
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
