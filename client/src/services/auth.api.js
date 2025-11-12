import api, { setAccessToken } from './api';
import useDiaryStore from '../store/diaryStore';

// Register a new user and store the received access token
export async function registerApi({ email, password }) {
    const { data } = await api.post('/auth/register', { email, password });
    setAccessToken(data.accessToken);

    // Reset Diary day memory on fresh account creation
    localStorage.removeItem('ct:lastDiaryDate');
    localStorage.removeItem('ct:historyRange');
    useDiaryStore.getState().setDate(new Date());
    
    return data.user;
}
// Log in an existing user and save the new access token
export async function loginApi({ email, password }) {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);

    // Reset Diary day memory on login
    localStorage.removeItem('ct:lastDiaryDate');
    localStorage.removeItem('ct:historyRange');
    useDiaryStore.getState().setDate(new Date());
    
    return data.user;
}
// Log out the user and clear tokens from client + server 
export async function logoutApi() {
    try {
        await api.post('/auth/logout'); // clears refresh cookie server-side
    } finally {
        setAccessToken(null); // remove local access token

        // Also clear last viewed day so next login starts at "today"
        localStorage.removeItem('ct:lastDiaryDate');
        localStorage.removeItem('ct:historyRange');
        useDiaryStore.getState().setDate(new Date());
    }
}
