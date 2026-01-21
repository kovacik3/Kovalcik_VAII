const rateLimit = require("express-rate-limit");

// Rate limiter pre prihlasovanie – chráni pred brute-force útokmi.
// Pri prekročení limitu nerobíme len `res.send`, ale priamo znovu vyrenderujeme login stránku,
// aby UX ostalo konzistentné (a aby sa zobrazila zrozumiteľná hláška).
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Príliš veľa pokusov o prihlásenie. Skúste znova o 15 minút.",
  handler: (req, res, _next, options) => {
    // Zachováme email (ak bol odoslaný), aby ho používateľ nemusel znovu vypisovať.
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
