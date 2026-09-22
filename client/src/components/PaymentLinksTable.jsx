import React, { useState, useMemo } from 'react';
import { CreditCard, Plus, Zap, CheckCircle, ChevronDown, Mail, Search, Download, FileText, Clock, AlertTriangle } from 'lucide-react';

export default function PaymentLinksTable({
  links = [],
  statusFilter = 'ALL',
  onChangeStatusFilter,
  onSimulatePayment,
  onCancelLink,
  onChangeStatus,
  onSendEmailReminder,
  onOpenGenerateModal,
  onOpenLinkDetails
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const pendingCount = links.filter((l) => l.status === 'PENDING').length;
  const overdueCount = links.filter((l) => l.status === 'OVERDUE').length;
  const paidCount = links.filter((l) => l.status === 'PAID').length;
  const cancelledCount = links.filter((l) => l.status === 'CANCELLED').length;

  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      if (statusFilter === 'PENDING' && link.status !== 'PENDING') return false;
      if (statusFilter === 'OVERDUE' && link.status !== 'OVERDUE') return false;
      if (statusFilter === 'PAID' && link.status !== 'PAID') return false;
      if (statusFilter === 'CANCELLED' && link.status !== 'CANCELLED') return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const name = (link.lead_name || '').toLowerCase();
        const course = (link.course_title || '').toLowerCase();
        const id = (link.id || '').toLowerCase();
        const phone = (link.lead_phone || '').toLowerCase();
        return name.includes(query) || course.includes(query) || id.includes(query) || phone.includes(query);
      }
      return true;
    });
  }, [links, statusFilter, searchTerm]);

  return (
    <div>
      {/* 1. Page Title Banner */}
      <div className="page-title-banner">
        <div>
          <h1 className="page-heading">Payment Links Repository</h1>
          <p className="page-subheading">Complete directory of all generated down-payment tokens and links.</p>
        </div>
        <button className="btn btn-primary-solid" onClick={onOpenGenerateModal}>
          <Plus size={15} />
          <span>Generate Link</span>
        </button>
      </div>

      {/* 2. Modern Table Container with Pill Tabs Filter */}
      <div className="modern-table-container">
        <div className="bottom-table-top-bar">
          {/* Left: Heading and Sleek Pill Tabs */}
          <div className="bottom-table-title-and-tabs">
            <div className="bottom-table-heading">
              <CreditCard size={16} color="var(--guvi-green)" />
              <span>Tracked Links &amp; Transactions</span>
            </div>

            <div className="sla-pill-tabs">
              <button
                className={`sla-pill ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => onChangeStatusFilter('ALL')}
              >
                All ({links.length})
              </button>

              <button
                className={`sla-pill ${statusFilter === 'PENDING' ? 'active' : ''}`}
                onClick={() => onChangeStatusFilter('PENDING')}
              >
                <span className="dot-indicator warning"></span>
                Within 24h Grace ({pendingCount})
              </button>

              <button
                className={`sla-pill ${statusFilter === 'OVERDUE' ? 'active' : ''}`}
                onClick={() => onChangeStatusFilter('OVERDUE')}
              >
                <span className="dot-indicator danger"></span>
                Overdue ({overdueCount})
              </button>

              <button
                className={`sla-pill ${statusFilter === 'PAID' ? 'active' : ''}`}
                onClick={() => onChangeStatusFilter('PAID')}
              >
                Converted ({paidCount})
              </button>

              {cancelledCount > 0 && (
                <button
                  className={`sla-pill ${statusFilter === 'CANCELLED' ? 'active' : ''}`}
                  onClick={() => onChangeStatusFilter('CANCELLED')}
                >
                  Cancelled ({cancelledCount})
                </button>
              )}
            </div>
          </div>

          {/* Right: Search Input */}
          <div className="bottom-table-actions-right">
            <div className="table-search-input-wrap">
              <Search size={13} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search links, lead, course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="table-search-input"
              />
            </div>
          </div>
        </div>

        {filteredLinks.length === 0 ? (
          <div className="empty-box" style={{ padding: '36px 0' }}>
            <CreditCard size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
            <h4 style={{ color: '#0f172a', fontWeight: 700 }}>No Payment Links Found</h4>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Try selecting a different filter tab or clear your search term.
            </p>
          </div>
        ) : (
          <div className="modern-table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ width: '85px' }}>Link ID</th>
                  <th>Candidate / Lead</th>
                  <th>Target Course</th>
                  <th>DP Amount</th>
                  <th>Dynamic Status</th>
                  <th>Timeline</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((link) => (
                  <tr key={link.id}>
                    <td>
                      <code style={{ fontSize: '11px', background: '#f1f5f9', padding: '3px 6px', borderRadius: '4px', color: '#334155', fontWeight: 600 }}>
                        {link.id}
                      </code>
                    </td>
                    <td>
                      <div className="user-name-title">{link.lead_name || link.lead_id}</div>
                      <div className="user-contact-sub">{link.lead_phone}</div>
                    </td>
                    <td>
                      <div className="course-badge-text">
                        {link.course_title || link.course_id}
                      </div>
                    </td>
                    <td>
                      <div className="currency-amount">
                        ₹{link.amount?.toLocaleString()}
                      </div>
                    </td>
                    <td>
                      {/* Interactive Dynamic Status Dropdown */}
                      <select
                        value={link.status}
                        onChange={(e) => onChangeStatus(link.id, e.target.value)}
                        className={`chip ${
                          link.status === 'OVERDUE'
                            ? 'critical'
                            : link.status === 'PAID'
                            ? 'success'
                            : link.status === 'PENDING'
                            ? 'warning'
                            : 'neutral'
                        }`}
                        style={{ cursor: 'pointer', outline: 'none', border: 'none', fontWeight: 700 }}
                        title="Click to dynamically change status"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="OVERDUE">OVERDUE</option>
                        <option value="PAID">PAID</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                        <div>Created: {new Date(link.created_at).toLocaleDateString()}</div>
                        <div>Due: {new Date(link.due_at).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td>
                      <div className="table-action-group" style={{ justifyContent: 'flex-end' }}>
                        {onOpenLinkDetails && (
                          <button
                            className="btn btn-secondary btn-sm"
                            title="View Full Link Details & Notes"
                            onClick={() => onOpenLinkDetails(link)}
                          >
                            <span>View</span>
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Copy Payment URL to clipboard"
                          onClick={() => {
                            const url = link.payment_url || `https://pay.edtech.com/${link.id}`;
                            navigator.clipboard.writeText(url);
                          }}
                        >
                          <span>🔗 Copy URL</span>
                        </button>
                        {(link.status === 'PENDING' || link.status === 'OVERDUE') && (
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Send Reminder Email via Gmail SMTP"
                            onClick={() => onSendEmailReminder(link)}
                          >
                            <Mail size={11} color={link.status === 'OVERDUE' ? 'var(--danger)' : 'var(--guvi-green)'} />
                            <span>Email</span>
                          </button>
                        )}
                        {link.status === 'PENDING' || link.status === 'OVERDUE' ? (
                          <>
                            <button
                              className="btn btn-primary-soft btn-sm"
                              onClick={() => onSimulatePayment(link.id)}
                            >
                              <Zap size={11} />
                              <span>Mark Paid</span>
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: '#e11d48', borderColor: '#fecdd3' }}
                              onClick={() => onCancelLink(link.id)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <span style={{ color: 'var(--guvi-green)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={12} />
                            {link.status === 'PAID' ? 'Converted' : 'Closed'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer-bar">
          <span>Displaying {filteredLinks.length} record(s)</span>
          <span>Tip: Click any status badge to dynamically change its state</span>
        </div>
      </div>
    </div>
  );
}
