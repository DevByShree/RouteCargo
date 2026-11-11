const multer = require('multer'), fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '../../uploads'); fs.mkdirSync(dir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '')}`)
});

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

module.exports = multer({
    storage, limits: { fileSize: 5 * 1024 * 1024, files: 12 },
    fileFilter: (req, file, cb) => allowed.has(file.mimetype) ? cb(null, true) : cb(Object.assign(new Error('Only JPG, PNG, WEBP, and PDF files are allowed'),
        { status: 400 }))
});
