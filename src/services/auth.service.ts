import type { LoginCredentials, User } from '../models';
import api from './api';
let currentUser: User | null = null;
export const authService = {
    async login(credentials: LoginCredentials): Promise<User> {
        try {
            const response: any = await api.post('/auth/login', {
                account: credentials.email,
                password: credentials.password
            });

            if (response.code === 0 && response.result?.token) {
                const token = response.result.token;
                localStorage.setItem('token', token);

                currentUser = {
                    id: 'user-id-placeholder', 
                    email: credentials.email,
                    name: credentials.email.split('@')[0],
                    role: 'User',
                };
                localStorage.setItem('user', JSON.stringify(currentUser));
                return currentUser;
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            
            if (error.message?.includes('Network error')) {
                throw new Error('Unable to connect to server. Please check your internet connection.');
            }
            
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Network connection failed. The server may be unavailable or there may be a CORS issue.');
            }
            
            if (error.response?.data) {
                throw new Error(error.response.data.message || 'Login failed');
            }
            
            throw new Error(error.message || 'Login failed');
        }
    },
    async logout(): Promise<void> {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        currentUser = null;
    },
    getCurrentUser(): User | null {
        if (!currentUser) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                currentUser = JSON.parse(userStr);
            }
        }
        return currentUser;
    },
    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    },
};
