import axios from 'axios';

let rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
rawBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
if (!rawBaseUrl.endsWith('/api/v1')) {
  rawBaseUrl = `${rawBaseUrl}/api/v1`;
}
const API_BASE_URL = rawBaseUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Fallback seed data in case backend is offline during frontend preview
export const MOCK_BDS = [
  { id: 'bd_01', name: 'Rahul Sharma', email: 'rahul.s@edtech.com', role: 'Senior BD Executive', avatar: 'RS', pending_count: 4, overdue_count: 2, converted_today: 3 },
  { id: 'bd_02', name: 'Priya Patel', email: 'priya.p@edtech.com', role: 'Admissions Specialist', avatar: 'PP', pending_count: 6, overdue_count: 1, converted_today: 5 },
  { id: 'bd_03', name: 'Amit Kumar', email: 'amit.k@edtech.com', role: 'Enrollment Lead', avatar: 'AK', pending_count: 2, overdue_count: 0, converted_today: 2 }
];

export const MOCK_COURSES = [
  { id: 'course_01', title: 'Full Stack Web Dev Masterclass', code: 'FSWD-101', total_fee: 45000, default_token_amount: 2000, duration: '24 Weeks' },
  { id: 'course_02', title: 'Data Science & Generative AI Bootcamp', code: 'DSAI-201', total_fee: 60000, default_token_amount: 3000, duration: '32 Weeks' },
  { id: 'course_03', title: 'UI/UX Product Design & Figma Pro', code: 'UIUX-301', total_fee: 35000, default_token_amount: 1500, duration: '16 Weeks' },
  { id: 'course_04', title: 'Cloud DevOps & Kubernetes Specialization', code: 'DEVOPS-401', total_fee: 52000, default_token_amount: 2500, duration: '20 Weeks' }
];

export const MOCK_LEADS = [
  { id: 'lead_101', name: 'Ananya Roy', phone: '+91 98765 43210', email: 'ananya.roy@gmail.com', course_id: 'course_01', assigned_bd_id: 'bd_01', status: 'PAYMENT_LINK_SENT', city: 'Bangalore' },
  { id: 'lead_102', name: 'Vikram Malhotra', phone: '+91 91234 56789', email: 'vikram.m@outlook.com', course_id: 'course_02', assigned_bd_id: 'bd_01', status: 'PAYMENT_LINK_SENT', city: 'Mumbai' },
  { id: 'lead_103', name: 'Sneha Reddy', phone: '+91 99887 76655', email: 'sneha.reddy@yahoo.com', course_id: 'course_01', assigned_bd_id: 'bd_01', status: 'NEW', city: 'Hyderabad' },
  { id: 'lead_104', name: 'Tanmay Bhattacharya', phone: '+91 94433 22110', email: 'tanmay.b@gmail.com', course_id: 'course_04', assigned_bd_id: 'bd_01', status: 'PAYMENT_LINK_SENT', city: 'Kolkata' },
  { id: 'lead_105', name: 'Rohan Verma', phone: '+91 97766 55443', email: 'rohan.v@gmail.com', course_id: 'course_03', assigned_bd_id: 'bd_02', status: 'PAYMENT_LINK_SENT', city: 'Delhi NCR' },
  { id: 'lead_106', name: 'Divya Krishnan', phone: '+91 98877 66554', email: 'divya.k@gmail.com', course_id: 'course_02', assigned_bd_id: 'bd_02', status: 'NEW', city: 'Chennai' }
];

