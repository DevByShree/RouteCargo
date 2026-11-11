export default function requireDriver(req, res, next) {
  // Adapt role names to your current auth system if needed.
  const role = String(req.user?.role || "").toLowerCase();
  if (role && !["driver", "transporter", "admin"].includes(role)) {
    return res.status(403).json({ message: "This endpoint is available to driver accounts only." });
  }
  next();
}
