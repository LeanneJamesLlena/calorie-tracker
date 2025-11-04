import api from './api';

// Fetch user's current nutrition targets from the backend
export async function getTargets() {
    const { data } = await api.get('/profile/targets');
    // { calories, protein, carbs, fat, fiber }
    return data; 
}

// Update the user's nutrition targets
export async function updateTargets(payload) {
    const { data } = await api.put('/profile/targets', payload);
    return data;
}
