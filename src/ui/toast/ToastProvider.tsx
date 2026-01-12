import { useState, useCallback, type ReactNode } from 'react';
import { ToastContext } from './ToastContext';
import ToastContainer from './ToastContainer';
import type { Toast, ToastType } from './toast.types';

interface ToastProviderProps {
    children: ReactNode;
}

const DEFAULT_DURATION = 5000;

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType, duration: number = DEFAULT_DURATION) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast: Toast = {
            id,
            message,
            type,
            duration,
        };

        setToasts((prev) => [...prev, newToast]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
};

export default ToastProvider;
