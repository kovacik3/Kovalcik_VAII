// Spätná kompatibilita: starší kód používal slovenské názvy funkcií validácie.
// Nový kód preferuje importy z `src/validators`.

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