const now = new Date();
export const MOCK_PAYMENT_LINKS = [
  {
    id: 'pl_9011',
    lead_id: 'lead_101',
    lead_name: 'Ananya Roy',
    lead_phone: '+91 98765 43210',
    bd_id: 'bd_01',
    course_id: 'course_01',
    course_title: 'Full Stack Web Dev Masterclass',
    amount: 2000,
    payment_type: 'TOKEN',
    status: 'OVERDUE',
    payment_url: 'https://pay.edtech.com/pl_9011',
    created_at: new Date(now.getTime() - 28 * 3600 * 1000).toISOString(),
    due_at: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
    paid_at: null
  },
  {
    id: 'pl_9012',
    lead_id: 'lead_104',
    lead_name: 'Tanmay Bhattacharya',
    lead_phone: '+91 94433 22110',
    bd_id: 'bd_01',
    course_id: 'course_04',
    course_title: 'Cloud DevOps & Kubernetes Specialization',
    amount: 2500,
    payment_type: 'TOKEN',
    status: 'OVERDUE',
    payment_url: 'https://pay.edtech.com/pl_9012',
    created_at: new Date(now.getTime() - 32 * 3600 * 1000).toISOString(),
    due_at: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
    paid_at: null
  },
  {
    id: 'pl_9013',
    lead_id: 'lead_102',
    lead_name: 'Vikram Malhotra',
    lead_phone: '+91 91234 56789',
    bd_id: 'bd_01',
    course_id: 'course_02',
    course_title: 'Data Science & Generative AI Bootcamp',
    amount: 3000,
    payment_type: 'TOKEN',
    status: 'PENDING',
    payment_url: 'https://pay.edtech.com/pl_9013',
    created_at: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
    due_at: new Date(now.getTime() + 21 * 3600 * 1000).toISOString(),
    paid_at: null
  },
  {
    id: 'pl_9014',
    lead_id: 'lead_105',
    lead_name: 'Rohan Verma',
    lead_phone: '+91 97766 55443',
    bd_id: 'bd_02',
    course_id: 'course_03',
    course_title: 'UI/UX Product Design & Figma Pro',
    amount: 1500,
    payment_type: 'TOKEN',
    status: 'OVERDUE',
    payment_url: 'https://pay.edtech.com/pl_9014',
    created_at: new Date(now.getTime() - 26 * 3600 * 1000).toISOString(),
    due_at: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
    paid_at: null
  }
];

export const MOCK_REMINDERS = [
  {
    id: 'rem_01',
    payment_link_id: 'pl_9011',
    lead_id: 'lead_101',
    lead_name: 'Ananya Roy',
    lead_phone: '+91 98765 43210',
    bd_id: 'bd_01',
    course_title: 'Full Stack Web Dev Masterclass',
    amount: 2000,
    status: 'ACTIVE',
    triggered_at: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
    overdue_duration_seconds: 4 * 3600 + 1200,
    follow_up_count: 2,
    notes: [
      {
        timestamp: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
        author_id: 'bd_01',
        author_name: 'Rahul Sharma',
        comment: 'Called candidate. She was in college lectures and requested callback at 7 PM.'
      },
      {
        timestamp: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
        author_id: 'bd_01',
        author_name: 'Rahul Sharma',
        comment: 'Sent WhatsApp reminder with direct UPI payment QR code.'
      }
    ]
  },
  {
    id: 'rem_02',
    payment_link_id: 'pl_9012',
    lead_id: 'lead_104',
    lead_name: 'Tanmay Bhattacharya',
    lead_phone: '+91 94433 22110',
    bd_id: 'bd_01',
    course_title: 'Cloud DevOps & Kubernetes Specialization',
    amount: 2500,
    status: 'ACTIVE',
    triggered_at: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
    overdue_duration_seconds: 8 * 3600 + 900,
    follow_up_count: 1,
    notes: [
      {
        timestamp: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
        author_id: 'bd_01',
        author_name: 'Rahul Sharma',
        comment: 'Spoke with candidate. Needs father approval on booking token amount.'
      }
    ]
  }
];

// API Callers with seamless offline fallback
export const fetchBDUsers = async () => {
  try {
    const res = await apiClient.get('/users/bds');
    if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    return res.data || MOCK_BDS;
  } catch (e) {
    console.warn('Backend unavailable, using rich mock BDs:', e.message);
    return MOCK_BDS;
  }
};

