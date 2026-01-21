function validateReservation(data) {
  const errors = [];
  const session_id = data?.session_id;
  const note = (data?.note || "").toString();

  if (!session_id || session_id === "") {
    errors.push("Výber tréningového kurzu je povinný");
  } else {
    const n = Number(session_id);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) {
      errors.push("Neplatné ID tréningového kurzu");
    }
  }

  if (note && note.trim().length > 255) {
    errors.push("Poznámka nesmie prekročiť 255 znakov");
  }

  return errors;
}

module.exports = {
  validateReservation,
};
