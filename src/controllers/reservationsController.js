const reservationModel = require("../models/reservationModel");
const sessionModel = require("../models/sessionModel");
const validaciaServer = require("../validacia-server");

async function newForm(req, res) {
  const treningId = req.query.treningId;
  if (!treningId) {
    return res.status(400).send("Chýba treningId");
  }

  try {
    const trening = await sessionModel.getForReservationNew(treningId);
    if (!trening) {
      return res.status(404).send("Tréning nenájdený");
    }

    res.render("rezervacie-new", {
      title: "Nová rezervácia",
      session: trening,
      errors: [],
      formData: { note: "" },
    });
  } catch (err) {
    console.error("Chyba pri nacitani session pre rezervaciu:", err);
    res.status(500).send("Chyba servera pri priprave rezervacie");
  }
}

async function create(req, res) {
  const { session_id, note } = req.body;
  const errors = validaciaServer.validujNovuRezervaciju(req.body);

  let session = null;

  try {
    session = await sessionModel.getForReservationNew(session_id);
    if (!session) {
      errors.push("Zvolený tréning neexistuje.");
    }

    if (errors.length > 0) {
      return res.render("rezervacie-new", {
        title: "Nová rezervácia",
        session,
        errors,
        formData: { note },
      });
    }

    const dupe = await reservationModel.existsForUser(Number(session_id), req.session.user.id);
    if (dupe) {
      errors.push("Už máš rezerváciu na tento tréning.");
      return res.render("rezervacie-new", {
        title: "Nová rezervácia",
        session,
        errors,
        formData: { note },
      });
    }

    const effectiveClientName = req.session.user.username;

    await reservationModel.create({
      session_id: Number(session_id),
      client_name: effectiveClientName,
      note: note && note.trim() ? note.trim() : null,
      user_id: req.session.user.id,
    });

    res.redirect("/rezervacie");
  } catch (err) {
    console.error("Chyba pri vytvarani rezervacie:", err);
    res.status(500).send("Chyba servera pri vytvarani rezervacie");
  }
}

async function list(req, res) {
  try {
    const isStaff = ["admin", "trainer"].includes(req.session.user?.role);
    const rows = await reservationModel.listWithDetails({
      isStaff,
      userId: req.session.user.id,
    });

    res.render("rezervacie", {
      title: isStaff ? "Rezervácie" : "Moje rezervácie",
      rezervacie: rows,
    });
  } catch (err) {
    console.error("Chyba pri nacitani rezervacii:", err);
    res.status(500).send("Chyba servera pri nacitani rezervacii");
  }
}

async function remove(req, res) {
  const reservationId = req.params.id;
  try {
    const isStaff = ["admin", "trainer"].includes(req.session.user?.role);
    const result = await reservationModel.remove({
      reservationId,
      isStaff,
      userId: req.session.user.id,
    });

    if (!result || result.affectedRows === 0) {
      return res.status(404).send("Rezervácia nenájdená alebo nemáš oprávnenie.");
    }
    res.redirect("/rezervacie");
  } catch (err) {
    console.error("Chyba pri mazani rezervacie:", err);
    res.status(500).send("Chyba servera pri mazani rezervacie");
  }
}

module.exports = {
  newForm,
  create,
  list,
  remove,
};
