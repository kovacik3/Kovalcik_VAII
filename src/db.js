// Spätná kompatibilita: starší kód importoval DB z `src/db.js`.
// Nový kód preferuje `src/config/database.js`.
module.exports = require("./config/database");
