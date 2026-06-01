import React from 'react';
import { Link } from 'react-router-dom';
import type { RegisterRequest } from '../../../shared/types';

interface RegisterViewProps {
    data: RegisterRequest;
    isLoading: boolean;
    error: string | null;
    onDataChange: (data: RegisterRequest) => void;
    onSubmit: (e: React.FormEvent) => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({
    data,
    isLoading,
    error,
    onDataChange,
    onSubmit,
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
            <div className="w-full max-w-lg animate-fadeIn">
                <div className="text-center mb-6 animate-slideDown">
                    <img
                        src="/logo.png"
                        alt="Confluent Logo"
                        className="w-32 h-32 mx-auto mb-2 transition-transform duration-300 hover:scale-105"
                    />
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Tạo tài khoản mới</h1>
                    <p className="text-gray-500 mt-1 text-sm">Điền thông tin bên dưới để bắt đầu</p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-gray-200/50 p-8 animate-slideUp border border-white/50">
                    <form onSubmit={onSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-scaleIn border border-red-100">
                                <span>⚠️</span> {error}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Tài khoản <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={data.account}
                                    onChange={(e) => onDataChange({ ...data, account: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all duration-200 hover:border-gray-300 placeholder:text-gray-400"
                                    placeholder="Tên đăng nhập"
                                    required
                                />
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => onDataChange({ ...data, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all duration-200 hover:border-gray-300 placeholder:text-gray-400"
                                    placeholder="example@mail.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.fullName}
                                onChange={(e) => onDataChange({ ...data, fullName: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all duration-200 hover:border-gray-300 placeholder:text-gray-400"
                                placeholder="Nguyễn Văn A"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                            <input
                                type="tel"
                                value={data.phone || ''}
                                onChange={(e) => onDataChange({ ...data, phone: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all duration-200 hover:border-gray-300 placeholder:text-gray-400"
                                placeholder="09xx xxx xxx"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
                            <input
                                type="text"
                                value={data.address || ''}
                                onChange={(e) => onDataChange({ ...data, address: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all duration-200 hover:border-gray-300 placeholder:text-gray-400"
                                placeholder="TP. Hồ Chí Minh"
                            />
                        </div>

                        <div className="pt-2">
                            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 mb-6">
                                <p className="text-xs text-orange-700 leading-relaxed">
                                    <span className="font-bold">Lưu ý:</span> Sau khi đăng ký thành công, mật khẩu khởi tạo sẽ được gửi về địa chỉ Email bạn đã cung cấp. Vui lòng kiểm tra hòm thư (bao gồm cả thư rác) để nhận thông tin đăng nhập.
                                </p>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="w-full bg-gradient-to-r from-[#F79E61] to-[#f0884a] hover:from-[#e88d50] hover:to-[#e07d3a] text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Đang tạo tài khoản...
                                    </>
                                ) : (
                                    'Đăng ký tài khoản'
                                )}
                            </button>
                        </div>
                    </form>
                    
                    <p className="mt-6 text-center text-sm text-gray-500">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-[#F79E61] font-semibold hover:text-[#e88d50] hover:underline transition-colors">Đăng nhập ngay</Link>
                    </p>
                </div>
                <p className="text-center text-xs text-gray-400 mt-6">© 2026 Confluent by Loi Nguyen.</p>
            </div>
        </div>
    );
};

export default RegisterView;
