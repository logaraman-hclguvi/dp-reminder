import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast({ id, type = 'success', title, message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="#00A86B" />;
      case 'danger':
      case 'error':
        return <AlertCircle size={18} color="#e11d48" />;
      case 'warning':
        return <AlertTriangle size={18} color="#d97706" />;
      default:
        return <Info size={18} color="#0284c7" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#00A86B';
      case 'danger':
      case 'error':
        return '#e11d48';
      case 'warning':
        return '#d97706';
      default:
        return '#0284c7';
    }
  };

  return (
    <div
      className="modern-toast-item"
      style={{ borderLeft: `4px solid ${getBorderColor()}` }}
    >
      <div className="toast-icon-box">{getIcon()}</div>
      <div className="toast-body">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
      </div>
      <button
        className="toast-close-btn"
        onClick={() => onClose(id)}
        title="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
