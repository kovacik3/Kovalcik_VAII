const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Upload priečinok pre fotky trénerov (v public/, aby boli priamo dostupné cez statické súbory).
const uploadDir = path.join(__dirname, "..", "..", "public", "uploads", "trainers");

/**
 * Bezpečne vytvorí upload priečinok, ak neexistuje.
 * (Používame sync variant, lebo sa volá len pri uploade a je to jednoduchšie.)
 */
function ensureUploadDir() {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch (err) {
    // ignore
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Pred uložením súboru sa uistíme, že priečinok existuje.
    ensureUploadDir();
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Generujeme unikátny názov súboru, aby sa uploady neprepisovali.
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext && ext.length <= 10 ? ext : ".jpg";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `trainer-${unique}${safeExt}`);
  },
});

/**
 * Povolené typy súborov – nepúšťame hocijaké binárky.
 * Pri chybe nastavíme vlastný `err.code`, aby routes/controller vedeli spraviť peknú hlášku.
 */
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
    // Limity chránia server pred príliš veľkými uploadmi.
    fileSize: 3 * 1024 * 1024, // 3MB
  },
});

module.exports = {
  uploadTrainerPhoto,
  uploadDir,
};
