import type { LoginCredentials } from '../../shared/types';
import { Link } from 'react-router-dom';

interface LoginViewProps {
    credentials: LoginCredentials;
    showPassword: boolean;
    isLoading: boolean;
    error: string | null;
    onCredentialsChange: (credentials: LoginCredentials) => void;
    onTogglePassword: () => void;
    onSubmit: (e: React.FormEvent) => void;
}
const LoginView: React.FC<LoginViewProps> = ({
    credentials,
    showPassword,
    isLoading,
    error,
    onCredentialsChange,
    // onTogglePassword,
    onSubmit,
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-fadeIn">
                <div className="text-center mb-8 animate-slideDown">
                    <img
                        src="/DOffice/Logo_DOffice_5_Symbol.png"
                        alt="DOffice Logo"
                        className="w-48 h-48 mx-auto mb-4 transition-transform duration-300 hover:scale-105"
                    />
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Quản Lý Công Việc</h1>
                    <p className="text-gray-500 mt-2">Đăng nhập để tiếp tục</p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-gray-200/50 p-8 animate-slideUp border border-white/50">
                    <form onSubmit={onSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-scaleIn border border-red-100">
                                <span>⚠️</span> {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Tài Khoản hoặc Email</label>
                            <input
                                type="text"
                                value={credentials.email}
                                onChange={(e) => onCredentialsChange({ ...credentials, email: e.target.value })}
                                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all duration-200 hover:border-gray-300 placeholder:text-gray-400"
                                placeholder="Đăng nhập"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={credentials.password}
                                    onChange={(e) => onCredentialsChange({ ...credentials, password: e.target.value })}
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F79E61]/50 focus:border-[#F79E61] transition-all duration-200 hover:border-gray-300 placeholder:text-gray-400 pr-12"
                                    placeholder="*********"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <input type="checkbox" checked={credentials.rememberMe} onChange={(e) => onCredentialsChange({ ...credentials, rememberMe: e.target.checked })} className="w-4 h-4 text-[#F79E61] rounded border-gray-300 focus:ring-[#F79E61] transition-colors" />
                                <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Ghi nhớ đăng nhập</span>
                            </label>
                            <Link to="/forgot-password" id="forgot-password-link" className="text-sm text-[#F79E61] hover:text-[#e88d50] hover:underline transition-colors font-medium">Quên mật khẩu?</Link>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#F79E61] to-[#f0884a] hover:from-[#e88d50] hover:to-[#e07d3a] text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2">
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Đang đăng nhập...
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </form>
                    <p className="mt-8 text-center text-sm text-gray-500">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" id="register-link" className="text-[#F79E61] font-semibold hover:text-[#e88d50] hover:underline transition-colors">Đăng ký ngay</Link>
                    </p>
                </div>
                <p className="text-center text-xs text-gray-400 mt-6">© 2026 Confluent by Loi Nguyen.</p>
            </div>
        </div>
    );
};
export default LoginView;
