/**
 * Validácia formulára trénera.
 */
function validateTrainer(data) {
  const errors = [];
  const name = (data?.name || "").toString();
  const specialization = (data?.specialization || "").toString();

  if (!name || name.trim() === "") {
    errors.push("Meno trénera je povinné");
  } else if (name.trim().length < 2) {
    errors.push("Meno musí mať aspoň 2 znaky");
  } else if (name.trim().length > 100) {
    errors.push("Meno nesmie prekročiť 100 znakov");
  }

  if (!specialization || specialization.trim() === "") {
    errors.push("Špecializácia je povinná");
  } else if (specialization.trim().length < 3) {
    errors.push("Špecializácia musí mať aspoň 3 znaky");
  } else if (specialization.trim().length > 150) {
    errors.push("Špecializácia nesmie prekročiť 150 znakov");
  }

  return errors;
}

module.exports = {
  validateTrainer,
};
