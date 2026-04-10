import api from './axios';

export const createEvent = async (eventData) => {
  const { data } = await api.post('/api/events', eventData);
  return data;
};

export const submitForApproval = async (eventId) => {
  const { data } = await api.post(`/api/events/${eventId}/submit`);
  return data;
};

export const approveByDept = async (eventId, comments) => {
  const { data } = await api.put(`/api/events/${eventId}/approve/department`, { comments });
  return data;
};

export const approveByFaculty = async (eventId, comments) => {
  const { data } = await api.put(`/api/events/${eventId}/approve/faculty`, { comments });
  return data;
};

export const registerForEvent = async (eventId) => {
  const { data } = await api.post(`/api/events/${eventId}/register`);
  return data;
};

export const unregisterFromEvent = async (eventId) => {
  const { data } = await api.delete(`/api/events/${eventId}/register`);
  return data;
};

export const getCalendarEvents = async (year, month, filters = {}) => {
  const params = { year, month, ...filters };
  const { data } = await api.get('/api/events/calendar', { params });
  return data;
};

export const getMyEvents = async () => {
  const { data } = await api.get('/api/events/my-registrations');
  return data;
};

export const getManagedEvents = async () => {
  const { data } = await api.get('/api/events/managed');
  return data;
};

export const getEventById = async (id) => {
  const { data } = await api.get(`/api/events/${id}`);
  return data;
};

export const getPendingDeptEvents = async () => {
  const { data } = await api.get('/api/events/pending/department');
  return data;
};

export const getPendingFacultyEvents = async () => {
  const { data } = await api.get('/api/events/pending/faculty');
  return data;
};

export const getUpcomingEvents = async (limit = 5) => {
  const { data } = await api.get('/api/events/upcoming', { params: { limit } });
  return data;
};
