import api from './axios';

export const shopApi = {
  // Student
  getProducts: (category, clubId, eventTag) => api.get('/api/shop/products', { params: { category, clubId, eventTag } }),
  getProduct: (id) => api.get(`/api/shop/products/${id}`),
  placeOrder: (orderData) => api.post('/api/shop/orders', orderData),
  getMyOrders: () => api.get('/api/shop/my-orders'),

  // Admin
  createProduct: (productData) => api.post('/api/shop/admin/products', productData),
  getClubOrders: (clubId) => api.get(`/api/shop/admin/orders/${clubId}`),
  updateOrderStatus: (orderId, status) => 
    api.patch(`/api/shop/admin/orders/${orderId}/status`, null, { params: { status } }),
};

export default shopApi;
