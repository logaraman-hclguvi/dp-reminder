import React, { useState, useEffect } from 'react';
import { Mail, X, Send, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function SendEmailModal({
  isOpen,
  onClose,
  link,
  defaultEmail = '',
  onSendEmail,
  isSending = false
}) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [reminderType, setReminderType] = useState('PROACTIVE');
  const [customSubject, setCustomSubject] = useState('');

  useEffect(() => {
    if (link) {
      setRecipientEmail(defaultEmail || link.lead_email || '');
      const isOverdue = link.status === 'OVERDUE';
      setReminderType(isOverdue ? 'OVERDUE' : 'PROACTIVE');
      setCustomSubject(
        isOverdue
          ? `⚠️ Urgent: Complete Down Payment for ${link.course_title || 'Course'} to Secure Seat`
          : `🎓 Complete Your Down-Payment Booking for ${link.course_title || 'Course'}`
      );
    }
  }, [link, defaultEmail]);

  if (!isOpen || !link) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
      return;
    }
    onSendEmail(link.id || link.payment_link_id, recipientEmail.trim(), reminderType);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--guvi-green-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Mail size={16} color="var(--guvi-green)" />
            </div>
            <div>
              <h3 className="modal-title">Send Email Payment Reminder</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Powered by GUVI Gmail SMTP Delivery
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Candidate / Recipient Name</label>
            <input
              type="text"
              className="form-input"
              value={link.lead_name || 'Candidate'}
              disabled
              style={{ background: '#f8fafc', color: '#475569' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Recipient Email Address <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="email"
              className="form-input"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g. candidate@gmail.com"
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Reminder Mode</label>
              <select
                className="form-select"
                value={reminderType}
                onChange={(e) => {
                  setReminderType(e.target.value);
                  const isOverdue = e.target.value === 'OVERDUE';
                  setCustomSubject(
                    isOverdue
                      ? `⚠️ Urgent: Complete Down Payment for ${link.course_title || 'Course'} to Secure Seat`
                      : `🎓 Complete Your Down-Payment Booking for ${link.course_title || 'Course'}`
                  );
                }}
              >
                <option value="PROACTIVE">Proactive Pre-24h (Gentle Nudge)</option>
                <option value="OVERDUE">Critical Overdue (&gt;24h Notice)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Token Amount Due</label>
              <input
                type="text"
                className="form-input"
                value={`₹${(link.amount || 0).toLocaleString()}`}
                disabled
                style={{ background: '#f8fafc', fontWeight: 700, color: 'var(--guvi-green)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Subject Preview</label>
            <input
              type="text"
              className="form-input"
              value={customSubject}
              onChange={(e) => setCustomSubject(e.target.value)}
              style={{ fontSize: '12px' }}
            />
          </div>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '11.5px',
              color: '#475569'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>
              <ShieldCheck size={14} color="var(--guvi-green)" />
              HTML Template Features
            </div>
            Includes responsive GUVI brand banner, candidate token summary, 24h SLA urgency badge, and direct payment CTA button.
          </div>

          <div className="modal-actions" style={{ marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSending}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary-soft"
              style={{ background: 'var(--guvi-green)', color: '#ffffff' }}
              disabled={isSending || !recipientEmail}
            >
              <Send size={13} />
              <span>{isSending ? 'Dispatching...' : 'Dispatch Email Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
