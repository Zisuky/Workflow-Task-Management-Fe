const API_BASE_URL = import.meta.env.PROD ? '/api/pmcc/v1' : (import.meta.env.VITE_API_BASE_URL || '/api/pmcc/v1');

export interface LoginRequest {
    account: string;
    password: string;
}

export interface LoginResponse {
    code: number;
    result: {
        token: string;
    };
}

export const loginApi = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        console.log('Calling API:', API_BASE_URL + '/auth/login');

        const response = await fetch(API_BASE_URL + '/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                account: credentials.account,
                password: credentials.password,
            }),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            let errorMessage = `Lỗi kết nối (${response.status})`;
            try {
                const errorData = await response.json();
                console.log('Error response data:', errorData);
                errorMessage = (errorData as any).message || (errorData as any).error || errorMessage;
            } catch (e) {
                // Could not parse JSON, use text if available
                const errorText = await response.text();
                console.log('Error response text:', errorText);
                if (errorText) errorMessage += `: ${errorText.substring(0, 100)}`;
            }
            throw new Error(errorMessage);
        }

        const data: LoginResponse = await response.json();
        console.log('Response data:', data);

        if (data.code === 0 && data.result?.token) {
            localStorage.setItem('authToken', data.result.token);
            return data;
        }

        const errorMessage = (data as any).message || (data as any).error || 'Sai tai khoan hoac mat khau';
        throw new Error(errorMessage);
    },

    logout(): void {
        localStorage.removeItem('authToken');
    },

    getToken(): string | null {
        return localStorage.getItem('authToken');
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('authToken');
    },
};
