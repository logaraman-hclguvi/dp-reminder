import React from 'react';
import { CreditCard, X, Plus } from 'lucide-react';

export default function GenerateLinkModal({
  isOpen,
  onClose,
  onSubmit,
  formState,
  onChangeForm,
  leads,
  courses
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={16} color="var(--guvi-green)" />
            <span>Generate Payment Link</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Select Candidate / Lead</label>
              <select
                className="form-select"
                value={formState.lead_id}
                onChange={(e) => {
                  const selectedLead = leads.find((l) => l.id === e.target.value);
                  onChangeForm({
                    ...formState,
                    lead_id: e.target.value,
                    course_id: selectedLead?.course_id || formState.course_id
                  });
                }}
                required
              >
                <option value="" disabled>-- Select a Candidate --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.phone}) {l.status === 'CONVERTED' ? '— [✓ Already Enrolled]' : l.status === 'PAYMENT_LINK_SENT' ? '— [Active Link]' : '— [New]'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Course</label>
              <select
                className="form-select"
                value={formState.course_id}
                onChange={(e) => {
                  const crs = courses.find((c) => c.id === e.target.value);
                  onChangeForm({
                    ...formState,
                    course_id: e.target.value,
                    amount: crs ? crs.default_token_amount : formState.amount
                  });
                }}
                required
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} (Fee: ₹{c.total_fee})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Token / Down-Payment Amount (₹)</label>
              <input
                type="number"
                className="form-input"
                value={formState.amount}
                onChange={(e) => onChangeForm({ ...formState, amount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">SLA Overdue Threshold</label>
              <select
                className="form-select"
                value={formState.expiry_hours}
                onChange={(e) => onChangeForm({ ...formState, expiry_hours: e.target.value })}
              >
                <option value={24}>24 Hours (Standard Operational SLA)</option>
                <option value={4}>4 Hours (Fast follow-up)</option>
                <option value={0.016}>1 Minute (Fast Overdue Testing Demo)</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Plus size={13} />
              <span>Generate &amp; Assign Link</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
