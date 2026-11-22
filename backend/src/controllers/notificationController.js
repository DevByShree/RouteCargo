const mongoose = require("mongoose");
const Notification = require("../models/Notification");

exports.list = async (req, res) => {
  const items = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50).lean();
  return res.json({ success: true, data: items, unreadCount: items.filter(item => !item.readAt).length });
};

exports.markRead = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid notification ID" });
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $set: { readAt: new Date() } },
    { new: true }
  );
  if (!item) return res.status(404).json({ success: false, message: "Notification not found" });
  return res.json({ success: true, data: item });
};

exports.markAllRead = async (req, res) => {
  const result = await Notification.updateMany({ userId: req.user.id, readAt: null }, { $set: { readAt: new Date() } });
  return res.json({ success: true, modifiedCount: result.modifiedCount });
};
