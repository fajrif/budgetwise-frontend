import axios from './axios';

// Auth API
export const authAPI = {
  login: (credentials) => axios.post('/auth/login', credentials),
  register: (userData) => axios.post('/auth/register', userData),
  getMe: () => axios.get('/me'),
  updateMe: (data) => axios.put('/me', data),
};

// Projects API
export const projectsAPI = {
  getAll: (params) => axios.get('/projects', { params }),
  getById: (id) => axios.get(`/projects/${id}`),
  create: (data) => axios.post('/projects', data),
  update: (id, data) => axios.put(`/projects/${id}`, data),
  delete: (id) => axios.delete(`/projects/${id}`),
};

// Budget Items API
export const budgetItemsAPI = {
  getAll: (params) => axios.get('/budget-items', { params }),
  getById: (id) => axios.get(`/budget-items/${id}`),
  create: (data) => axios.post('/budget-items', data),
  update: (id, data) => axios.put(`/budget-items/${id}`, data),
  delete: (id) => axios.delete(`/budget-items/${id}`),
};

// Transactions API
export const transactionsAPI = {
  getAll: (params) => axios.get('/transactions', { params }),
  getById: (id) => axios.get(`/transactions/${id}`),
  create: (data) => axios.post('/transactions', data),
  update: (id, data) => axios.put(`/transactions/${id}`, data),
  delete: (id) => axios.delete(`/transactions/${id}`),
};

// Cost Types API
export const costTypesAPI = {
  getAll: () => axios.get('/cost-types'),
  getById: (id) => axios.get(`/cost-types/${id}`),
  create: (data) => axios.post('/cost-types', data),
  update: (id, data) => axios.put(`/cost-types/${id}`, data),
  delete: (id) => axios.delete(`/cost-types/${id}`),
};
