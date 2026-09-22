import React from 'react';

export default function Header({ bds, selectedBdId, onSelectBd, onOpenGenerateModal }) {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo">DP-REMIND</div>
        <div>
          <div className="brand-title">Payment Link Reminder System</div>
          <div className="brand-subtitle">EdTech Down-Payment & Follow-up Tracking</div>
        </div>
      </div>

      <div className="header-controls">
        <div className="bd-selector-wrapper">
          <span className="bd-label">Active BD:</span>
          <select
            className="bd-select"
            value={selectedBdId}
            onChange={(e) => onSelectBd(e.target.value)}
          >
            {bds.map((bd) => (
              <option key={bd.id} value={bd.id}>
                {bd.name} ({bd.email})
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={onOpenGenerateModal}>
          ➕ Generate Payment Link
        </button>
      </div>
    </header>
  );
}
