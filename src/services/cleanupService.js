const sessionModel = require("../models/sessionModel");

async function runCleanupOnce() {
  try {
    const deletedSessions = await sessionModel.cleanupExpiredSessions();
    if (deletedSessions > 0) {
      console.log(
        `[cleanup] Deleted expired sessions: ${deletedSessions} (reservations deleted via CASCADE)`
      );
    }
  } catch (err) {
    console.error("[cleanup] Chyba pri automatickom mazaní skončených tréningov:", err);
  }
}

function scheduleCleanup() {
  // immediately + every hour
  runCleanupOnce();
  setInterval(runCleanupOnce, 60 * 60 * 1000);
}

module.exports = {
  scheduleCleanup,
  runCleanupOnce,
};