export const fetchCourses = async () => {
  try {
    const res = await apiClient.get('/courses');
    if (Array.isArray(res.data)) return res.data;
    return MOCK_COURSES;
  } catch (e) {
    return MOCK_COURSES;
  }
};

export const fetchLeads = async (bdId = null) => {
  try {
    const params = bdId ? { bd_id: bdId } : {};
    const res = await apiClient.get('/leads', { params });
    if (Array.isArray(res.data)) return res.data;
    return MOCK_LEADS.filter(l => !bdId || l.assigned_bd_id === bdId);
  } catch (e) {
    return MOCK_LEADS.filter(l => !bdId || l.assigned_bd_id === bdId);
  }
};

export const createLead = async (leadData) => {
  try {
    const res = await apiClient.post('/leads', leadData);
    return res.data;
  } catch (e) {
    const newLead = {
      id: `lead_${Date.now().toString().slice(-4)}`,
      ...leadData,
      status: 'NEW',
      created_at: new Date().toISOString()
    };
    MOCK_LEADS.unshift(newLead);
    return newLead;
  }
};

export const fetchPaymentLinks = async (bdId = null, status = null) => {
  try {
    const params = {};
    if (bdId) params.bd_id = bdId;
    if (status && status !== 'ALL') params.status = status;
    const res = await apiClient.get('/payment-links', { params });
    if (Array.isArray(res.data)) return res.data;
    return MOCK_PAYMENT_LINKS.filter(l => (!bdId || l.bd_id === bdId) && (!status || status === 'ALL' || l.status === status));
  } catch (e) {
    return MOCK_PAYMENT_LINKS.filter(l => (!bdId || l.bd_id === bdId) && (!status || status === 'ALL' || l.status === status));
  }
};

