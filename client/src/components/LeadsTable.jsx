import React, { useState, useMemo } from 'react';
import { Plus, CreditCard, Users, Phone, Mail, MapPin, Search, CheckCircle2, UserCheck, Clock } from 'lucide-react';

export default function LeadsTable({
  leads = [],
  courses = [],
  onOpenAddLeadModal,
  onSelectLeadForLink,
  onChangeLeadStatus
}) {
  const [pipelineFilter, setPipelineFilter] = useState('ALL'); // 'ALL' | 'NEW' | 'PAYMENT_LINK_SENT' | 'CONVERTED' | 'LOST'
  const [searchTerm, setSearchTerm] = useState('');

  const newCount = leads.filter((l) => l.status === 'NEW').length;
  const linkSentCount = leads.filter((l) => l.status === 'PAYMENT_LINK_SENT').length;
  const convertedCount = leads.filter((l) => l.status === 'CONVERTED').length;
  const lostCount = leads.filter((l) => l.status === 'LOST').length;

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (pipelineFilter !== 'ALL' && lead.status !== pipelineFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const name = (lead.name || '').toLowerCase();
        const phone = (lead.phone || '').toLowerCase();
        const email = (lead.email || '').toLowerCase();
        return name.includes(q) || phone.includes(q) || email.includes(q);
      }
      return true;
    });
  }, [leads, pipelineFilter, searchTerm]);

  return (
    <div>
      {/* 1. Page Title Banner */}
      <div className="page-title-banner">
        <div>
          <h1 className="page-heading">Assigned Leads Directory</h1>
          <p className="page-subheading">Candidate pipeline assigned to the active BD for course enrollment.</p>
        </div>
        <button className="btn btn-primary-solid" onClick={onOpenAddLeadModal}>
          <Plus size={15} />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* 2. Modern Table Container with Pipeline Filter Tabs */}
      <div className="modern-table-container">
        <div className="bottom-table-top-bar">
          {/* Left: Heading and Pipeline Tabs */}
          <div className="bottom-table-title-and-tabs">
            <div className="bottom-table-heading">
              <Users size={16} color="var(--guvi-green)" />
              <span>Pipeline Stage Directory</span>
            </div>

            <div className="sla-pill-tabs">
              <button
                className={`sla-pill ${pipelineFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setPipelineFilter('ALL')}
              >
                All ({leads.length})
              </button>

              <button
                className={`sla-pill ${pipelineFilter === 'CONVERTED' ? 'active' : ''}`}
                onClick={() => setPipelineFilter('CONVERTED')}
              >
                <span className="dot-indicator" style={{ background: '#00A86B' }}></span>
                Converted ({convertedCount})
              </button>

              <button
                className={`sla-pill ${pipelineFilter === 'PAYMENT_LINK_SENT' ? 'active' : ''}`}
                onClick={() => setPipelineFilter('PAYMENT_LINK_SENT')}
              >
                <span className="dot-indicator warning"></span>
                Link Sent ({linkSentCount})
              </button>

              <button
                className={`sla-pill ${pipelineFilter === 'NEW' ? 'active' : ''}`}
                onClick={() => setPipelineFilter('NEW')}
              >
                New Inquiries ({newCount})
              </button>

              {lostCount > 0 && (
                <button
                  className={`sla-pill ${pipelineFilter === 'LOST' ? 'active' : ''}`}
                  onClick={() => setPipelineFilter('LOST')}
                >
                  Lost ({lostCount})
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
                placeholder="Search leads, phone, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="table-search-input"
              />
            </div>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="empty-box" style={{ padding: '36px 0' }}>
            <Users size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
            <h4 style={{ color: '#0f172a', fontWeight: 700 }}>No Leads in this Stage</h4>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Select another pipeline tab or register a new candidate.
            </p>
          </div>
        ) : (
          <div className="modern-table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Contact Details</th>
                  <th>Target Course</th>
                  <th>Dynamic Pipeline Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const course = courses.find((c) => c.id === lead.course_id);
                  const isConverted = lead.status === 'CONVERTED';

                  return (
                    <tr key={lead.id}>
                      <td>
                        <div className="user-identity-cell">
                          <div
                            className="user-avatar-pill"
                            style={{
                              background: isConverted ? 'var(--guvi-green-light)' : '#f1f5f9',
                              color: isConverted ? 'var(--guvi-green)' : '#334155'
                            }}
                          >
                            {lead.name?.slice(0, 2).toUpperCase() || 'LD'}
                          </div>
                          <div>
                            <div className="user-name-title">{lead.name}</div>
                            <div className="user-contact-sub">
                              <MapPin size={10} /> {lead.city || 'Student'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                          <Phone size={11} color="#64748b" /> {lead.phone}
                        </div>
                        {lead.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                            <Mail size={10} color="#94a3b8" /> {lead.email}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="course-badge-text">
                          {course ? course.title : lead.course_id}
                        </div>
                      </td>
                      <td>
                        {/* Interactive Dynamic Lead Status Dropdown */}
                        <select
                          value={lead.status}
                          onChange={(e) => onChangeLeadStatus(lead.id, e.target.value)}
                          className={`chip ${
                            lead.status === 'CONVERTED'
                              ? 'success'
                              : lead.status === 'PAYMENT_LINK_SENT'
                              ? 'warning'
                              : 'neutral'
                          }`}
                          style={{ cursor: 'pointer', outline: 'none', border: 'none', fontWeight: 700 }}
                          title="Click to dynamically change lead pipeline status"
                        >
                          <option value="NEW">NEW</option>
                          <option value="PAYMENT_LINK_SENT">PAYMENT_LINK_SENT</option>
                          <option value="CONVERTED">CONVERTED (Paid)</option>
                          <option value="LOST">LOST</option>
                        </select>
                      </td>
                      <td>
                        <div className="table-action-group" style={{ justifyContent: 'flex-end' }}>
                          {isConverted ? (
                            <span style={{ color: 'var(--guvi-green)', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={13} />
                              Enrolled
                            </span>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => onSelectLeadForLink(lead, course)}
                            >
                              <CreditCard size={12} />
                              <span>Generate DP Link</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer-bar">
          <span>Showing {filteredLeads.length} of {leads.length} student leads</span>
          <span>Tip: Filter by "Converted" to see all enrolled students in one place</span>
        </div>
      </div>
    </div>
  );
}
