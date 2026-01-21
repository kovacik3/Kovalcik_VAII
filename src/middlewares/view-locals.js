/**
 * Middleware: sprístupní vybrané hodnoty do EJS šablón cez `res.locals`.
 *
 * V šablónach potom môžeme používať napr.:
 * - csrfToken
 * - currentUser
 * - isAuthenticated / isAdmin / isTrainer
 */

function viewLocals(req, res, next) {
  // csurf middleware musí bežať pred týmto middleware (kvôli req.csrfToken()).
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  res.locals.isAdmin = req.session.user?.role === "admin";
  res.locals.isTrainer = req.session.user?.role === "trainer";
  next();
}

module.exports = viewLocals;
