const { validateTrainer } = require("./trainerValidator");
const { validateTraining } = require("./trainingValidator");
const { validateReservation } = require("./reservationValidator");
const { validateRegistration } = require("./authValidator");
const { validateProfileUpdate } = require("./profileValidator");

module.exports = {
  validateTrainer,
  validateTraining,
  validateReservation,
  validateRegistration,
  validateProfileUpdate,
};
