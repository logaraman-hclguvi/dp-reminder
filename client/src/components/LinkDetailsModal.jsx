import React from 'react';
import {
  X,
  CreditCard,
  Copy,
  MessageSquare,
  Mail,
  Zap,
  Clock,
  Phone,
  BookOpen,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function LinkDetailsModal({
  isOpen,
  onClose,
  link,
  onCopyUrl,
  onOpenEmailModal,
  onOpenFollowUp,
  onSimulatePayment,
  onCancelLink,
  onChangeStatus
}) {
  if (!isOpen || !link) return null;

  const url = link.payment_url || `https://pay.edtech.com/${link.id}`;

  const handleShareWhatsApp = () => {
    const candidateName = link.lead_name || 'Candidate';
    const course = link.course_title || 'selected course';
    const message = `Hi ${candidateName}, your down-payment booking link for ${course} (₹${link.amount}) is currently active: ${url}. Please complete the payment to secure your batch seat. Let me know if you need any assistance!`;
    navigator.clipboard.writeText(message);
    if (onCopyUrl) {
      onCopyUrl(`WhatsApp message template copied for ${candidateName}!`);
    }
  };

  const handleCopyDirectLink = () => {
    navigator.clipboard.writeText(url);
    if (onCopyUrl) {
      onCopyUrl(`Payment link copied to clipboard: ${url}`);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '560px' }}>
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
              <CreditCard size={16} color="var(--guvi-green)" />
            </div>
            <div>
              <h3 className="modal-title">Payment Link Details</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                ID: <code>{link.id}</code>
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-form" style={{ gap: '14px' }}>
          {/* Candidate & Course Overview Card */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                  {link.lead_name || 'Candidate Lead'}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  <Phone size={12} /> {link.lead_phone || '-'}
                </div>
              </div>
              <span
                className={`chip ${
                  link.status === 'OVERDUE'
                    ? 'critical'
                    : link.status === 'PAID'
                    ? 'success'
                    : link.status === 'PENDING'
                    ? 'warning'
                    : 'neutral'
                }`}
                style={{ fontWeight: 700, padding: '4px 10px' }}
              >
                {link.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Course / Program:</div>
                <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                  {link.course_title || link.course_id || '-'}
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>Down Payment Due:</div>
                <div style={{ fontWeight: 800, color: 'var(--guvi-green)', fontSize: '14px', marginTop: '2px' }}>
                  ₹{(link.amount || 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11.5px', marginTop: '8px', color: '#64748b' }}>
              <div>Created: {new Date(link.created_at).toLocaleString()}</div>
              <div>SLA Due: {new Date(link.due_at).toLocaleString()}</div>
            </div>
          </div>

          {/* Payment URL Row */}
          <div>
            <label className="form-label" style={{ marginBottom: '4px' }}>
              Candidate Payment URL
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                className="form-input"
                value={url}
                readOnly
                style={{ background: '#ffffff', fontFamily: 'monospace', fontSize: '12px' }}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleCopyDirectLink}
                title="Copy URL"
              >
                <Copy size={13} />
                <span>Copy</span>
              </button>
            </div>
          </div>

          {/* Quick Action Matrix */}
          <div>
            <label className="form-label" style={{ marginBottom: '6px' }}>
              Follow-up &amp; Engagement Actions
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'center', borderColor: '#bbf7d0', color: 'var(--guvi-green)' }}
                onClick={() => {
                  onClose();
                  onOpenEmailModal(link);
                }}
              >
                <Mail size={13} />
                <span>Send Email Reminder</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'center' }}
                onClick={handleShareWhatsApp}
              >
                <MessageSquare size={13} color="var(--guvi-green)" />
                <span>WhatsApp Template</span>
              </button>
            </div>
          </div>

          {/* Conversion and State Transition */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Change Status:</span>
              <select
                value={link.status}
                onChange={(e) => onChangeStatus(link.id, e.target.value)}
                className="form-select"
                style={{ width: '130px', padding: '4px 8px', fontSize: '11.5px' }}
              >
                <option value="PENDING">PENDING</option>
                <option value="OVERDUE">OVERDUE</option>
                <option value="PAID">PAID</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {link.status !== 'PAID' && (
                <button
                  type="button"
                  className="btn btn-primary-soft btn-sm"
                  style={{ background: 'var(--guvi-green)', color: '#ffffff' }}
                  onClick={() => {
                    onSimulatePayment(link.id);
                    onClose();
                  }}
                >
                  <Zap size={13} />
                  <span>Mark as Converted</span>
                </button>
              )}
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
