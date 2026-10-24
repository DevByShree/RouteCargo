const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export const setToken = (token) => {
    try {
        localStorage.setItem("token", token);
    } catch {
        // localStorage unavailable in some environments
    }
};

export const getToken = () => {
    try {
        return localStorage.getItem("token");
    } catch {
        return null;
    }
};

export const removeToken = () => {
    try {
        localStorage.removeItem("token");
    } catch {
        // ignore
    }
};

export const setUserRole = (role) => {
    try {
        localStorage.setItem("role", role);
    } catch {
        // ignore
    }
};

export const getUserRole = () => {
    try {
        return localStorage.getItem("role");
    } catch {
        return null;
    }
};

const request = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        credentials: "include", // send httpOnly cookie
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || "Request failed");
        error.status = response.status;
        error.data = errorData;
        throw error;
    }

    // 204 No Content has no body
    if (response.status === 204) return null;
    return await response.json();
};

export const authAPI = {
    signup: (data) => request("/api/auth/signup", { method: "POST", body: JSON.stringify(data) }),
    signin: (data) => request("/api/auth/signin", { method: "POST", body: JSON.stringify(data) }),
    me: () => request("/api/auth/me", { method: "GET" }),
    signout: () => request("/api/auth/signout", { method: "POST" }),
};
