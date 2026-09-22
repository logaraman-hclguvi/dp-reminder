import React from 'react';
import { UserPlus, X, Plus } from 'lucide-react';

export default function AddLeadModal({
  isOpen,
  onClose,
  onSubmit,
  formState,
  onChangeForm,
  courses
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-dialog">
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={16} color="var(--guvi-green)" />
            <span>Register New Candidate Lead</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Karthik Nair"
                value={formState.name}
                onChange={(e) => onChangeForm({ ...formState, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. +91 98765 43210"
                value={formState.phone}
                onChange={(e) => onChangeForm({ ...formState, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Optional)</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. candidate@gmail.com"
                value={formState.email}
                onChange={(e) => onChangeForm({ ...formState, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Interested Course</label>
              <select
                className="form-select"
                value={formState.course_id}
                onChange={(e) => onChangeForm({ ...formState, course_id: e.target.value })}
                required
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} (Fee: ₹{c.total_fee})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Plus size={13} />
              <span>Save Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
