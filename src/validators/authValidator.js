function validateRegistration(data) {
  const errors = [];
  const first_name = (data?.first_name || "").toString();
  const last_name = (data?.last_name || "").toString();
  const username = (data?.username || "").toString();
  const email = (data?.email || "").toString();
  const password = (data?.password || "").toString();

  if (!first_name || first_name.trim() === "") {
    errors.push("Meno je povinné");
  } else if (first_name.trim().length < 2) {
    errors.push("Meno musí mať aspoň 2 znaky");
  } else if (first_name.trim().length > 50) {
    // DB: users.first_name is VARCHAR(50)
    errors.push("Meno nesmie prekročiť 50 znakov");
  }

  if (!last_name || last_name.trim() === "") {
    errors.push("Priezvisko je povinné");
  } else if (last_name.trim().length < 2) {
    errors.push("Priezvisko musí mať aspoň 2 znaky");
  } else if (last_name.trim().length > 50) {
    // DB: users.last_name is VARCHAR(50)
    errors.push("Priezvisko nesmie prekročiť 50 znakov");
  }

  if (!username || username.trim() === "") {
    errors.push("Používateľské meno je povinné");
  } else if (username.trim().length < 2) {
    errors.push("Používateľské meno musí mať aspoň 2 znaky");
  } else if (username.trim().length > 100) {
    // DB: users.username is VARCHAR(100)
    errors.push("Používateľské meno nesmie prekročiť 100 znakov");
  }

  if (!email || email.trim() === "") {
    errors.push("E-mail je povinný");
  } else if (!email.includes("@") || email.length > 255) {
    errors.push("Zadaj platný e-mail");
  }

  if (!password || password.trim() === "") {
    errors.push("Heslo je povinné");
  } else if (password.length < 8) {
    errors.push("Heslo musí mať aspoň 8 znakov");
  } else if (password.length > 100) {
    errors.push("Heslo nesmie prekročiť 100 znakov");
  }

  return errors;
}

module.exports = {
  validateRegistration,
};
