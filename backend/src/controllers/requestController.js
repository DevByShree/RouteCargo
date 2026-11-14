import CargoRequest from "../models/CargoRequest.js";
const userId = req => String(req.user?._id || req.user?.id);

export async function listRequests(req, res, next) {
  try {
    // A driver sees requests assigned to them plus open pending requests.
    // Tighten this query if your business rules require manual dispatch only.
    const requests = await CargoRequest.find({
      $or: [{ driver: userId(req) }, { driver: null, status: "Pending" }]
    }).sort({ createdAt: -1 }).lean();
    res.json({ data: requests, total: requests.length });
  } catch (e) { next(e); }
}

const transitions = {
  Pending: ["Accepted", "Rejected"],
  Accepted: ["In Transit"],
  "In Transit": ["Completed"],
  Rejected: [],
  Completed: []
};

export async function updateRequestStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!Object.values(transitions).some(values => values.includes(status))) {
      return res.status(400).json({ message: "Invalid status." });
    }
    const request = await CargoRequest.findOne({
      _id: req.params.id,
      $or: [{ driver: userId(req) }, { driver: null, status: "Pending" }]
    });
    if (!request) return res.status(404).json({ message: "Cargo request not found or not available to this driver." });
    if (!transitions[request.status]?.includes(status)) {
      return res.status(409).json({ message: `Cannot change status from ${request.status} to ${status}.` });
    }
    if (request.status === "Pending" && status === "Accepted") request.driver = userId(req);
    request.status = status;
    request.decisionAt = new Date();
    await request.save();
    res.json({ message: `Request ${status.toLowerCase()}.`, data: request });
  } catch (e) { next(e); }
}
