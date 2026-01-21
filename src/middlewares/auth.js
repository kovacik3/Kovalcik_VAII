/**
 * Auth / authorization middlewares.
 *
 * Zodpovednosti:
 * - kontrola prihlásenia používateľa
 * - kontrola roly (admin/trainer/user)
 * - presmerovanie na /login + uloženie pôvodnej URL (returnTo)
 */

/**
 * Vyžaduje, aby bol používateľ prihlásený.
 * Ak nie je, uloží pôvodnú URL do session a presmeruje na login.
 */
function requireAuth(req, res, next) {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect("/login");
  }
  next();
}

/**
 * Middleware factory: vyžaduje, aby bol používateľ prihlásený a mal jednu z povolených rolí.
 *
 * @param  {...string} roles Povolené roly (napr. "admin", "trainer")
 */
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

/**
 * Vyžaduje prihláseného zákazníka (role === "user").
 * Použité najmä pri tvorbe rezervácií – admin ani tréner nemajú vytvárať rezervácie.
 */
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
