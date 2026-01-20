// Backward-compatible wrapper.
// New code should import from `src/validators`.

const validators = require("./validators");

function validujNovehoTrenera(trener) {
  return validators.validateTrainer(trener);
}

function validujNovyTrening(trening) {
  return validators.validateTraining(trening);
}

function validujNovuRezervaciju(rezervacia) {
  return validators.validateReservation(rezervacia);
}

function validujRegistraciu(data) {
  return validators.validateRegistration(data);
}

module.exports = {
  validujNovehoTrenera,
  validujNovyTrening,
  validujNovuRezervaciju,
  validujRegistraciu,
};