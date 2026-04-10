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
  // Assuming a generic GET /api/volunteers/my/applications might be useful, 
  // but let's stick to the controller endpoints we defined.
  // Actually, we need to add specific "my" endpoints to the backend or use existing ones.
  // The user requested: GET /api/volunteer/applications/my
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

// ── Admin Actions ────────────────────────────────────────────────────────────

export const getEventApplications = async (eventId) => {
  const { data } = await api.get(`/api/volunteers/event/${eventId}/applications`);
  return data;
};

export const updateApplicationStatus = async (id, status) => {
  const { data } = await api.put(`/api/volunteers/applications/${id}/status`, null, { params: { status } });
  return data;
};

export const assignTask = async (applicationId, description) => {
  // Note: The backend controller takes a raw @RequestBody String description
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

// ── Shared/Public ────────────────────────────────────────────────────────────

export const getLeaderboard = async (eventId) => {
  const { data } = await api.get(`/api/volunteers/events/${eventId}/leaderboard`);
  return data;
};
