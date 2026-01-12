import { useContext } from 'react';
import { ToastContext } from './ToastContext';
import ToastItem from './ToastItem';

const ToastContainer: React.FC = () => {
    const context = useContext(ToastContext);

    if (!context) return null;

    const { toasts, removeToast } = context;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
            ))}
        </div>
    );
};

export default ToastContainer;
