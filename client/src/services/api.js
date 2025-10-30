import axios from 'axios';

let accessToken = localStorage.getItem('accessToken');
let isRefreshing = false;
let waiters = [];

const api = axios.create({
    baseURL: 'http://localhost:4000/api',
    withCredentials: true, // sends refresh cookie
});

// attach token
api.interceptors.request.use(cfg => {
    if (accessToken) cfg.headers.Authorization = `Bearer ${accessToken}`;
    return cfg;
});

// refresh-on-401
api.interceptors.response.use(
    res => res,
    async (error) => {
        const original = error.config;
        if (!error.response || error.response.status !== 401 || original._retry) throw error;
        original._retry = true;

        if (isRefreshing) {
            const newTok = await new Promise(resolve => waiters.push(resolve));
            if (!newTok) throw error;
            original.headers.Authorization = `Bearer ${newTok}`;
            return api(original);
        }

        try {
            isRefreshing = true;
            const { data } = await api.post('/auth/refresh'); // cookie auto-sent
            accessToken = data.accessToken;
            localStorage.setItem('accessToken', accessToken);
            waiters.forEach(w => w(accessToken)); waiters = [];
            isRefreshing = false;

            original.headers.Authorization = `Bearer ${accessToken}`;
            return api(original);
        } catch (error) {
            isRefreshing = false;
            waiters.forEach(w => w(null)); waiters = [];
            accessToken = null;
            localStorage.removeItem('accessToken');
            throw error; // let UI redirect to login
        }
    }
);

export function setAccessToken(tok) {
    accessToken = tok;
    if (tok) localStorage.setItem('accessToken', tok);
    else localStorage.removeItem('accessToken');
}

export default api;
