import React from 'react';
import { Edit3, Clock, Phone, Zap, X } from 'lucide-react';

const QUICK_TEMPLATES = [
  'Called candidate. Will complete UPI payment today by 7 PM.',
  'Candidate requested discount on token amount.',
  'Shared payment link & QR code directly on WhatsApp.',
  'Candidate asked for callback tomorrow morning.',
  'Phone switched off / Not reachable.'
];

export default function FollowUpModal({
  reminder,
  onClose,
  onAddNote,
  followUpComment,
  onChangeComment,
  onSimulatePayment,
  formatOverdueTime
}) {
  if (!reminder) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={16} color="var(--guvi-green)" />
            <span>Log Follow-up: {reminder.lead_name}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Key Context Card */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 14px', borderRadius: '8px', fontSize: '13px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><strong>Course:</strong> {reminder.course_title}</div>
              <div><strong>Amount:</strong> ₹{reminder.amount}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={12} /> {reminder.lead_phone}
              </div>
              <div>
                <strong>Overdue:</strong>{' '}
                <span style={{ color: '#ef4444', fontWeight: 700 }}>
                  {formatOverdueTime(reminder.overdue_duration_seconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Audit Timeline */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              Interaction Timeline ({reminder.notes?.length || 0} touchpoints)
            </label>
            {(!reminder.notes || reminder.notes.length === 0) ? (
              <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '4px' }}>
                No prior interaction notes. Call the lead and log the outcome below.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto', marginTop: '6px' }}>
                {reminder.notes.map((note, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', borderLeft: '3px solid var(--guvi-green)', padding: '6px 10px', borderRadius: '4px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginBottom: '2px' }}>
                      <strong style={{ color: '#0f172a' }}>{note.author_name || 'BD Executive'}</strong>
                      <span>{new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ color: '#334155' }}>{note.comment}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Template Chips */}
          <div>
            <label className="form-label">Quick Response Templates:</label>
            <div className="quick-template-chips">
              {QUICK_TEMPLATES.map((tmpl, i) => (
                <button
                  key={i}
                  type="button"
                  className="template-chip"
                  onClick={() => onChangeComment(tmpl)}
                >
                  {tmpl}
                </button>
              ))}
            </div>
          </div>

          {/* Note Form */}
          <form onSubmit={onAddNote}>
            <div className="form-group">
              <label className="form-label">Add Note / Call Outcome</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Type follow-up details..."
                value={followUpComment}
                onChange={(e) => onChangeComment(e.target.value)}
                required
              />
            </div>
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="submit" className="btn btn-secondary btn-sm">
                Save Note
              </button>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onSimulatePayment(reminder.payment_link_id)}
          >
            <Zap size={12} />
            <span>Simulate Student Paid (Close)</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
