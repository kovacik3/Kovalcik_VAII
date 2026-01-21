/**
 * Entry point aplikácie.
 *
 * Tento súbor je zodpovedný iba za:
 * - načítanie `.env`
 * - spustenie HTTP servera na zvolenom porte
 * - spustenie periodického cleanupu (mazanie skončených tréningov)
 */

require("dotenv").config();

const app = require("./app");
const { scheduleCleanup } = require("./services/cleanupService");

// Port je možné nastaviť cez .env (PORT). Ak nie je definovaný, použije sa 3000.
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server beží na http://localhost:${PORT}`);
  // Cleanup sa štartuje až po spustení servera (neblokuje štart).
  scheduleCleanup();
});
