import { useState } from 'react';
import type { LoginCredentials, User } from '../models';
import { authService } from '../services';
import { LoginView } from '../views';
interface LoginPageProps {
    onLoginSuccess?: (user: User) => void;
}
const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [credentials, setCredentials] = useState<LoginCredentials>({ email: '', password: '', rememberMe: false });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const user = await authService.login(credentials);
            onLoginSuccess?.(user);
        } catch (err: any) {
            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <LoginView
            credentials={credentials}
            showPassword={showPassword}
            isLoading={isLoading}
            error={error}
            onCredentialsChange={setCredentials}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onSubmit={handleSubmit}
        />
    );
};
export default LoginPage;
