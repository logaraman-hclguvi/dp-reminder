import React from 'react';
import { AlertTriangle, Clock, Edit3, Zap, Phone, CheckCircle, Mail } from 'lucide-react';

export default function OverdueQueue({
  reminders,
  bdName,
  onOpenFollowUp,
  onSimulatePayment,
  onCancelLink,
  onSendEmailReminder,
  formatOverdueTime
}) {
  return (
    <div>
      <div className="page-title-banner">
        <div>
          <h1 className="page-heading">Overdue SLA Follow-up Queue</h1>
          <p className="page-subheading">
            Candidate payment links assigned to <strong>{bdName || 'BD'}</strong> that have breached the 24-hour SLA window.
          </p>
        </div>
      </div>

      <div className="modern-table-container">
        <div className="modern-table-toolbar">
          <div className="toolbar-title-group">
            <AlertTriangle size={15} color="#e11d48" />
            <span className="toolbar-heading">Overdue Backlog Priority List</span>
            {reminders.length > 0 && (
              <span className="chip critical">{reminders.length} Urgent</span>
            )}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Sorted by longest overdue duration
          </span>
        </div>

        {reminders.length === 0 ? (
          <div className="empty-box">
            <CheckCircle size={32} color="var(--guvi-green)" style={{ marginBottom: '8px' }} />
            <h4 style={{ color: '#0f172a', fontWeight: 700 }}>Zero Overdue Reminders</h4>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>All payment links assigned to you are either paid or within their 24-hour SLA window.</p>
          </div>
        ) : (
          <div className="modern-table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Candidate / Lead</th>
                  <th>Target Course</th>
                  <th>Token Amount</th>
                  <th>SLA Aging</th>
                  <th>Follow-up History</th>
                  <th style={{ textAlign: 'right' }}>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((rem) => (
                  <tr key={rem.id}>
                    <td>
                      <div className="user-identity-cell">
                        <div className="user-avatar-pill">
                          {rem.lead_name?.slice(0, 2).toUpperCase() || 'LD'}
                        </div>
                        <div>
                          <div className="user-name-title">{rem.lead_name}</div>
                          <div className="user-contact-sub">
                            <Phone size={10} /> {rem.lead_phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="course-badge-text">{rem.course_title}</div>
                    </td>
                    <td>
                      <div className="currency-amount">
                        ₹{rem.amount?.toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span className="chip critical">
                        <Clock size={11} />
                        {formatOverdueTime(rem.overdue_duration_seconds)}
                      </span>
                    </td>
                    <td>
                      <span className="chip neutral">
                        {rem.follow_up_count} Touchpoint{rem.follow_up_count === 1 ? '' : 's'}
                      </span>
                    </td>
                    <td>
                      <div className="table-action-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Send Urgent Reminder Email via Gmail SMTP"
                          onClick={() => onSendEmailReminder(rem)}
                        >
                          <Mail size={11} color="var(--danger)" />
                          <span>Email</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onOpenFollowUp(rem)}
                        >
                          <Edit3 size={11} />
                          <span>Log Note</span>
                        </button>
                        <button
                          className="btn btn-primary-soft btn-sm"
                          onClick={() => onSimulatePayment(rem.payment_link_id)}
                        >
                          <Zap size={11} />
                          <span>Mark Paid</span>
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#e11d48', borderColor: '#fecdd3' }}
                          onClick={() => onCancelLink(rem.payment_link_id)}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer-bar">
          <span>Total {reminders.length} active overdue reminder(s)</span>
          <span>Automatic SLA polling active</span>
        </div>
      </div>
    </div>
  );
}
