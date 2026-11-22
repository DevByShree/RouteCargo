const fs = require("fs/promises");
const path = require("path");
const User = require("../models/User");

const profileDirectory = path.resolve(__dirname, "../../uploads/profiles");
const PHOTO_SIGNATURES = [
  { mimeType: "image/jpeg", matches: buffer => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff },
  { mimeType: "image/png", matches: buffer => buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mimeType: "image/webp", matches: buffer => buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP" },
];

function ownedPhotoPath(photoUrl) {
  if (typeof photoUrl !== "string" || !photoUrl.startsWith("/uploads/profiles/")) return null;
  const name = path.basename(photoUrl);
  const resolved = path.resolve(profileDirectory, name);
  return resolved.startsWith(`${profileDirectory}${path.sep}`) ? resolved : null;
}

async function removeFile(photoUrl) {
  const oldPath = ownedPhotoPath(photoUrl);
  if (oldPath) await fs.unlink(oldPath).catch(error => { if (error.code !== "ENOENT") throw error; });
}

exports.upload = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "Choose a JPG, PNG, or WEBP photo" });
  const storedPath = path.resolve(req.file.path);
  try {
    const bytes = await fs.readFile(storedPath);
    const signature = PHOTO_SIGNATURES.find(item => item.mimeType === req.file.mimetype && item.matches(bytes));
    if (!signature) {
      await fs.unlink(storedPath).catch(() => {});
      return res.status(400).json({ success: false, message: "The uploaded file is not a valid image of the selected type" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      await fs.unlink(storedPath).catch(() => {});
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const previousPhoto = user.profilePhoto;
    user.profilePhoto = `/uploads/profiles/${path.basename(storedPath)}`;
    await user.save();
    await removeFile(previousPhoto);
    return res.json({ success: true, data: { profilePhoto: user.profilePhoto } });
  } catch (error) {
    await fs.unlink(storedPath).catch(() => {});
    throw error;
  }
};

exports.remove = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  const previousPhoto = user.profilePhoto;
  user.profilePhoto = "";
  await user.save();
  await removeFile(previousPhoto);
  return res.json({ success: true, data: { profilePhoto: "" } });
};

exports.ownedPhotoPath = ownedPhotoPath;
