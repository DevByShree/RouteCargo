const apiEnvironment = import.meta.env || {};
const configuredBase = apiEnvironment.VITE_API_BASE || apiEnvironment.VITE_API_URL || apiEnvironment.VITE_BASE_URL || "http://localhost:5000";
export const API_BASE = configuredBase.replace(/\/api\/?$/, "").replace(/\/$/, "");
let refreshInFlight;

function makeApiError(response, data) {
  const error = new Error(data.message || "Request failed");
  error.status = response.status;
  error.code = data.code;
  error.data = data;
  return error;
}

async function readResponse(response) {
  if (response.status === 204) return null;
  return response.json().catch(() => ({}));
}

async function refreshSession() {
  if (!refreshInFlight) {
    const performRefresh = async () => {
      const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const data = await readResponse(response);
      if (!response.ok) throw makeApiError(response, data);
      return data;
    };
    const coordinatedRefresh = () => {
      if (typeof navigator !== "undefined" && navigator.locks?.request) {
        return navigator.locks.request("routecargo-auth-refresh", { mode: "exclusive" }, performRefresh);
      }
      return performRefresh();
    };

    refreshInFlight = coordinatedRefresh().finally(() => {
      refreshInFlight = undefined;
    });
  }
  return refreshInFlight;
}

function isAuthEndpoint(endpoint) {
  return /^\/api\/auth\/(signin|signup|refresh|signout)(?:\/|$)/.test(endpoint);
}

async function send(endpoint, options) {
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = new Headers(options.headers || {});
  if (!isForm && options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });
}

export async function apiRequest(endpoint, options = {}, { skipRefresh = false } = {}) {
  let response = await send(endpoint, options);
  if (response.status === 401 && !skipRefresh && !isAuthEndpoint(endpoint)) {
    try {
      await refreshSession();
      response = await send(endpoint, options);
    } catch (error) {
      // Only an explicit refresh rejection proves the session is invalid. A
      // network error or server outage must not clear the user's auth state.
      if ([401, 403].includes(error.status) && typeof window !== "undefined") {
        window.dispatchEvent(new Event("routecargo:auth-expired"));
      }
      throw error;
    }
  }

  const data = await readResponse(response);
  if (!response.ok) throw makeApiError(response, data);
  return data;
}

export const authAPI = {
  signup: (data) => apiRequest("/api/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  signin: (data) => apiRequest("/api/auth/signin", { method: "POST", body: JSON.stringify(data) }, { skipRefresh: true }),
  // Use the same single-flight + cross-tab lock used for expired access tokens.
  refresh: () => refreshSession(),
  me: () => apiRequest("/api/auth/me"),
  signout: () => apiRequest("/api/auth/signout", { method: "POST" }, { skipRefresh: true }),
  updateMe: (data) => apiRequest("/api/auth/me", { method: "PUT", body: JSON.stringify(data) }),
  uploadProfilePhoto: (file) => {
    const form = new FormData();
    form.append("photo", file);
    return apiRequest("/api/auth/me/photo", { method: "POST", body: form });
  },
  removeProfilePhoto: () => apiRequest("/api/auth/me/photo", { method: "DELETE" }),
};

export const bookingAPI = {
  create: (data) => apiRequest("/api/booking", { method: "POST", body: JSON.stringify(data) }),
  mine: () => apiRequest("/api/booking/my-bookings"),
  get: (id) => apiRequest(`/api/booking/${encodeURIComponent(id)}`),
  tracking: (id) => apiRequest(`/api/booking/${encodeURIComponent(id)}/tracking`),
  cancel: (id) => apiRequest(`/api/booking/${encodeURIComponent(id)}`, { method: "DELETE" }),
};

export const notificationAPI = {
  list: () => apiRequest("/api/notifications"),
  markRead: (id) => apiRequest(`/api/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" }),
  markAllRead: () => apiRequest("/api/notifications/read-all", { method: "PATCH" }),
};

export const shipmentAPI = {
  create: (data) => apiRequest("/api/shipments", { method: "POST", body: JSON.stringify(data) }),
};