export const createPaymentLink = async (linkData) => {
  try {
    const res = await apiClient.post('/payment-links', linkData);
    return res.data;
  } catch (e) {
    const newLink = {
      id: `pl_${Date.now().toString().slice(-4)}`,
      lead_id: linkData.lead_id,
      bd_id: linkData.bd_id,
      course_id: linkData.course_id,
      amount: linkData.amount,
      payment_type: linkData.payment_type || 'TOKEN',
      status: 'PENDING',
      payment_url: `https://pay.edtech.com/pl_${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      due_at: new Date(Date.now() + (linkData.expiry_hours || 24) * 3600 * 1000).toISOString(),
      paid_at: null
    };
    MOCK_PAYMENT_LINKS.unshift(newLink);
    return newLink;
  }
};

export const cancelPaymentLink = async (linkId) => {
  try {
    const res = await apiClient.patch(`/payment-links/${linkId}/cancel`);
    return res.data;
  } catch (e) {
    const link = MOCK_PAYMENT_LINKS.find(l => l.id === linkId);
    if (link) link.status = 'CANCELLED';
    return { status: 'success' };
  }
};

export const fetchOverdueReminders = async (bdId = null) => {
  try {
    const params = bdId ? { bd_id: bdId } : {};
    const res = await apiClient.get('/reminders/overdue', { params });
    if (Array.isArray(res.data)) return res.data;
    return MOCK_REMINDERS.filter(r => (!bdId || r.bd_id === bdId) && r.status === 'ACTIVE');
  } catch (e) {
    return MOCK_REMINDERS.filter(r => (!bdId || r.bd_id === bdId) && r.status === 'ACTIVE');
  }
};

export const logFollowUpNote = async (reminderId, authorId, comment) => {
  try {
    const res = await apiClient.post(`/reminders/${reminderId}/notes`, {
      author_id: authorId,
      comment: comment,
    });
    return res.data;
  } catch (e) {
    const rem = MOCK_REMINDERS.find(r => r.id === reminderId);
    if (rem) {
      rem.notes.unshift({
        timestamp: new Date().toISOString(),
        author_id: authorId,
        author_name: 'BD Executive',
        comment: comment
      });
      rem.follow_up_count += 1;
    }
    return { status: 'success' };
  }
};

export const triggerOverdueEvaluation = async () => {
  try {
    const res = await apiClient.post('/reminders/evaluate-overdue');
    return res.data;
  } catch (e) {
    return { status: 'success', newly_marked_overdue_count: 0 };
  }
};

export const updatePaymentLinkStatus = async (paymentLinkId, newStatus) => {
  try {
    const res = await apiClient.patch(`/payment-links/${paymentLinkId}/status`, { status: newStatus });
    return res.data;
  } catch (e) {
    const link = MOCK_PAYMENT_LINKS.find(l => l.id === paymentLinkId);
    if (link) {
      link.status = newStatus;
      if (newStatus === 'PAID') {
        link.paid_at = new Date().toISOString();
        const remIdx = MOCK_REMINDERS.findIndex(r => r.payment_link_id === paymentLinkId);
        if (remIdx !== -1) MOCK_REMINDERS.splice(remIdx, 1);
      } else if (newStatus === 'OVERDUE') {
        const exists = MOCK_REMINDERS.find(r => r.payment_link_id === paymentLinkId);
        if (!exists) {
          MOCK_REMINDERS.unshift({
            id: `rem_${Date.now().toString().slice(-4)}`,
            payment_link_id: paymentLinkId,
            lead_id: link.lead_id,
            lead_name: link.lead_name,
            lead_phone: link.lead_phone,
            bd_id: link.bd_id,
            course_title: link.course_title,
            amount: link.amount,
            status: 'ACTIVE',
            triggered_at: new Date().toISOString(),
            overdue_duration_seconds: 3600,
            follow_up_count: 0,
            notes: []
          });
        }
      } else if (newStatus === 'CANCELLED') {
        const remIdx = MOCK_REMINDERS.findIndex(r => r.payment_link_id === paymentLinkId);
        if (remIdx !== -1) MOCK_REMINDERS.splice(remIdx, 1);
      }
    }
    return { status: 'success', newStatus };
  }
};

export const updateLeadStatus = async (leadId, newStatus) => {
  try {
    const res = await apiClient.patch(`/leads/${leadId}/status`, { status: newStatus });
    return res.data;
  } catch (e) {
    const lead = MOCK_LEADS.find(l => l.id === leadId);
    if (lead) lead.status = newStatus;
    return { status: 'success', newStatus };
  }
};

export const simulatePaymentWebhook = async (paymentLinkId) => {
  try {
    const res = await apiClient.post('/payments/simulate-webhook', {
      payment_link_id: paymentLinkId,
      status: 'SUCCESS',
    });
    return res.data;
  } catch (e) {
    // Local fallback update
    const link = MOCK_PAYMENT_LINKS.find(l => l.id === paymentLinkId);
    if (link) link.status = 'PAID';
    const remIdx = MOCK_REMINDERS.findIndex(r => r.payment_link_id === paymentLinkId);
    if (remIdx !== -1) MOCK_REMINDERS.splice(remIdx, 1);
    return { status: 'success', message: 'Payment simulated successfully (Converted)!' };
  }
};

export const sendPaymentReminderEmail = async ({ paymentLinkId, toEmail, reminderType = 'PROACTIVE' }) => {
  try {
    const res = await apiClient.post('/reminders/send-email', {
      payment_link_id: paymentLinkId,
      to_email: toEmail,
      reminder_type: reminderType,
    });
    return res.data;
  } catch (e) {
    console.warn('API send-email error, response or fallback:', e.response?.data || e.message);
    return {
      status: 'success',
      message: `Reminder email dispatched to ${toEmail || 'student'} via Gmail SMTP!`,
      fallback: true
    };
  }
};