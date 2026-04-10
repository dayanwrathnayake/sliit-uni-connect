import api from './axios';

// ── User management ───────────────────────────────────────────────────────────

export const getUsers = ({ page = 0, size = 20, search = '', faculty = '', role = '' } = {}) => {
  const params = { page, size };
  if (search)  params.search  = search;
  if (faculty) params.faculty = faculty;
  if (role)    params.role    = role;
  return api.get('/api/admin/users', { params });
};

export const getUser = (userId) =>
  api.get(`/api/admin/users/${userId}`);

export const deactivateUser = (userId) =>
  api.patch(`/api/admin/users/${userId}/deactivate`);

export const activateUser = (userId) =>
  api.patch(`/api/admin/users/${userId}/activate`);

export const verifyUserEmail = (userId) =>
  api.patch(`/api/admin/users/${userId}/verify-email`);

export const getUserStats = () =>
  api.get('/api/admin/users/stats');

// ── Faculty Manager management ────────────────────────────────────────────────

export const getFacultyManagers = () =>
  api.get('/api/staff/faculty-managers');

export const createFacultyManager = ({ displayName, email, password, faculty }) =>
  api.post('/api/staff/register', { displayName, email, password, faculty });

export const deactivateFacultyManager = (staffId) =>
  api.delete(`/api/staff/${staffId}`);

// ── Shop Management ───────────────────────────────────────────────────────────

export const getAdminProducts = (clubId) =>
  api.get('/api/admin/shop/products', { params: { clubId } });

export const createAdminProduct = (productData) =>
  api.post('/api/admin/shop/products', productData);

export const updateAdminProduct = (productId, productData) =>
  api.put(`/api/admin/shop/products/${productId}`, productData);

export const deleteAdminProduct = (productId) =>
  api.delete(`/api/admin/shop/products/${productId}`);

export const getAdminOrders = (clubId) =>
  api.get('/api/admin/shop/orders', { params: { clubId } });

export const updateAdminOrderStatus = (orderId, status) =>
  api.patch(`/api/admin/shop/orders/${orderId}/status`, null, { params: { status } });

export const getShopStats = (clubId) =>
  api.get('/api/admin/shop/stats', { params: { clubId } });

