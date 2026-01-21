const reservationModel = require("../models/reservationModel");
const sessionModel = require("../models/sessionModel");
const { validateReservation } = require("../validators");
const { parsePositiveInt } = require("../utils/id");

async function newForm(req, res) {
  const treningId = parsePositiveInt(req.query.treningId);
  if (!treningId) {
    return res.status(400).send("Neplatné treningId");
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
  const errors = validateReservation(req.body);

  const sessionIdParsed = parsePositiveInt(session_id);
  if (!sessionIdParsed) {
    errors.push("Neplatné ID tréningu");
  }

  let session = null;

  try {
    session = sessionIdParsed ? await sessionModel.getForReservationNew(sessionIdParsed) : null;
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

    const dupe = await reservationModel.existsForUser(sessionIdParsed, req.session.user.id);
    if (dupe) {
      errors.push("Už máš rezerváciu na tento tréning.");
      return res.render("rezervacie-new", {
        title: "Nová rezervácia",
        session,
        errors,
        formData: { note },
      });
    }

    const capacity = Number(session?.capacity);
    if (Number.isFinite(capacity) && capacity > 0) {
      const reservedCount = await reservationModel.countForSession(sessionIdParsed);
      if (reservedCount >= capacity) {
        errors.push("Tento tréning je už plný (kapacita je naplnená).");
        return res.render("rezervacie-new", {
          title: "Nová rezervácia",
          session,
          errors,
          formData: { note },
        });
      }
    }

    const effectiveClientName = req.session.user.username;

    await reservationModel.create({
      session_id: sessionIdParsed,
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
  const reservationId = parsePositiveInt(req.params.id);
  if (!reservationId) {
    return res.status(400).send("Neplatné ID rezervácie");
  }
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

// AJAX variant – returns JSON instead of redirect
async function removeAjax(req, res) {
  const reservationId = parsePositiveInt(req.params.id);
  if (!reservationId) {
    return res.status(400).json({ success: false, error: "Neplatné ID rezervácie" });
  }
  try {
    const isStaff = ["admin", "trainer"].includes(req.session.user?.role);
    const result = await reservationModel.remove({
      reservationId,
      isStaff,
      userId: req.session.user.id,
    });

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Rezervácia nenájdená alebo nemáš oprávnenie.",
      });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Chyba pri AJAX mazani rezervacie:", err);
    return res.status(500).json({ success: false, error: "Chyba servera" });
  }
}

module.exports = {
  newForm,
  create,
  list,
  remove,
  removeAjax,
};
