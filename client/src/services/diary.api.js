import api from './api';

// Fetch diary data for a specific date (YYYY-MM-DD)
export async function getDay(dateYMD) {
    const { data } = await api.get('/diary', { params: { date: dateYMD } });
    // { meals: {Breakfast, lunch, etc and mealTotals, dayTotals }
    return data; 
}
// Add a new food entry to the diary
export async function addItem(payload) {
    const { data } = await api.post('/diary', payload);
    return data;
}
// Update an existing diary entry by ID
export async function updateItem(id, payload) {
    const { data } = await api.put(`/diary/${id}`, payload);
    return data;
}
// Delete a diary entry by ID
export async function deleteItem(id) {
    const { data } = await api.delete(`/diary/${id}`);
    return data;
}
