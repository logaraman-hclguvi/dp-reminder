import React from 'react';
import {
  LayoutGrid,
  AlertTriangle,
  CreditCard,
  Users,
  Database,
  Zap,
  ChevronRight,
  Flame,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentBd = {},
  overdueCount = 0,
  pendingCount = 0,
  linksCount = 0,
  leadsCount = 0,
  isCollapsed = false,
  onToggleCollapse
}) {
  return (
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* 1. Header with Anime Brand & Collapse Toggle */}
      <div className="sidebar-header">
        <div
          className="sidebar-brand-wrapper"
          onClick={isCollapsed ? onToggleCollapse : undefined}
          style={{ cursor: isCollapsed ? 'pointer' : 'default' }}
          title={isCollapsed ? 'Click to expand sidebar' : 'SHINOBI-OPS — Ninja Operations Cloud'}
        >
          <div className="sidebar-brand-icon-box">
            <Flame size={20} color="#ffffff" />
          </div>
          {!isCollapsed && (
            <div className="sidebar-brand-text-col">
              <div className="sidebar-brand-title">SHINOBI-OPS</div>
              <div className="sidebar-brand-subtitle">NINJA REMINDER CLOUD</div>
            </div>
          )}
        </div>

        {onToggleCollapse && (
          <button
            className="sidebar-toggle-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        )}
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
            <LayoutGrid size={17} />
            {!isCollapsed && <span>Dashboard</span>}
          </div>
        </button>

        <button
          className={`sidebar-nav-btn ${activeTab === 'overdue' ? 'active' : ''}`}
          onClick={() => setActiveTab('overdue')}
          title={`Overdue Queue (${overdueCount} urgent)`}
        >
          <div className="sidebar-nav-btn-left">
            <AlertTriangle size={17} color={overdueCount > 0 ? '#e11d48' : undefined} />
            {!isCollapsed && <span>Overdue Queue</span>}
          </div>
          {overdueCount > 0 && (
            !isCollapsed ? (
              <span className="sidebar-nav-pill-danger">{overdueCount}</span>
            ) : (
              <span className="sidebar-collapsed-dot danger" title={`${overdueCount} Overdue`}></span>
            )
          )}
        </button>

        <button
          className={`sidebar-nav-btn ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
          title={`Payment Links (${linksCount})`}
        >
          <div className="sidebar-nav-btn-left">
            <CreditCard size={17} />
            {!isCollapsed && <span>Payment Links</span>}
          </div>
          {!isCollapsed && (
            <span className="sidebar-nav-pill-count">{linksCount}</span>
          )}
        </button>

        <button
          className={`sidebar-nav-btn ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
          title={`Leads Pipeline (${leadsCount})`}
        >
          <div className="sidebar-nav-btn-left">
            <Users size={17} />
            {!isCollapsed && <span>Leads</span>}
          </div>
          {!isCollapsed && (
            <span className="sidebar-nav-pill-count">{leadsCount}</span>
          )}
        </button>

        {!isCollapsed && <div className="sidebar-group-title" style={{ marginTop: '18px' }}>TOOLS &amp; SCHEMA</div>}

        <button
          className={`sidebar-nav-btn ${activeTab === 'explorer' ? 'active' : ''}`}
          onClick={() => setActiveTab('explorer')}
          title="Data Explorer"
        >
          <div className="sidebar-nav-btn-left">
            <Database size={17} />
            {!isCollapsed && <span>Data Explorer</span>}
          </div>
        </button>

        <button
          className={`sidebar-nav-btn ${activeTab === 'simulator' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulator')}
          title="Simulator"
        >
          <div className="sidebar-nav-btn-left">
            <Zap size={17} />
            {!isCollapsed && <span>Simulator</span>}
          </div>
        </button>
      </nav>

      {/* 3. Bottom BDA Profile Footer */}
      <div className="sidebar-footer">
        <div
          className="sidebar-user-card"
          title={`${currentBd.name || 'Rahul Sharma'} (${currentBd.role || 'Senior BD Executive'})`}
        >
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
