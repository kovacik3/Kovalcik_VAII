const { validateTrainer } = require("./trainerValidator");
const { validateTraining } = require("./trainingValidator");
const { validateReservation } = require("./reservationValidator");
const { validateRegistration } = require("./authValidator");
const { validateProfileUpdate } = require("./profileValidator");

// Pohodlný "barrel" export validátorov – aby sa v kóde importovalo z jedného miesta.

module.exports = {
  validateTrainer,
  validateTraining,
  validateReservation,
  validateRegistration,
  validateProfileUpdate,
};
