const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Príliš veľa pokusov o prihlásenie. Skúste znova o 15 minút.",
  handler: (req, res, _next, options) => {
    return res.status(options.statusCode || 429).render("login", {
      title: "Prihlásenie",
      errors: [options.message || "Príliš veľa pokusov o prihlásenie. Skúste znova o 15 minút."],
      formData: { email: req.body?.email || "" },
    });
  },
});

module.exports = {
  loginLimiter,
};
