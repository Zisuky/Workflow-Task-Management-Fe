import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.PROD ? '/api/pmcc/v1' : (import.meta.env.VITE_API_URL || '/api/pmcc/v1'),
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: false,
    timeout: 10000,
});

console.log('API Base URL configured:', import.meta.env.VITE_API_URL);


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error);

        if (error.code === 'ERR_NETWORK') {
            throw new Error('Network error: Unable to connect to server. Please check your connection or try again later.');
        }

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default api;
