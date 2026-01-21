const express = require("express");
const trainersController = require("../controllers/trainersController");
const { requireRole } = require("../middlewares/auth");
const { uploadTrainerPhoto } = require("../middlewares/trainer-upload");

const router = express.Router();

function trainerPhotoUpload(req, res, next) {
	uploadTrainerPhoto.single("photo")(req, res, (err) => {
		if (!err) return next();

		if (err.code === "LIMIT_FILE_SIZE") {
			req.uploadError = "Fotka je príliš veľká (max 3MB).";
		} else if (err.code === "INVALID_FILE_TYPE") {
			req.uploadError = err.message || "Nepodporovaný typ fotky.";
		} else {
			req.uploadError = err.message || "Chyba pri nahrávaní fotky.";
		}

		return next();
	});
}

router.get("/treneri", trainersController.list);
router.get("/treneri/new", requireRole("admin"), trainersController.newForm);
router.post(
	"/treneri/new",
	requireRole("admin"),
	trainerPhotoUpload,
	trainersController.create
);
router.get("/treneri/:id/edit", requireRole("admin"), trainersController.editForm);
router.post(
	"/treneri/:id/edit",
	requireRole("admin"),
	trainerPhotoUpload,
	trainersController.update
);
router.post("/treneri/:id/delete", requireRole("admin"), trainersController.remove);

module.exports = router;
