document.addEventListener("DOMContentLoaded", () => {
  initFormValidation();
});

function initFormValidation() {
  const forms = document.querySelectorAll("form.js-validate");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      // pred každou validáciou zrušíme custom chybové hlášky
      clearCustomErrors(form);

      let valid = form.checkValidity();

      // extra kontrola: meno klienta (ak existuje)
      const clientNameInput = form.querySelector('input[name="client_name"]');
      if (clientNameInput) {
        const value = clientNameInput.value.trim();
        if (value.length > 0 && value.length < 2) {
          clientNameInput.setCustomValidity("Meno musí mať aspoň 2 znaky.");
          valid = false;
        }
      }

      // extra kontrola: meno a priezvisko pri registrácii (ak existujú)
      const firstNameInput = form.querySelector('input[name="first_name"]');
      if (firstNameInput) {
        const value = firstNameInput.value.trim();
        if (value.length === 0) {
          firstNameInput.setCustomValidity("Meno je povinné.");
          valid = false;
        } else if (value.length < 2) {
          firstNameInput.setCustomValidity("Meno musí mať aspoň 2 znaky.");
          valid = false;
        }
      }

      const lastNameInput = form.querySelector('input[name="last_name"]');
      if (lastNameInput) {
        const value = lastNameInput.value.trim();
        if (value.length === 0) {
          lastNameInput.setCustomValidity("Priezvisko je povinné.");
          valid = false;
        } else if (value.length < 2) {
          lastNameInput.setCustomValidity("Priezvisko musí mať aspoň 2 znaky.");
          valid = false;
        }
      }

      // extra kontrola: username pri registrácii / profile (ak existuje)
      const usernameInput = form.querySelector('input[name="username"]');
      if (usernameInput) {
        const value = usernameInput.value.trim();
        if (value.length === 0) {
          usernameInput.setCustomValidity("Používateľské meno je povinné.");
          valid = false;
        } else if (value.length < 2) {
          usernameInput.setCustomValidity("Používateľské meno musí mať aspoň 2 znaky.");
          valid = false;
        } else if (value.length > 100) {
          usernameInput.setCustomValidity("Používateľské meno môže mať najviac 100 znakov.");
          valid = false;
        }
      }

      // extra kontrola: kapacita (ak existuje)
      const capacityInput = form.querySelector('input[name="capacity"]');
      if (capacityInput) {
        const capValue = capacityInput.value.trim();
        const capNumber = Number(capValue);

        if (capValue !== "" && (!Number.isInteger(capNumber) || capNumber < 1)) {
          capacityInput.setCustomValidity("Kapacita musí byť celé číslo aspoň 1.");
          valid = false;
        }
      }

      // extra kontrola: start_at < end_at (ak existujú)
      const startInput = form.querySelector('input[name="start_at"]');
      const endInput = form.querySelector('input[name="end_at"]');
      if (startInput && endInput && startInput.value && endInput.value) {
        const startDate = new Date(startInput.value);
        const endDate = new Date(endInput.value);

        if (endDate <= startDate) {
          endInput.setCustomValidity("Koniec musí byť neskôr ako začiatok.");
          valid = false;
        }
      }

      if (!valid) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add("was-validated");
    });
  });
}

function clearCustomErrors(form) {
  const inputs = form.querySelectorAll("input, textarea, select");
  inputs.forEach((el) => el.setCustomValidity(""));
}
