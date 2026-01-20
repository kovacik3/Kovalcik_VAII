// Auth / authorization middlewares (previously inline in app.js)

function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect("/login");
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session.user) {
      req.session.returnTo = req.originalUrl;
      return res.redirect("/login");
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).send("Nedostatočné oprávnenie");
    }
    next();
  };
}

function requireCustomer(req, res, next) {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect("/login");
  }
  if (req.session.user.role !== "user") {
    return res.status(403).send("Admin ani tréner nemôžu vytvárať rezervácie.");
  }
  next();
}

module.exports = {
  requireAuth,
  requireRole,
  requireCustomer,
};
