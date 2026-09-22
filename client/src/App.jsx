import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import {
  fetchBDUsers,
  fetchCourses,
  fetchLeads,
  createLead,
  fetchPaymentLinks,
  createPaymentLink,
  cancelPaymentLink,
  fetchOverdueReminders,
  logFollowUpNote,
  triggerOverdueEvaluation,
  simulatePaymentWebhook,
  sendPaymentReminderEmail,
  updatePaymentLinkStatus,
  updateLeadStatus
} from './api';

import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import ExecutiveOverview from './components/ExecutiveOverview';
import OverdueQueue from './components/OverdueQueue';
import PaymentLinksTable from './components/PaymentLinksTable';
import LeadsTable from './components/LeadsTable';
import DataExplorer from './components/DataExplorer';
import SimulatorView from './components/SimulatorView';
import FollowUpModal from './components/FollowUpModal';
import GenerateLinkModal from './components/GenerateLinkModal';
import AddLeadModal from './components/AddLeadModal';
import ToastContainer from './components/ToastContainer';
import SendEmailModal from './components/SendEmailModal';
import LinkDetailsModal from './components/LinkDetailsModal';

export default function App() {
  // Navigation & Sidebar State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'overdue' | 'links' | 'leads' | 'explorer' | 'simulator'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [bds, setBds] = useState([]);
  const [selectedBdId, setSelectedBdId] = useState('');
  const [courses, setCourses] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Operational Data
  const [overdueReminders, setOverdueReminders] = useState([]);
  const [paymentLinks, setPaymentLinks] = useState([]);
  const [leads, setLeads] = useState([]);

  // Modals & Forms
  const [showGenerateLinkModal, setShowGenerateLinkModal] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [activeFollowUpReminder, setActiveFollowUpReminder] = useState(null);

  // Email & Details Modals
  const [emailModalData, setEmailModalData] = useState({ isOpen: false, link: null, defaultEmail: '' });
  const [detailsModalData, setDetailsModalData] = useState({ isOpen: false, link: null });
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Modern Floating Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', title = '') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const resolvedTitle =
      title ||
      (type === 'success'
        ? 'Success'
        : type === 'danger' || type === 'error'
        ? 'Action Failed'
        : type === 'warning'
        ? 'Attention'
        : 'Notification');
    setToasts((prev) => [...prev, { id, message, type, title: resolvedTitle }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [newLinkForm, setNewLinkForm] = useState({
    lead_id: '',
    course_id: '',
    amount: 2000,
    payment_type: 'TOKEN',
    expiry_hours: 24
  });

  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    course_id: ''
  });

  const [followUpComment, setFollowUpComment] = useState('');

  // 1. Initial Load: BDs and Course Catalog
  useEffect(() => {
    const init = async () => {
      const [bdList, courseList] = await Promise.all([
        fetchBDUsers(),
        fetchCourses()
      ]);
      setBds(bdList);
      setCourses(courseList);
      if (bdList && bdList.length > 0) {
        setSelectedBdId(bdList[0].id);
      }
    };
    init();
  }, []);

  // 2. Load Active BD's Pipeline Data
  const loadDashboardData = useCallback(async () => {
    if (!selectedBdId) return;
    try {
      const [remindersData, linksData, leadsData] = await Promise.all([
        fetchOverdueReminders(selectedBdId),
        fetchPaymentLinks(selectedBdId),
        fetchLeads(selectedBdId)
      ]);
      setOverdueReminders(remindersData);
      setPaymentLinks(linksData);
      setLeads(leadsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }, [selectedBdId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Combined dataset for live Data Explorer tab
  const explorerData = useMemo(() => ({
    payment_links: paymentLinks,
    reminders: overdueReminders,
    leads: leads,
    users: bds,
    courses: courses
  }), [paymentLinks, overdueReminders, leads, bds, courses]);

  // Handlers
  const handleSimulatePayment = async (linkId) => {
    try {
      const res = await simulatePaymentWebhook(linkId);
      addToast(res.message || 'Payment successfully processed! Lead Converted.', 'success', 'Payment Converted');
      loadDashboardData();
      if (activeFollowUpReminder && activeFollowUpReminder.payment_link_id === linkId) {
        setActiveFollowUpReminder(null);
      }
    } catch (err) {
      addToast('Error simulating payment', 'danger');
    }
  };

  const handleDynamicPaymentStatusChange = async (linkId, newStatus) => {
    try {
      await updatePaymentLinkStatus(linkId, newStatus);
      addToast(`Link status dynamically updated to ${newStatus}`, 'success', 'Status Updated');
      loadDashboardData();
    } catch (err) {
      addToast('Error updating link status', 'danger');
    }
  };

  const handleDynamicLeadStatusChange = async (leadId, newStatus) => {
    try {
      await updateLeadStatus(leadId, newStatus);
      addToast(`Lead status dynamically updated to ${newStatus}`, 'success', 'Lead Updated');
      loadDashboardData();
    } catch (err) {
      addToast('Error updating lead status', 'danger');
    }
  };

  const handleCancelLink = async (linkId) => {
    try {
      await cancelPaymentLink(linkId);
      addToast('Payment link cancelled successfully', 'info', 'Link Cancelled');
      loadDashboardData();
    } catch (err) {
      addToast('Error cancelling link', 'danger');
    }
  };

  // Open email modal for given link
  const handleOpenEmailModal = (link) => {
    const leadObj = leads.find((l) => l.id === (link.lead_id || link.id));
    setEmailModalData({
      isOpen: true,
      link: link,
      defaultEmail: leadObj?.email || link.lead_email || ''
    });
  };

  // Execute email sending from modal
  const handleSendEmailReminder = async (linkId, recipientEmail, reminderType = 'PROACTIVE') => {
    setIsSendingEmail(true);
    try {
      addToast(`Dispatching reminder email to ${recipientEmail} via Gmail SMTP...`, 'info', 'Sending Email');
      const res = await sendPaymentReminderEmail({
        paymentLinkId: linkId,
        toEmail: recipientEmail,
        reminderType: reminderType
      });
      addToast(res.message || `Reminder email delivered to ${recipientEmail}!`, 'success', 'Email Sent');
      setEmailModalData({ isOpen: false, link: null, defaultEmail: '' });
      loadDashboardData();
    } catch (err) {
      addToast('Failed to deliver reminder email. Check backend logs.', 'danger', 'Delivery Failed');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleOpenLinkDetails = (link) => {
    setDetailsModalData({
      isOpen: true,
      link: link
    });
  };

  const handleAddFollowUpNote = async (e) => {
    e.preventDefault();
    if (!followUpComment.trim() || !activeFollowUpReminder) return;
    try {
      await logFollowUpNote(activeFollowUpReminder.id, selectedBdId, followUpComment);
      addToast('Follow-up note logged in audit timeline', 'success', 'Note Saved');
      setFollowUpComment('');
      const updatedList = await fetchOverdueReminders(selectedBdId);
      setOverdueReminders(updatedList);
      const current = updatedList.find((r) => r.id === activeFollowUpReminder.id);
      setActiveFollowUpReminder(current || null);
    } catch (err) {
      addToast('Error saving note', 'danger');
    }
  };

  const handleCreateLinkSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPaymentLink({
        ...newLinkForm,
        bd_id: selectedBdId,
        amount: parseFloat(newLinkForm.amount),
        expiry_hours: parseFloat(newLinkForm.expiry_hours)
      });
      addToast('Payment link generated and assigned to candidate!', 'success', 'Link Generated');
      setShowGenerateLinkModal(false);
      loadDashboardData();
    } catch (err) {
      addToast('Error generating link', 'danger');
    }
  };

  const handleAddLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      await createLead({
        ...newLeadForm,
        assigned_bd_id: selectedBdId
      });
      addToast(`Lead ${newLeadForm.name} registered successfully!`, 'success', 'Lead Added');
      setShowAddLeadModal(false);
      setNewLeadForm({ name: '', phone: '', email: '', course_id: '' });
      loadDashboardData();
    } catch (err) {
      addToast('Error adding lead', 'danger');
    }
  };

  const handleRunSLAEvaluation = async () => {
    try {
      await triggerOverdueEvaluation();
      addToast(`SLA engine executed. Overdue status evaluated.`, 'info', 'SLA Check Complete');
      loadDashboardData();
    } catch (err) {
      addToast('Error executing SLA evaluation', 'danger');
    }
  };

  const formatOverdueTime = (seconds) => {
    if (!seconds || seconds <= 0) return 'Overdue';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m overdue`;
    return `${minutes}m overdue`;
  };

  const currentBd = bds.find((b) => b.id === selectedBdId) || bds[0] || {};
  const overdueCount = overdueReminders.length;
  const pendingCount = paymentLinks.filter((l) => l.status === 'PENDING').length;

  return (
    <div className="app-layout">
      {/* 1. Collapsible & Expandable Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentBd={currentBd}
        overdueCount={overdueCount}
        pendingCount={pendingCount}
        linksCount={paymentLinks.length}
        leadsCount={leads.length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* 2. Main Content Area */}
      <div className="app-main">
        {/* Top Header */}
        <TopHeader
          bds={bds}
          selectedBdId={selectedBdId}
          onSelectBd={setSelectedBdId}
          onOpenGenerateModal={() => {
            if (courses.length > 0 && leads.length > 0) {
              setNewLinkForm({
                lead_id: leads[0]?.id || '',
                course_id: courses[0]?.id || '',
                amount: courses[0]?.default_token_amount || 2000,
                payment_type: 'TOKEN',
                expiry_hours: 24
              });
            }
            setShowGenerateLinkModal(true);
          }}
          onRunSLAEvaluation={handleRunSLAEvaluation}
          onRefresh={() => {
            loadDashboardData();
            addToast('Dashboard data refreshed', 'info');
          }}
        />

        {/* Floating Toast Notification Container */}
        <ToastContainer toasts={toasts} onCloseToast={removeToast} />

        {/* Tab Content Router */}
        <div className="content-wrapper">
          {activeTab === 'overview' && (
            <ExecutiveOverview
              currentBd={currentBd}
              bds={bds}
              overdueReminders={overdueReminders}
              paymentLinks={paymentLinks}
              leads={leads}
              onOpenFollowUp={(rem) => setActiveFollowUpReminder(rem)}
              onSimulatePayment={handleSimulatePayment}
              onCancelLink={handleCancelLink}
              onOpenGenerateModal={() => {
                if (courses.length > 0 && leads.length > 0) {
                  setNewLinkForm({
                    lead_id: leads[0]?.id || '',
                    course_id: courses[0]?.id || '',
                    amount: courses[0]?.default_token_amount || 2000,
                    payment_type: 'TOKEN',
                    expiry_hours: 24
                  });
                }
                setShowGenerateLinkModal(true);
              }}
              onOpenEmailModal={handleOpenEmailModal}
              onOpenLinkDetails={handleOpenLinkDetails}
              onExportCsv={(records, msg) => addToast(msg || 'CSV Export generated and downloaded', 'success', 'Export Complete')}
              onSelectBd={setSelectedBdId}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'overdue' && (
            <OverdueQueue
              reminders={overdueReminders}
              bdName={currentBd.name}
              onOpenFollowUp={(rem) => setActiveFollowUpReminder(rem)}
              onSimulatePayment={handleSimulatePayment}
              onCancelLink={handleCancelLink}
              onSendEmailReminder={(linkId, email, type) => handleOpenEmailModal({ id: linkId, status: 'OVERDUE' })}
              formatOverdueTime={formatOverdueTime}
            />
          )}

          {activeTab === 'links' && (
            <PaymentLinksTable
              links={paymentLinks}
              statusFilter={statusFilter}
              onChangeStatusFilter={setStatusFilter}
              onSimulatePayment={handleSimulatePayment}
              onCancelLink={handleCancelLink}
              onChangeStatus={handleDynamicPaymentStatusChange}
              onSendEmailReminder={(linkId, email, type) => handleOpenEmailModal({ id: linkId, status: type })}
              onOpenGenerateModal={() => {
                if (courses.length > 0 && leads.length > 0) {
                  setNewLinkForm({
                    lead_id: leads[0]?.id || '',
                    course_id: courses[0]?.id || '',
                    amount: courses[0]?.default_token_amount || 2000,
                    payment_type: 'TOKEN',
                    expiry_hours: 24
                  });
                }
                setShowGenerateLinkModal(true);
              }}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsTable
              leads={leads}
              courses={courses}
              onChangeLeadStatus={handleDynamicLeadStatusChange}
              onOpenAddLeadModal={() => {
                if (courses.length > 0) setNewLeadForm((f) => ({ ...f, course_id: courses[0].id }));
                setShowAddLeadModal(true);
              }}
              onSelectLeadForLink={(lead, course) => {
                setNewLinkForm({
                  lead_id: lead.id,
                  course_id: lead.course_id,
                  amount: course?.default_token_amount || 2000,
                  payment_type: 'TOKEN',
                  expiry_hours: 24
                });
                setShowGenerateLinkModal(true);
              }}
            />
          )}

          {activeTab === 'explorer' && (
            <DataExplorer customData={explorerData} />
          )}

          {activeTab === 'simulator' && (
            <SimulatorView
              paymentLinks={paymentLinks}
              onSimulatePayment={handleSimulatePayment}
              onRunSLAEvaluation={handleRunSLAEvaluation}
            />
          )}
        </div>
      </div>

      {/* 3. Interactive Modals */}
      <SendEmailModal
        isOpen={emailModalData.isOpen}
        onClose={() => setEmailModalData({ isOpen: false, link: null, defaultEmail: '' })}
        link={emailModalData.link}
        defaultEmail={emailModalData.defaultEmail}
        onSendEmail={handleSendEmailReminder}
        isSending={isSendingEmail}
      />

      <LinkDetailsModal
        isOpen={detailsModalData.isOpen}
        onClose={() => setDetailsModalData({ isOpen: false, link: null })}
        link={detailsModalData.link}
        onCopyUrl={(msg) => addToast(msg, 'success', 'Copied')}
        onOpenEmailModal={(link) => handleOpenEmailModal(link)}
        onOpenFollowUp={(rem) => setActiveFollowUpReminder(rem)}
        onSimulatePayment={handleSimulatePayment}
        onCancelLink={handleCancelLink}
        onChangeStatus={handleDynamicPaymentStatusChange}
      />

      <FollowUpModal
        reminder={activeFollowUpReminder}
        onClose={() => setActiveFollowUpReminder(null)}
        onAddNote={handleAddFollowUpNote}
        followUpComment={followUpComment}
        onChangeComment={setFollowUpComment}
        onSimulatePayment={handleSimulatePayment}
        formatOverdueTime={formatOverdueTime}
      />

      <GenerateLinkModal
        isOpen={showGenerateLinkModal}
        onClose={() => setShowGenerateLinkModal(false)}
        onSubmit={handleCreateLinkSubmit}
        formState={newLinkForm}
        onChangeForm={setNewLinkForm}
        leads={leads}
        courses={courses}
      />

      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onSubmit={handleAddLeadSubmit}
        formState={newLeadForm}
        onChangeForm={setNewLeadForm}
        courses={courses}
      />
    </div>
  );
}
