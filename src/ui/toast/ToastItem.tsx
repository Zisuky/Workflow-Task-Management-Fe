import { useEffect, useState } from 'react';
import type { Toast } from './toast.types';

interface ToastItemProps {
    toast: Toast;
    onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const exitTimer = setTimeout(() => {
            setIsExiting(true);
        }, toast.duration - 300);

        const removeTimer = setTimeout(() => {
            onClose(toast.id);
        }, toast.duration);

        return () => {
            clearTimeout(exitTimer);
            clearTimeout(removeTimer);
        };
    }, [toast.id, toast.duration, onClose]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => onClose(toast.id), 300);
    };

    const getTypeStyles = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-[#3ECDA3] text-white';
            case 'error':
                return 'bg-red-500 text-white';
            case 'warning':
                return 'bg-amber-500 text-white';
            case 'info':
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-700 text-white';
        }
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
            case 'info':
                return (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className={`
                flex items-center justify-between gap-4 min-w-[320px] max-w-md px-5 py-4
                rounded-2xl shadow-lg
                ${getTypeStyles()}
                transform transition-all duration-300 ease-out
                ${isExiting
                    ? 'translate-x-full opacity-0'
                    : 'translate-x-0 opacity-100 animate-slideIn'
                }
            `}
            role="alert"
        >
            <div className="flex items-center gap-3">
                {getIcon()}
                <p className="text-base font-medium">{toast.message}</p>
            </div>
            <button
                onClick={handleClose}
                className="flex-shrink-0 px-4 py-2 bg-white text-gray-800 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
            >
                Đóng
            </button>
        </div>
    );
};

export default ToastItem;
