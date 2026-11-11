import multer from "multer";
import path from "path";
import fs from "fs";

const uploadRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");
const maxSize = Number(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024;

function makeStorage(folder) {
  const destination = path.join(uploadRoot, folder);
  fs.mkdirSync(destination, { recursive: true });
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destination),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "");
      const safeName = path.basename(file.originalname, path.extname(file.originalname))
        .toLowerCase().replace(/[^a-z0-9-_]/g, "-").slice(0, 50) || "file";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}${ext}`);
    }
  });
}

function fileFilter(allowed) {
  return (_req, file, cb) => {
    if (allowed(file)) return cb(null, true);
    cb(new Error("Unsupported file type."));
  };
}

const imageOnly = file => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype);
const documentAllowed = file => imageOnly(file) || file.mimetype === "application/pdf";

export const vehicleUpload = multer({
  storage: makeStorage("vehicles"),
  limits: { fileSize: maxSize, files: 12 },
  fileFilter: fileFilter(imageOnly)
}).fields([
  { name: "photos", maxCount: 6 },
  { name: "documents", maxCount: 6 }
]);

export const profileUpload = multer({
  storage: makeStorage("profiles"),
  limits: { fileSize: maxSize, files: 2 },
  fileFilter: fileFilter(imageOnly)
}).fields([{ name: "avatar", maxCount: 1 }]);

export const capacityUpload = multer({
  storage: makeStorage("capacity"),
  limits: { fileSize: maxSize, files: 4 },
  fileFilter: fileFilter(documentAllowed)
});
