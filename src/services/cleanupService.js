const sessionModel = require("../models/sessionModel");

/**
 * Cleanup service.
 *
 * Úloha: periodicky mazať tréningy, ktoré už skončili (end_at < NOW()).
 * Rezervácie sa zmažú automaticky cez ON DELETE CASCADE.
 */

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
  // Spustíme hneď po štarte + potom každú hodinu.
  runCleanupOnce();
  setInterval(runCleanupOnce, 60 * 60 * 1000);
}

module.exports = {
  scheduleCleanup,
  runCleanupOnce,
};
