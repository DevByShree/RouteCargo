const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.join(__dirname, "../../uploads/profiles");
const extensions = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

module.exports = multer({
  storage: multer.diskStorage({
    destination(_req, _file, callback) {
      fs.mkdirSync(uploadDirectory, { recursive: true });
      callback(null, uploadDirectory);
    },
    filename(_req, file, callback) {
      callback(null, `${crypto.randomUUID()}${extensions[file.mimetype] || ".bin"}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!Object.hasOwn(extensions, file.mimetype)) {
      return callback(Object.assign(new Error("Profile photos must be JPG, PNG, or WEBP images"), { status: 400 }));
    }
    return callback(null, true);
  },
});
