import { apiRequest } from "./api";

async function request(path, options = {}) {
  const body = await apiRequest(`/api${path}`, options);
  if (body?.success === false) throw new Error(body.message || "Request failed");
  return body.data === undefined ? body : body.data;
}

const json = (method, data) => ({ method, body: JSON.stringify(data) });
const idOf = item => item?._id || item?.id;
const indiaDateKey = value => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const values = Object.fromEntries(parts.filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

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
  date: indiaDateKey(post.date),
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
  listPublicCapacity: async filters => {
    const params = new URLSearchParams(Object.entries(filters || {}).filter(([, value]) => value != null && value !== ""));
    const suffix = params.size ? `?${params}` : "";
    return (await request(`/driver/available-capacity${suffix}`)).map(post => ({
      ...post,
      id: idOf(post),
      vehicleName: post.vehicle?.name || post.vehicleName || "Truck",
      vehicleType: post.vehicle?.type || post.vehicleType || "",
      vehicleCapacity: post.vehicle?.capacity,
      photos: post.photos || post.vehicle?.photos || [],
      driverName: post.driver?.name || post.companyName || "Driver",
      date: indiaDateKey(post.date),
    }));
  },
  createCapacity: data => request("/driver/capacity", json("POST", data)),
  updateCapacity: (id, data) => request(`/driver/capacity/${id}`, json("PUT", data)),
  deleteCapacity: id => request(`/driver/capacity/${id}`, { method: "DELETE" }),
  listBookings: async () => (await request("/booking/driver")).map(item => ({ ...item, id: idOf(item), status: item.status })),
  acceptBooking: id => request(`/booking/${id}/accept`, json("PUT", {})),
  rejectBooking: id => request(`/booking/${id}/reject`, json("PUT", {})),
  updateBookingStatus: (id, status) => request(`/booking/${id}/status`, json("PUT", { status })),
  updateTrackingLocation: (id, position) => request(`/booking/${encodeURIComponent(id)}/tracking`, json("POST", position)),
};
