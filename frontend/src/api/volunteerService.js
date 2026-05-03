import api from './axios';

/**
 * Service for Volunteer Management & Certification
 */

// ── Student Actions ──────────────────────────────────────────────────────────

export const applyToVolunteer = async (volunteerData) => {
  const { data } = await api.post('/api/volunteers/apply', volunteerData);
  return data;
};

export const getMyApplications = async () => {
  const { data } = await api.get('/api/volunteers/my/applications');
  return data;
};

export const getMyTasks = async () => {
  const { data } = await api.get('/api/volunteers/my/tasks');
  return data;
};

export const getMyPoints = async () => {
  const { data } = await api.get('/api/volunteers/my/points');
  return data;
};

export const getMyCertificates = async () => {
  const { data } = await api.get('/api/volunteers/my/certificates');
  return data;
};

export const completeTask = async (taskId) => {
  const { data } = await api.put(`/api/volunteers/tasks/${taskId}/complete`);
  return data;
};

export const requestCertificate = async (eventId) => {
  const { data } = await api.post(`/api/volunteers/events/${eventId}/request-certificate`);
  return data;
};

/**
 * Triggers a browser download of the approved certificate PDF.
 * Uses a direct window.open so the PDF streams correctly.
 */
export const downloadCertificatePdf = (certificateId) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  // Fetch as blob and trigger download
  return api.get(`/api/volunteers/certificates/${certificateId}/download`, {
    responseType: 'blob',
  }).then((res) => {
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `volunteer-certificate-${certificateId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  });
};

// ── Club Admin Actions ────────────────────────────────────────────────────────

export const getEventApplications = async (eventId) => {
  const { data } = await api.get(`/api/volunteers/event/${eventId}/applications`);
  return data;
};

export const updateApplicationStatus = async (id, status) => {
  const { data } = await api.put(`/api/volunteers/applications/${id}/status`, null, { params: { status } });
  return data;
};

export const assignTask = async (applicationId, description) => {
  const { data } = await api.post(`/api/volunteers/applications/${applicationId}/tasks`, description, {
    headers: { 'Content-Type': 'text/plain' }
  });
  return data;
};

export const awardPoints = async (taskId, points, rating) => {
  const { data } = await api.post(`/api/volunteers/tasks/${taskId}/award-points`, { points, rating });
  return data;
};

export const approveCertificate = async (id) => {
  const { data } = await api.put(`/api/volunteers/certificates/${id}/approve`);
  return data;
};

/** Club Admin: get all tasks for an event to review completed tasks and award points */
export const getEventTasks = async (eventId) => {
  const { data } = await api.get(`/api/volunteers/event/${eventId}/tasks`);
  return data;
};

/** Club Admin: get all certificate requests for an event */
export const getEventCertificateRequests = async (eventId) => {
  const { data } = await api.get(`/api/volunteers/event/${eventId}/certificate-requests`);
  return data;
};

// ── Shared/Public ────────────────────────────────────────────────────────────

export const getLeaderboard = async (eventId) => {
  const { data } = await api.get(`/api/volunteers/events/${eventId}/leaderboard`);
  return data;
};
