import api from './api';

// Fetches a user's daily history records from the backend
export async function getHistory(from, to) {
    const { data } = await api.get('/history', { params: { from, to } });
    return Array.isArray(data?.items) ? data.items : [];
}
