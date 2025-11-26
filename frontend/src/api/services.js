import api from './axios';

// Auth Services
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  register: async (username, password, fullName) => {
    const response = await api.post('/auth/register', { username, password, fullName });
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Menu Services
export const menuService = {
  getTodayMenu: async () => {
    const response = await api.get('/menu/today');
    return response.data;
  },
  
  getMenuByDate: async (date) => {
    const response = await api.get('/menu/by-date', { params: { date } });
    return response.data;
  },
  
  createMenuItem: async (menuItemData) => {
    const response = await api.post('/menu', menuItemData);
    return response.data;
  },
  
  createMenuItems: async (items, date) => {
    const response = await api.post('/menu/bulk', { items, date });
    return response.data;
  },
  
  updateMenuItem: async (id, updates) => {
    const response = await api.put(`/menu/${id}`, updates);
    return response.data;
  },
  
  deleteMenuItem: async (id) => {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  },
};

// Order Services
export const orderService = {
  createOrder: async (menuItemId, paymentMethod = 'immediate', notes = null) => {
    const response = await api.post('/orders', { menuItemId, paymentMethod, notes });
    return response.data;
  },
  
  markPaymentSubmitted: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/payment`);
    return response.data;
  },
  
  confirmPayment: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/confirm`);
    return response.data;
  },
  
  getUserOrderHistory: async () => {
    const response = await api.get('/orders/my-history');
    return response.data;
  },
  
  getUserOrdersByDate: async (date) => {
    const response = await api.get('/orders/my-history/by-date', { params: { date } });
    return response.data;
  },
  
  // User Debt Management
  getMyDebt: async () => {
    const response = await api.get('/orders/my-debt');
    return response.data;
  },
  
  getMyDebtOrders: async () => {
    const response = await api.get('/orders/my-debt-orders');
    return response.data;
  },
  
  // Admin Order Management
  getAllOrders: async () => {
    const response = await api.get('/orders/all');
    return response.data;
  },
  
  getPendingOrders: async () => {
    const response = await api.get('/orders/pending');
    return response.data;
  },
  
  getTodayOrders: async () => {
    const response = await api.get('/orders/today');
    return response.data;
  },
  
  // Admin Payment Later
  approvePayLater: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/approve-pay-later`);
    return response.data;
  },
  
  rejectPayLater: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/reject-pay-later`);
    return response.data;
  },
  
  getPayLaterPendingOrders: async () => {
    const response = await api.get('/orders/pay-later-pending');
    return response.data;
  },
  
  moveToDebt: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/move-to-debt`);
    return response.data;
  },
  
  // Admin Debt Management
  getAllDebtOrders: async () => {
    const response = await api.get('/orders/all-debt');
    return response.data;
  },
  
  getTotalDebt: async () => {
    const response = await api.get('/orders/total-debt');
    return response.data;
  },
  
  updateOrderStatus: async (orderId, status) => {
    const response = await api.post(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  deleteOrder: async (orderId) => {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },
};
