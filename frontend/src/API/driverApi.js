const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
    const form = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const res = await fetch(`${API_BASE_URL}${path}`,
        {
            credentials: 'include', ...options,
            headers: { ...(!form ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) }
        });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.success === false)
        throw new Error(body.message || `HTTP ${res.status}`);
    return body.data === undefined ? body : body.data;
}

const json = (method, data) => ({
    method,
    body: JSON.stringify(data)
});

export const driverApi = {
    getProfile: () => request('/driver/profile'),

    saveProfile: d => request('/driver/profile',
        json('PUT', d)),

    listVehicles: () => request('/driver/vehicles'),

    createVehicle: d => request('/driver/vehicles',
        json('POST', d)),

    updateVehicle: (id, d) => request(`/driver/vehicles/${id}`,
        json('PUT', d)),

    deleteVehicle: id => request(`/driver/vehicles/${id}`,
        { method: 'DELETE' }),

    uploadVehicleFiles: (id, { photos = [], documents = [] }) => {

        const f = new FormData();
        photos.forEach(x => f.append('photos', x));
        documents.forEach(x => f.append('documents', x));

        return request(`/driver/vehicles/${id}/uploads`,
            { method: 'POST', body: f });
    },

    listRequests: () => request('/driver/requests'),

    updateRequestStatus: (id, status) => request(`/driver/requests/${id}/status`,
        json('PATCH', { status })),

    listCapacity: () => request('/driver/capacity'),

    createCapacity: d => request('/driver/capacity', json('POST', d)),

    updateCapacity: (id, d) => request(`/driver/capacity/${id}`, json('PUT', d)),

    deleteCapacity: id => request(`/driver/capacity/${id}`,
        { method: 'DELETE' })
};
