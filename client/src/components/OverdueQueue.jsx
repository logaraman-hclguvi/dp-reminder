import React from 'react';
import { AlertTriangle, Clock, Edit3, Zap, Phone, CheckCircle, Mail, Copy, Ban } from 'lucide-react';

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
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((rem) => (
                  <tr
                    key={rem.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onOpenFollowUp(rem)}
                  >
                    <td>
                      <div className="user-identity-cell">
                        <div className="user-avatar-pill" style={{ background: '#fee2e2', color: '#e11d48' }}>
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
                        {/* 1. Primary Action */}
                        <button
                          className="table-btn-mark-paid"
                          title="Simulate instant gateway payment & resolve overdue alert"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSimulatePayment(rem.payment_link_id);
                          }}
                        >
                          <Zap size={12} />
                          <span>Mark Paid</span>
                        </button>

                        {/* 2. Micro Utility Tools */}
                        <button
                          className="table-icon-btn"
                          title="Log Call Note / View Touchpoints Timeline"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenFollowUp(rem);
                          }}
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          className="table-icon-btn"
                          title="Send Urgent Reminder Email via Gmail SMTP"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendEmailReminder(rem);
                          }}
                        >
                          <Mail size={13} color="var(--danger)" />
                        </button>

                        <button
                          className="table-icon-btn"
                          title="Copy Payment Checkout Link"
                          onClick={(e) => {
                            e.stopPropagation();
                            const url = rem.payment_url || `https://pay.edtech.com/${rem.payment_link_id}`;
                            navigator.clipboard.writeText(url);
                          }}
                        >
                          <Copy size={13} />
                        </button>

                        <button
                          className="table-icon-btn danger"
                          title="Cancel this Payment Link"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancelLink(rem.payment_link_id);
                          }}
                        >
                          <Ban size={13} />
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
