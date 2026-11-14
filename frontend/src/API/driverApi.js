const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const form = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: { ...(!form ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.success === false) throw new Error(body.message || `HTTP ${response.status}`);
  return body.data === undefined ? body : body.data;
}

const json = (method, data) => ({ method, body: JSON.stringify(data) });
const idOf = item => item?._id || item?.id;

export const normalizeVehicle = vehicle => ({ ...vehicle, id: idOf(vehicle) });
export const normalizeCapacity = post => ({
  ...post,
  id: idOf(post),
  truckId: post.vehicleId?._id || post.vehicleId,
  truckName: post.vehicleName || post.vehicleId?.name,
  truckNumber: post.vehicleNumber || post.vehicleId?.number,
  vehicleType: post.vehicleId?.type,
  totalCapacity: post.vehicleId?.capacity,
  contactName: post.contactName || post.driverId?.name || "",
  contactPhone: post.contactPhone || post.contactNumber || "",
  date: post.date ? String(post.date).slice(0, 10) : "",
  status: post.status === "available" ? "Available" : post.status,
});
const statusToApi = { Pending: "pending", Accepted: "accepted", Rejected: "rejected", "In Transit": "in_transit", Completed: "completed" };
const statusFromApi = { pending: "Pending", accepted: "Accepted", rejected: "Rejected", in_transit: "In Transit", completed: "Completed", cancelled: "Cancelled" };
export const normalizeRequest = item => ({
  ...item,
  id: idOf(item),
  from: item.pickupAddress || item.from || "",
  to: item.deliveryAddress || item.to || "",
  date: item.pickupDate ? String(item.pickupDate).slice(0, 10) : item.date || "",
  unit: item.weightUnit || item.unit || "",
  status: statusFromApi[item.status] || item.status,
  customerName: item.customerName || item.customerId?.name || "Customer",
  customerPhone: item.customerPhone || "",
});

export const driverApi = {
  getProfile: () => request("/driver/profile"),
  saveProfile: data => request("/driver/profile", json("PUT", data)),
  listVehicles: async () => (await request("/driver/vehicles")).map(normalizeVehicle),
  createVehicle: data => request("/driver/vehicles", json("POST", data)),
  updateVehicle: (id, data) => request(`/driver/vehicles/${id}`, json("PUT", data)),
  deleteVehicle: id => request(`/driver/vehicles/${id}`, { method: "DELETE" }),
  uploadVehicleFiles: (id, { photos = [], documents = [] }) => {
    const form = new FormData();
    photos.forEach(file => form.append("photos", file));
    documents.forEach(file => form.append("documents", file));
    return request(`/driver/vehicles/${id}/uploads`, { method: "POST", body: form });
  },
  removeVehicleFile: (id, fileId) => request(`/driver/vehicles/${id}/files/${fileId}`, { method: "DELETE" }),
  listRequests: async () => (await request("/driver/requests")).map(normalizeRequest),
  updateRequestStatus: (id, status) => request(`/driver/requests/${id}/status`, json("PATCH", { status: statusToApi[status] || status })),
  listCapacity: async () => (await request("/driver/capacity")).map(normalizeCapacity),
  listPublicCapacity: async () => (await request("/driver/available-capacity")).map(normalizeCapacity),
  createCapacity: data => request("/driver/capacity", json("POST", data)),
  updateCapacity: (id, data) => request(`/driver/capacity/${id}`, json("PUT", data)),
  deleteCapacity: id => request(`/driver/capacity/${id}`, { method: "DELETE" }),
};
