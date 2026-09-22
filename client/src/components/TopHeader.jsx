import React, { useState } from 'react';
import { Search, RefreshCw, Plus, Calendar, ChevronDown, CheckCircle } from 'lucide-react';

export default function TopHeader({
  bds = [],
  selectedBdId,
  onSelectBd,
  onOpenGenerateModal,
  onRunSLAEvaluation,
  onRefresh
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const currentBd = bds.find((b) => b.id === selectedBdId) || bds[0] || {};

  // Formatted date (e.g., "19 Sep 2025")
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="top-header">
      {/* Left: Prominent Clean Search Bar & SLA Status Badge */}
      <div className="header-left">
        <div className="prominent-header-search">
          <Search size={15} color="var(--guvi-green)" />
          <input
            type="text"
            className="prominent-search-input"
            placeholder="Search candidate leads, phone, or payment links..."
          />
        </div>

        <div className="sla-live-badge-clean">
          <span className="sla-green-dot"></span>
          <span>24h SLA Active</span>
        </div>
      </div>

      {/* Right: SLA Button, Date Badge, and BDA Switcher */}
      <div className="header-right">
        <button
          className="btn btn-secondary btn-sm"
          title="Trigger immediate background SLA evaluation"
          onClick={onRunSLAEvaluation}
          style={{ height: '36px', padding: '0 12px' }}
        >
          <RefreshCw size={13} />
          <span>Run SLA Check</span>
        </button>

        <div className="header-date-pill">
          <Calendar size={13} color="#64748b" />
          <span>{todayFormatted}</span>
        </div>

        {/* BDA Switcher Menu */}
        <div className="bda-header-profile-menu">
          <button
            className="bda-profile-btn"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <div className="bda-profile-details">
              <div className="bda-profile-name">{currentBd.name || 'Rahul Sharma'}</div>
              <div className="bda-profile-role">{currentBd.role || 'Senior BD Executive'}</div>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </button>

          {showDropdown && (
            <div className="bda-dropdown-panel">
              <div className="bda-dropdown-header">Switch BD Executive</div>
              {bds.map((bd) => (
                <div
                  key={bd.id}
                  className={`bda-dropdown-item ${bd.id === selectedBdId ? 'active' : ''}`}
                  onClick={() => {
                    onSelectBd(bd.id);
                    setShowDropdown(false);
                  }}
                >
                  <div className="bda-dropdown-avatar">{bd.avatar || 'BD'}</div>
                  <div>
                    <div className="bda-dropdown-name">{bd.name}</div>
                    <div className="bda-dropdown-role">{bd.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
