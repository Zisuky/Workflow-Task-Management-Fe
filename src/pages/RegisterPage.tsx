import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RegisterRequest } from '../shared/types';
import { userApi as authService } from '../features/user/infrastructure/user.api';
import RegisterView from '../features/user/presentation/RegisterView';
import { useToast } from '../ui/toast';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [data, setData] = useState<RegisterRequest>({
        account: '',
        email: '',
        fullName: '',
        phone: '',
        address: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await authService.register(data);
            toast.success('Đăng ký thành công! Vui lòng kiểm tra email để nhận mật khẩu.');
            navigate('/login');
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Đăng ký thất bại';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RegisterView
            data={data}
            isLoading={isLoading}
            error={error}
            onDataChange={setData}
            onSubmit={handleSubmit}
        />
    );
};

export default RegisterPage;
