// Entry point: starts the HTTP server.

require("dotenv").config();

const app = require("./app");
const { scheduleCleanup } = require("./services/cleanupService");

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Server beží na http://localhost:${PORT}`);
  scheduleCleanup();
});
