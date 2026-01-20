// Makes CSRF token and session user info available to EJS views via res.locals

function viewLocals(req, res, next) {
  // csurf middleware must run before this.
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  res.locals.isAdmin = req.session.user?.role === "admin";
  res.locals.isTrainer = req.session.user?.role === "trainer";
  next();
}

module.exports = viewLocals;
