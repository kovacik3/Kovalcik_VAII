/**
 * Express error-handling middleware pre CSRF chyby.
 *
 * Knižnica `csurf` v prípade chýbajúceho/neplatného tokenu vyhodí error s kódom `EBADCSRFTOKEN`.
 * Tu ho zachytíme a vrátime používateľovi zrozumiteľnú 403 odpoveď.
 */
function csrfErrorHandler(err, req, res, next) {
  if (err && err.code === "EBADCSRFTOKEN") {
    console.error("CSRF token error:", err);
    return res.status(403).send("Neplatný alebo chýbajúci CSRF token. Skús to znova.");
  }
  next(err);
}

module.exports = csrfErrorHandler;
