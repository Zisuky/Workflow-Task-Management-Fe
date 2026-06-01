import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ForgotPasswordRequest, ResetPasswordRequest } from '../shared/types';
import { userApi as authService } from '../features/user/infrastructure/user.api';
import ForgotPasswordView from '../features/user/presentation/ForgotPasswordView';
import { useToast } from '../ui/toast';

const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [step, setStep] = useState<'request' | 'reset'>('request');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [requestData, setRequestData] = useState<ForgotPasswordRequest>({
        accountOrEmail: '',
    });

    const [resetData, setResetData] = useState<ResetPasswordRequest>({
        email: '',
        otpCode: '',
        newPassword: '',
    });

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await authService.forgotPassword(requestData.accountOrEmail);
            toast.success('Mã OTP đã được gửi về email của bạn.');
            
            const isEmail = requestData.accountOrEmail.includes('@');
            if (isEmail) {
                setResetData(prev => ({ ...prev, email: requestData.accountOrEmail }));
            }
            
            setStep('reset');
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Gửi yêu cầu thất bại';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await authService.resetPassword(resetData);
            toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            navigate('/login');
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || 'Đổi mật khẩu thất bại';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ForgotPasswordView
            step={step}
            requestData={requestData}
            resetData={resetData}
            isLoading={isLoading}
            error={error}
            onRequestChange={setRequestData}
            onResetChange={setResetData}
            onRequestSubmit={handleRequestSubmit}
            onResetSubmit={handleResetSubmit}
            onBackToRequest={() => setStep('request')}
        />
    );
};

export default ForgotPasswordPage;
