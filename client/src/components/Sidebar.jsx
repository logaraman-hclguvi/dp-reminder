import React from 'react';
import {
  LayoutGrid,
  AlertTriangle,
  CreditCard,
  Users,
  Database,
  Zap,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentBd = {},
  overdueCount = 0,
  pendingCount = 0,
  leadsCount = 0,
  isCollapsed,
  onToggleCollapse
}) {
  return (
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* 1. Header with Brand */}
      <div className="sidebar-header">
        <div className="sidebar-brand-wrapper">
          <div className="sidebar-brand-icon-box">
            <GraduationCap size={20} color="#ffffff" />
          </div>
          {!isCollapsed && (
            <div className="sidebar-brand-text-col">
              <div className="sidebar-brand-title">DP-REMIND</div>
              <div className="sidebar-brand-subtitle">OPERATIONS CLOUD</div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Navigation Links */}
      <nav className="sidebar-nav">
        {!isCollapsed && <div className="sidebar-group-title">CORE OPERATIONS</div>}

        <button
          className={`sidebar-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          title="Dashboard"
        >
          <div className="sidebar-nav-btn-left">
            <LayoutGrid size={16} />
            {!isCollapsed && <span>Dashboard</span>}
          </div>
        </button>

        <button
          className={`sidebar-nav-btn ${activeTab === 'overdue' ? 'active' : ''}`}
          onClick={() => setActiveTab('overdue')}
          title="Overdue Queue"
        >
          <div className="sidebar-nav-btn-left">
            <AlertTriangle size={16} />
            {!isCollapsed && <span>Overdue Queue</span>}
          </div>
          {overdueCount > 0 && !isCollapsed && (
            <span className="sidebar-nav-pill-danger">{overdueCount}</span>
          )}
        </button>

        <button
          className={`sidebar-nav-btn ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
          title="Payment Links"
        >
          <div className="sidebar-nav-btn-left">
            <CreditCard size={16} />
            {!isCollapsed && <span>Payment Links</span>}
          </div>
          {!isCollapsed && <span className="sidebar-nav-pill-count">1</span>}
        </button>

        <button
          className={`sidebar-nav-btn ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
          title="Leads"
        >
          <div className="sidebar-nav-btn-left">
            <Users size={16} />
            {!isCollapsed && <span>Leads</span>}
          </div>
          {!isCollapsed && <span className="sidebar-nav-pill-count">{leadsCount || 4}</span>}
        </button>

        {!isCollapsed && <div className="sidebar-group-title" style={{ marginTop: '18px' }}>TOOLS &amp; SCHEMA</div>}

        <button
          className={`sidebar-nav-btn ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
          title="Data Explorer"
        >
          <div className="sidebar-nav-btn-left">
            <Database size={16} />
            {!isCollapsed && <span>Data Explorer</span>}
          </div>
        </button>

        <button
          className={`sidebar-nav-btn ${activeTab === 'simulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulator')}
          title="Simulator"
        >
          <div className="sidebar-nav-btn-left">
            <Zap size={16} />
            {!isCollapsed && <span>Simulator</span>}
          </div>
        </button>
      </nav>

      {/* 3. Bottom BDA Profile Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar">
            {currentBd.avatar || currentBd.name?.slice(0, 2).toUpperCase() || 'RS'}
          </div>
          {!isCollapsed && (
            <>
              <div className="sidebar-user-meta">
                <div className="sidebar-user-name">{currentBd.name || 'Rahul Sharma'}</div>
                <div className="sidebar-user-role">{currentBd.role || 'Senior BD Executive'}</div>
              </div>
              <ChevronRight size={15} color="#94a3b8" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
