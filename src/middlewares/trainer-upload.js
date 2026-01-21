const path = require("path");
const fs = require("fs");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "..", "public", "uploads", "trainers");

function ensureUploadDir() {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    // ignore
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext && ext.length <= 10 ? ext : ".jpg";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `trainer-${unique}${safeExt}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowed.has(file.mimetype)) {
    const err = new Error("Nepodporovaný typ súboru. Nahraj JPG/PNG/WebP.");
    err.code = "INVALID_FILE_TYPE";
    return cb(err, false);
  }
  cb(null, true);
}

const uploadTrainerPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
});

module.exports = {
  uploadTrainerPhoto,
  uploadDir,
};
