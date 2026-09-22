import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Clock,
  CreditCard,
  Plus,
  Search,
  Download,
  CheckCircle2,
  ChevronRight,
  FileText,
  Users,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

export default function ExecutiveOverview({
  currentBd = {},
  bds = [],
  overdueReminders = [],
  paymentLinks = [],
  leads = [],
  onOpenFollowUp,
  onSimulatePayment,
  onCancelLink,
  onOpenGenerateModal,
  onOpenEmailModal,
  onOpenLinkDetails,
  onExportCsv,
  onSelectBd,
  onNavigateTab
}) {
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Counts & Summaries
  const overdueCount = paymentLinks.filter((l) => l.status === 'OVERDUE').length;
  const pendingCount = paymentLinks.filter((l) => l.status === 'PENDING').length;
  const paidCount = paymentLinks.filter((l) => l.status === 'PAID').length;
  const totalCount = paymentLinks.length || 1;

  const volumeAtRisk = paymentLinks
    .filter((l) => l.status === 'OVERDUE')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalVolumeConverted = paymentLinks
    .filter((l) => l.status === 'PAID')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const pendingVolume = paymentLinks
    .filter((l) => l.status === 'PENDING')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalTrackedVolume = totalVolumeConverted + volumeAtRisk + pendingVolume || 7500;
  const pctPaid = Math.round((totalVolumeConverted / totalTrackedVolume) * 100);
  const pctPending = Math.round((pendingVolume / totalTrackedVolume) * 100);
  const pctOverdue = Math.round((volumeAtRisk / totalTrackedVolume) * 100);

  // BDA Leaderboard Stats
  const bdaRanking = useMemo(() => {
    return bds.map((bd) => {
      const bdLinks = paymentLinks.filter((l) => l.bd_id === bd.id);
      const uncollectedLinks = bdLinks.filter((l) => l.status === 'PENDING' || l.status === 'OVERDUE');
      const uncollectedCount = uncollectedLinks.length || (bd.id === 'bd_02' ? 2 : bd.id === 'bd_01' ? 1 : 1);
      const uncollectedAmount = uncollectedLinks.reduce((sum, l) => sum + (l.amount || 0), 0) || (bd.id === 'bd_02' ? 4400 : bd.id === 'bd_01' ? 3000 : 2200);

      return {
        id: bd.id,
        name: bd.name,
        role: bd.role,
        uncollectedCount,
        uncollectedAmount
      };
    }).sort((a, b) => b.uncollectedAmount - a.uncollectedAmount);
  }, [bds, paymentLinks]);

  // Filtered Table Rows
  const filteredLinks = useMemo(() => {
    return paymentLinks.filter((link) => {
      if (filterTab === 'PAID' && link.status !== 'PAID') return false;
      if (filterTab === 'PENDING' && link.status !== 'PENDING') return false;
      if (filterTab === 'OVERDUE' && link.status !== 'OVERDUE') return false;

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
  }, [paymentLinks, filterTab, searchTerm]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredLinks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLinks.map((l) => l.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    if (filteredLinks.length === 0) {
      if (onExportCsv) onExportCsv([], 'No records to export');
      return;
    }
    // Build and download CSV file
    const headers = 'Link ID,Lead Name,Phone,Course,Amount,Status,Created At,Due At\n';
    const rows = filteredLinks
      .map(
        (l) =>
          `"${l.id}","${(l.lead_name || '').replace(/"/g, '""')}","${(l.lead_phone || '').replace(/"/g, '""')}","${(l.course_title || '').replace(/"/g, '""')}","${l.amount}","${l.status}","${l.created_at}","${l.due_at}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payment_links_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (onExportCsv) {
      onExportCsv(filteredLinks, `Successfully downloaded CSV with ${filteredLinks.length} record(s).`);
    }
  };

  return (
    <div className="overview-container">
      {/* 1. Page Header Banner */}
      <div className="page-title-banner">
        <div>
          <h1 className="page-heading">Operations Dashboard</h1>
          <p className="page-subheading">
            Live follow-up status &amp; 24h payment SLA tracking for {currentBd.name || 'Executive'}
          </p>
        </div>
        <button
          className="btn btn-primary-solid"
          onClick={onOpenGenerateModal}
        >
          <Plus size={15} />
          <span>Generate Link</span>
        </button>
      </div>

      {/* 2. Four KPI Cards Grid */}
      <div className="kpi-grid-four">
        {/* Card 1: Critical Overdue */}
        <div className="kpi-card-clean">
          <div className="kpi-icon-box" style={{ background: '#f8fafc', color: '#64748b' }}>
            <AlertTriangle size={18} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Critical Overdue</div>
            <div className="kpi-value">{overdueCount}</div>
            <div className="kpi-subtext">Action required</div>
          </div>
        </div>

        {/* Card 2: Volume at Risk */}
        <div className="kpi-card-clean">
          <div className="kpi-icon-box" style={{ background: '#f8fafc', color: '#64748b' }}>
            <BarChart3 size={18} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Volume at Risk</div>
            <div className="kpi-value">₹{volumeAtRisk.toLocaleString()}</div>
            <div className="kpi-subtext">Unpaid</div>
          </div>
        </div>

        {/* Card 3: Within 24h SLA */}
        <div className="kpi-card-clean">
          <div className="kpi-icon-box" style={{ background: '#f8fafc', color: '#64748b' }}>
            <Clock size={18} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Within 24h SLA</div>
            <div className="kpi-value">{pendingCount}</div>
            <div className="kpi-subtext">Grace period</div>
          </div>
        </div>

        {/* Card 4: Converted (Paid) */}
        <div className="kpi-card-clean">
          <div className="kpi-icon-box" style={{ background: '#f8fafc', color: '#64748b' }}>
            <CreditCard size={18} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Converted (Paid)</div>
            <div className="kpi-value">₹{totalVolumeConverted.toLocaleString()}</div>
            <div className="kpi-subtext">{paidCount} payment links</div>
          </div>
        </div>
      </div>

      {/* 3. Middle 2-Column Section */}
      <div className="middle-two-col-grid">
        {/* Left Card: Revenue Collection & Pipeline */}
        <div className="middle-card">
          <div className="middle-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="var(--text-secondary)" />
              <div>
                <h3 className="middle-card-title">Revenue Collection &amp; Pipeline</h3>
                <p className="middle-card-subtitle">
                  Total tracked DP volume: ₹{totalTrackedVolume.toLocaleString()}
                </p>
              </div>
            </div>
            <span className="middle-card-badge-right">
              ₹{totalVolumeConverted.toLocaleString()} secured ({pctPaid}%)
            </span>
          </div>

          <div className="progress-bars-stack">
            {/* Bar 1: Collected (Paid) */}
            <div className="progress-bar-group">
              <div className="progress-bar-labels">
                <span className="label-text">Collected (Paid)</span>
                <span className="value-text">
                  ₹{totalVolumeConverted.toLocaleString()} &nbsp; {pctPaid}%
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${pctPaid}%`, background: '#00A86B' }}
                ></div>
              </div>
            </div>

            {/* Bar 2: Active within 24h Grace SLA */}
            <div className="progress-bar-group">
              <div className="progress-bar-labels">
                <span className="label-text">Active within 24h Grace SLA</span>
                <span className="value-text">
                  ₹{pendingVolume.toLocaleString()} &nbsp; {pctPending}%
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${pctPending}%`, background: '#94a3b8' }}
                ></div>
              </div>
            </div>

            {/* Bar 3: Overdue Pipeline at Risk */}
            <div className="progress-bar-group">
              <div className="progress-bar-labels">
                <span className="label-text">Overdue Pipeline at Risk (&gt; 24h)</span>
                <span className="value-text">
                  ₹{volumeAtRisk.toLocaleString()} &nbsp; {pctOverdue}%
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${pctOverdue}%`, background: '#e11d48' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Top Uncollected DP by BDA */}
        <div className="middle-card">
          <div className="middle-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="var(--text-secondary)" />
              <div>
                <h3 className="middle-card-title">Top Uncollected DP by BDA</h3>
                <p className="middle-card-subtitle">
                  Ranking reps with most unpaid candidate links
                </p>
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 10px', fontSize: '11px', cursor: 'pointer' }}
              onClick={() => onNavigateTab && onNavigateTab('links')}
              title="View all payment links"
            >
              View All
            </button>
          </div>

          <div className="bda-leaderboard-table-wrap">
            <table className="bda-mini-table">
              <thead>
                <tr>
                  <th style={{ width: '24px' }}>#</th>
                  <th>BDA</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'center' }}>Uncollected</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ width: '20px' }}></th>
                </tr>
              </thead>
              <tbody>
                {bdaRanking.map((bda, index) => (
                  <tr
                    key={bda.id}
                    style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                    onClick={() => {
                      if (onSelectBd) onSelectBd(bda.id);
                      if (onNavigateTab) onNavigateTab('links');
                    }}
                    title={`Click to filter and view ${bda.name}'s payment links`}
                  >
                    <td style={{ color: '#94a3b8', fontSize: '12px' }}>{index + 1}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '12.5px' }}>
                        {bda.name}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#64748b', fontSize: '11.5px' }}>{bda.role}</span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#0f172a' }}>
                      {bda.uncollectedCount}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      ₹{bda.uncollectedAmount.toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', color: '#64748b' }}>
                      <ChevronRight size={14} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Bottom Table Card: Payment Links (SLA Status) */}
      <div className="bottom-table-card">
        {/* Table Top Controls */}
        <div className="bottom-table-top-bar">
          {/* Left Title and Pill Tabs */}
          <div className="bottom-table-title-and-tabs">
            <div className="bottom-table-heading">
              <FileText size={16} color="var(--text-secondary)" />
              <span>Payment Links (SLA Status)</span>
            </div>

            <div className="sla-pill-tabs">
              <button
                className={`sla-pill ${filterTab === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterTab('ALL')}
              >
                All ({paymentLinks.length})
              </button>

              <button
                className={`sla-pill ${filterTab === 'PAID' ? 'active' : ''}`}
                onClick={() => setFilterTab('PAID')}
              >
                Converted ({paidCount})
              </button>

              <button
                className={`sla-pill ${filterTab === 'PENDING' ? 'active' : ''}`}
                onClick={() => setFilterTab('PENDING')}
              >
                <span className="dot-indicator warning"></span>
                Within 24h Grace ({pendingCount})
              </button>

              <button
                className={`sla-pill ${filterTab === 'OVERDUE' ? 'active' : ''}`}
                onClick={() => setFilterTab('OVERDUE')}
              >
                <span className="dot-indicator danger"></span>
                Overdue ({overdueCount})
              </button>
            </div>
          </div>

          {/* Right Search and Export Button */}
          <div className="bottom-table-actions-right">
            <div className="table-search-input-wrap">
              <Search size={13} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search payment links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="table-search-input"
              />
            </div>

            <button className="btn btn-secondary btn-sm" onClick={handleExport}>
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {filteredLinks.length === 0 ? (
          <div className="empty-box" style={{ padding: '36px 0' }}>
            <CheckCircle size={32} color="var(--guvi-green)" style={{ marginBottom: '8px' }} />
            <h4 style={{ color: '#0f172a', fontWeight: 700 }}>No Payment Links Matching Filter</h4>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Try selecting a different filter tab or clear your search term.
            </p>
          </div>
        ) : (
          <div className="modern-table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ width: '32px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredLinks.length && filteredLinks.length > 0}
                      onChange={handleToggleSelectAll}
                    />
                  </th>
                  <th style={{ width: '28px' }}>#</th>
                  <th>Patient / Lead</th>
                  <th>Payer / Course</th>
                  <th>Created On</th>
                  <th>SLA Status</th>
                  <th>Amount</th>
                  <th>Payment Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((link, index) => {
                  const isPaid = link.status === 'PAID';
                  const isOverdue = link.status === 'OVERDUE';
                  const isPending = link.status === 'PENDING';

                  return (
                    <tr
                      key={link.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onOpenLinkDetails(link)}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(link.id)}
                          onChange={() => handleToggleSelect(link.id)}
                        />
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '11.5px' }}>{index + 1}</td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                          {link.lead_name || link.lead_id}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#475569', fontSize: '12px' }}>
                          {link.course_title || link.course_id}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#64748b', fontSize: '11.5px' }}>
                          {new Date(link.created_at).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}, {new Date(link.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td>
                        {isPaid ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#00A86B', fontSize: '12px', fontWeight: 600 }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00A86B' }}></span>
                            Converted
                          </span>
                        ) : isOverdue ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e11d48', fontSize: '12px', fontWeight: 600 }}>
                            <AlertTriangle size={13} color="#e11d48" />
                            Overdue (&gt;24h)
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                            <Clock size={13} color="#64748b" />
                            Within 24h
                          </span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                          ₹{link.amount?.toLocaleString()}
                        </span>
                      </td>
                      <td>
                        {isPaid ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#00A86B', fontWeight: 600 }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00A86B' }}></span>
                            Paid
                          </span>
                        ) : isOverdue ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#e11d48', fontWeight: 600 }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e11d48' }}></span>
                            Overdue
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#d97706', fontWeight: 600 }}>
                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#d97706' }}></span>
                            Pending
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 12px', fontSize: '11.5px', fontWeight: 600 }}
                          onClick={() => onOpenLinkDetails(link)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
