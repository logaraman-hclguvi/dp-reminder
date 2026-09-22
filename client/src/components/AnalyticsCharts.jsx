import React from 'react';
import { IndianRupee, Users, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AnalyticsCharts({
  bds = [],
  paymentLinks = [],
  leads = [],
  overdueReminders = []
}) {
  // 1. Calculate Amount Distribution
  const paidAmount = paymentLinks
    .filter((l) => l.status === 'PAID')
    .reduce((sum, l) => sum + (l.amount || 0), 0);

  const overdueAmount = paymentLinks
    .filter((l) => l.status === 'OVERDUE')
    .reduce((sum, l) => sum + (l.amount || 0), 0);

  const pendingAmount = paymentLinks
    .filter((l) => l.status === 'PENDING')
    .reduce((sum, l) => sum + (l.amount || 0), 0);

  const totalTrackedAmount = paidAmount + overdueAmount + pendingAmount || 1;
  const pctPaid = Math.round((paidAmount / totalTrackedAmount) * 100);
  const pctOverdue = Math.round((overdueAmount / totalTrackedAmount) * 100);
  const pctPending = Math.round((pendingAmount / totalTrackedAmount) * 100);

  // 2. Calculate Uncollected DP by BDA
  const bdUncollectedStats = bds.map((bd) => {
    const bdLinks = paymentLinks.filter((l) => l.bd_id === bd.id);
    const uncollectedLinks = bdLinks.filter((l) => l.status === 'PENDING' || l.status === 'OVERDUE');
    const uncollectedCount = uncollectedLinks.length || (bd.overdue_count || 0) + (bd.pending_count ? 1 : 0);
    const uncollectedAmount = uncollectedLinks.reduce((sum, l) => sum + (l.amount || 0), 0) || (uncollectedCount * 2200);
    const paidCount = bdLinks.filter((l) => l.status === 'PAID').length || (bd.converted_today || 0);

    return {
      id: bd.id,
      name: bd.name,
      role: bd.role,
      avatar: bd.avatar || bd.name.slice(0, 2).toUpperCase(),
      uncollectedCount,
      uncollectedAmount,
      paidCount
    };
  });

  // Sort descending: BDA with MOST uncollected leads first
  bdUncollectedStats.sort((a, b) => b.uncollectedCount - a.uncollectedCount);
  const maxUncollected = Math.max(...bdUncollectedStats.map((b) => b.uncollectedCount), 1);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
      {/* Chart 1: Amount Collection & Pipeline at Risk */}
      <div className="main-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={15} color="var(--guvi-green)" />
              Revenue Collection &amp; Pipeline Breakdown
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Tracked DP Volume: ₹{totalTrackedAmount.toLocaleString()}</p>
          </div>
          <span className="chip success">₹{paidAmount.toLocaleString()} Secured</span>
        </div>

        {/* Visual Multi-Bar Graph */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
          {/* Bar 1: Converted */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--guvi-green)' }}></span>
                Collected (Paid)
              </span>
              <span><strong>₹{paidAmount.toLocaleString()}</strong> ({pctPaid}%)</span>
            </div>
            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pctPaid}%`,
                  background: 'var(--guvi-green)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease'
                }}
              ></div>
            </div>
          </div>

          {/* Bar 2: Overdue */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}></span>
                Overdue Pipeline at Risk (&gt; 24h)
              </span>
              <span style={{ color: 'var(--danger)' }}><strong>₹{overdueAmount.toLocaleString()}</strong> ({pctOverdue}%)</span>
            </div>
            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pctOverdue}%`,
                  background: 'var(--danger)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease'
                }}
              ></div>
            </div>
          </div>

          {/* Bar 3: Pending in Grace */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></span>
                Active within 24h Grace SLA
              </span>
              <span style={{ color: '#b45309' }}><strong>₹{pendingAmount.toLocaleString()}</strong> ({pctPending}%)</span>
            </div>
            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pctPending}%`,
                  background: 'var(--warning)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart 2: BDA Uncollected Ranking */}
      <div className="main-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={15} color="#475569" />
              Uncollected DP by BDA (Needs Follow-up)
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ranking reps with most unpaid candidate links</p>
          </div>
          <span className="chip critical">Attention Ranking</span>
        </div>

        {/* BDA Ranking Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {bdUncollectedStats.map((bda, index) => {
            const barWidth = Math.round((bda.uncollectedCount / maxUncollected) * 100);
            const isTopUncollected = index === 0 && bda.uncollectedCount > 0;

            return (
              <div key={bda.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: isTopUncollected ? 'var(--danger-light)' : '#f1f5f9',
                        color: isTopUncollected ? 'var(--danger)' : '#64748b',
                        fontSize: '10px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      #{index + 1}
                    </span>
                    <strong>{bda.name}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({bda.role})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, color: isTopUncollected ? 'var(--danger)' : 'var(--text-main)' }}>
                      {bda.uncollectedCount} Uncollected
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(₹{bda.uncollectedAmount.toLocaleString()})</span>
                  </div>
                </div>

                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${barWidth}%`,
                      background: isTopUncollected
                        ? 'var(--danger)'
                        : 'var(--guvi-green)',
                      borderRadius: '3px',
                      transition: 'width 0.4s ease'
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
