import React from 'react';
import Toast from './Toast';

export default function ToastContainer({ toasts, onCloseToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="modern-toast-container">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          id={t.id}
          type={t.type}
          title={t.title}
          message={t.message}
          onClose={onCloseToast}
        />
      ))}
    </div>
  );
}
