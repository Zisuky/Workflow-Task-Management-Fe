import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const confirmStyle: React.CSSProperties =
    confirmVariant === 'danger'
      ? {
          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
          color: 'white',
          border: 'none',
        }
      : {
          background: 'linear-gradient(135deg, #F79E61, #e88d50)',
          color: 'white',
          border: 'none',
        };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(2px)',
          zIndex: 9998,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          padding: '28px 28px 24px',
          width: '320px',
          animation: 'fadeInScale 0.15s ease-out',
        }}
      >
        {/* Icon */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          {confirmVariant === 'danger' ? (
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              backgroundColor: '#FEF2F2', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          ) : (
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              backgroundColor: '#FFF7ED', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F79E61" strokeWidth="2">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          textAlign: 'center', fontWeight: 700, fontSize: '16px',
          color: '#111827', marginBottom: message ? '8px' : '20px',
        }}>
          {title}
        </h3>

        {/* Message */}
        {message && (
          <p style={{
            textAlign: 'center', fontSize: '13px', color: '#6B7280',
            marginBottom: '20px', lineHeight: '1.5',
          }}>
            {message}
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              border: '1px solid #E5E7EB', backgroundColor: 'white',
              fontSize: '14px', fontWeight: 600, color: '#6B7280',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'white')}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '10px', borderRadius: '10px',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              transition: 'opacity 0.15s',
              ...confirmStyle,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
};

export default ConfirmModal;
