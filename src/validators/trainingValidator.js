/**
 * Validácia formulára tréningu (session).
 */
function validateTraining(data) {
  const errors = [];
  const title = (data?.title || "").toString();
  const start_at = (data?.start_at || "").toString();
  const end_at = (data?.end_at || "").toString();
  const capacity = data?.capacity;
  const trainer_id = data?.trainer_id;

  if (!title || title.trim() === "") {
    errors.push("Názov tréningového kurzu je povinný");
  } else if (title.trim().length < 3) {
    errors.push("Názov musí mať aspoň 3 znaky");
  } else if (title.trim().length > 100) {
    errors.push("Názov nesmie prekročiť 100 znakov");
  }

  if (!start_at || start_at.trim() === "") {
    errors.push("Čas začatia je povinný");
  }

  if (!end_at || end_at.trim() === "") {
    errors.push("Čas konca je povinný");
  }

  if (start_at && end_at && start_at.trim() !== "" && end_at.trim() !== "") {
    const startDate = new Date(start_at);
    const endDate = new Date(end_at);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      errors.push("Neplatný formát času");
    } else if (endDate <= startDate) {
      errors.push("Čas konca musí byť neskôr ako čas začatia");
    }
  }

  if (capacity === undefined || capacity === null || capacity === "") {
    errors.push("Kapacita je povinná");
  } else if (isNaN(Number(capacity))) {
    errors.push("Kapacita musí byť číslo");
  } else if (Number(capacity) < 1) {
    errors.push("Kapacita musí byť aspoň 1");
  } else if (Number(capacity) > 1000) {
    errors.push("Kapacita nesmie prekročiť 1000");
  }

  if (trainer_id && trainer_id !== "" && isNaN(Number(trainer_id))) {
    errors.push("ID trénera musí byť číslo");
  }

  return errors;
}

module.exports = {
  validateTraining,
};
