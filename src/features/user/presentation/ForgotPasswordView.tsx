import React from 'react';
import { Link } from 'react-router-dom';
import type { ForgotPasswordRequest, ResetPasswordRequest } from '../../../shared/types';

interface ForgotPasswordViewProps {
    step: 'request' | 'reset';
    requestData: ForgotPasswordRequest;
    resetData: ResetPasswordRequest;
    isLoading: boolean;
    error: string | null;
    onRequestChange: (data: ForgotPasswordRequest) => void;
    onResetChange: (data: ResetPasswordRequest) => void;
    onRequestSubmit: (e: React.FormEvent) => void;
    onResetSubmit: (e: React.FormEvent) => void;
    onBackToRequest: () => void;
}

const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
    step,
    requestData,
    resetData,
    isLoading,
    error,
    onRequestChange,
    onResetChange,
    onRequestSubmit,
    onResetSubmit,
    onBackToRequest,
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fadeIn">
                <div className="text-center mb-8 animate-slideDown">
                    <img
                        src="/DOffice/Logo_DOffice_5_Symbol.png"
                        alt="DOffice Logo"
                        className="w-40 h-40 mx-auto mb-4 transition-transform duration-300 hover:scale-105"
                    />
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                        {step === 'request' ? 'Quên mật khẩu?' : 'Đặt lại mật khẩu'}
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        {step === 'request' 
                            ? 'Nhập tài khoản hoặc email để nhận mã OTP' 
                            : 'Nhập mã OTP đã được gửi về email của bạn'}
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-gray-200/50 p-8 animate-slideUp border border-white/50">
                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-scaleIn border border-red-100">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {step === 'request' ? (
                        <form onSubmit={onRequestSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Tài khoản hoặc Email</label>
                                <input
                                    type="text"
                                    value={requestData.accountOrEmail}
                                    onChange={(e) => onRequestChange({ accountOrEmail: e.target.value })}
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all duration-200 hover:border-gray-300 placeholder:text-gray-400"
                                    placeholder="Nhập account hoặc email"
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full bg-gradient-to-r from-[#F79E61] to-[#f0884a] hover:from-[#e88d50] hover:to-[#e07d3a] text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Đang gửi yêu cầu...
                                    </>
                                ) : (
                                    'Gửi mã xác thực'
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={onResetSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Email của bạn</label>
                                <input
                                    type="email"
                                    value={resetData.email}
                                    onChange={(e) => onResetChange({ ...resetData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all duration-200 hover:border-gray-300 placeholder:text-gray-400"
                                    placeholder="Xác nhận email của bạn"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Mã xác thực (OTP)</label>
                                <input
                                    type="text"
                                    value={resetData.otpCode}
                                    onChange={(e) => onResetChange({ ...resetData, otpCode: e.target.value })}
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all duration-200 hover:border-gray-300 placeholder:text-gray-400 text-center tracking-widest font-bold text-lg"
                                    placeholder="••••••"
                                    required
                                    maxLength={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={resetData.newPassword}
                                    onChange={(e) => onResetChange({ ...resetData, newPassword: e.target.value })}
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all duration-200 hover:border-gray-300 placeholder:text-gray-400"
                                    placeholder="*********"
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full bg-gradient-to-r from-[#F79E61] to-[#f0884a] hover:from-[#e88d50] hover:to-[#e07d3a] text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Đang đổi mật khẩu...
                                    </>
                                ) : (
                                    'Đổi mật khẩu'
                                )}
                            </button>

                            <button 
                                type="button" 
                                onClick={onBackToRequest}
                                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
                            >
                                Quay lại bước trước
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <Link 
                            to="/login" 
                            className="flex items-center justify-center gap-2 text-sm text-[#F79E61] font-semibold hover:text-[#e88d50] transition-colors"
                        >
                            <span>←</span> Quay lại Đăng nhập
                        </Link>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-6">© 2026 Confluent by Loi Nguyen.</p>
            </div>
        </div>
    );
};

export default ForgotPasswordView;
