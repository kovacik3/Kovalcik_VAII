function validateProfileUpdate(data) {
  const errors = [];

  const first_name = (data?.first_name || "").toString();
  const last_name = (data?.last_name || "").toString();
  const username = (data?.username || "").toString();

  const password = (data?.password || "").toString();
  const password_confirm = (data?.password_confirm || "").toString();

  if (!first_name || first_name.trim() === "") {
    errors.push("Meno je povinné");
  } else if (first_name.trim().length < 2) {
    errors.push("Meno musí mať aspoň 2 znaky");
  } else if (first_name.trim().length > 100) {
    errors.push("Meno môže mať najviac 100 znakov");
  }

  if (!last_name || last_name.trim() === "") {
    errors.push("Priezvisko je povinné");
  } else if (last_name.trim().length < 2) {
    errors.push("Priezvisko musí mať aspoň 2 znaky");
  } else if (last_name.trim().length > 100) {
    errors.push("Priezvisko môže mať najviac 100 znakov");
  }

  if (!username || username.trim() === "") {
    errors.push("Používateľské meno je povinné");
  } else if (username.trim().length < 2) {
    errors.push("Používateľské meno musí mať aspoň 2 znaky");
  } else if (username.trim().length > 100) {
    errors.push("Používateľské meno môže mať najviac 100 znakov");
  }

  // Password is optional – only validate if user is changing it.
  if (password && password.trim() !== "") {
    if (password.length < 8) {
      errors.push("Heslo musí mať aspoň 8 znakov");
    } else if (password.length > 100) {
      errors.push("Heslo môže mať najviac 100 znakov");
    }

    if (!password_confirm || password_confirm.trim() === "") {
      errors.push("Potvrdenie hesla je povinné");
    } else if (password_confirm !== password) {
      errors.push("Heslá sa nezhodujú");
    }
  }

  return errors;
}

module.exports = {
  validateProfileUpdate,
};
