import React from 'react';
import { Zap, RefreshCw, CheckCircle } from 'lucide-react';

export default function SimulatorView({
  paymentLinks,
  onSimulatePayment,
  onRunSLAEvaluation
}) {
  const pendingLinks = paymentLinks.filter((l) => l.status === 'PENDING' || l.status === 'OVERDUE');

  return (
    <div>
      <div className="page-title-banner">
        <div>
          <h1 className="page-heading">Payment Gateway &amp; SLA Simulator</h1>
          <p className="page-subheading">
            Control panel to simulate gateway webhook callbacks and trigger background SLA rules.
          </p>
        </div>
      </div>

      <div className="kpi-strip" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginBottom: '20px' }}>
        <div className="kpi-card-minimal" style={{ padding: '16px' }}>
          <div className="kpi-info-col">
            <span className="kpi-label-text">Background SLA Engine</span>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Scans for links where <code>due_at &lt;= now()</code> and sets status to <code>OVERDUE</code>.
            </p>
            <div style={{ marginTop: '12px' }}>
              <button className="btn btn-primary btn-sm" onClick={onRunSLAEvaluation}>
                <RefreshCw size={13} />
                <span>Execute SLA Evaluation Now</span>
              </button>
            </div>
          </div>
          <div className="kpi-icon-container">
            <RefreshCw size={18} />
          </div>
        </div>

        <div className="kpi-card-minimal" style={{ padding: '16px' }}>
          <div className="kpi-info-col">
            <span className="kpi-label-text">Active Test Links Available</span>
            <div className="kpi-value-row">
              <span className="kpi-bold-number">{pendingLinks.length}</span>
              <span className="kpi-neutral-badge">Ready to Simulate</span>
            </div>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              Pending and overdue links that can be converted via mock webhook.
            </p>
          </div>
          <div className="kpi-icon-container">
            <Zap size={18} />
          </div>
        </div>
      </div>

      <div className="modern-table-container">
        <div className="modern-table-toolbar">
          <div className="toolbar-title-group">
            <Zap size={15} color="var(--guvi-green)" />
            <span className="toolbar-heading">Available Links for Webhook Simulation</span>
            <span className="chip neutral">{pendingLinks.length} Active</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            One-click webhook testing
          </span>
        </div>

        {pendingLinks.length === 0 ? (
          <div className="empty-box">
            <CheckCircle size={32} color="var(--guvi-green)" style={{ marginBottom: '8px' }} />
            <h4 style={{ color: '#0f172a', fontWeight: 700 }}>No Pending Links to Simulate</h4>
            <p style={{ fontSize: '12px', marginTop: '4px' }}>Generate a new payment link to test webhook callbacks.</p>
          </div>
        ) : (
          <div className="modern-table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Link ID</th>
                  <th>Candidate / Lead</th>
                  <th>Target Course</th>
                  <th>DP Amount</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>Webhook Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingLinks.map((link) => (
                  <tr key={link.id}>
                    <td>
                      <code style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                        {link.id}
                      </code>
                    </td>
                    <td>
                      <div className="user-name-title">{link.lead_name || link.lead_id}</div>
                    </td>
                    <td>
                      <div className="course-badge-text">{link.course_title || link.course_id}</div>
                    </td>
                    <td>
                      <div className="currency-amount">₹{link.amount?.toLocaleString()}</div>
                    </td>
                    <td>
                      <span className={`chip ${link.status === 'OVERDUE' ? 'critical' : 'warning'}`}>
                        {link.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-action-group" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onSimulatePayment(link.id)}
                        >
                          <Zap size={12} />
                          <span>Trigger 'Payment Success' Webhook</span>
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
          <span>Ready for mock webhook payload submission</span>
          <span>FastAPI endpoint: /api/v1/payments/simulate-webhook</span>
        </div>
      </div>
    </div>
  );
}
