import { useContext, useMemo } from 'react';
import { ToastContext } from './ToastContext';
import type { ToastAPI } from './toast.types';

export const useToast = (): ToastAPI => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    const toast = useMemo<ToastAPI>(() => ({
        success: (message: string, duration?: number) => {
            context.addToast(message, 'success', duration);
        },
        error: (message: string, duration?: number) => {
            context.addToast(message, 'error', duration);
        },
        warning: (message: string, duration?: number) => {
            context.addToast(message, 'warning', duration);
        },
        info: (message: string, duration?: number) => {
            context.addToast(message, 'info', duration);
        },
    }), [context]);

    return toast;
};
