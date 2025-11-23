import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  registerUser: (data) => api.post('/auth/register/user', data),
  registerEmployer: (data) => api.post('/auth/register/employer', data),
  refreshToken: (data) => api.post('/auth/refresh', data),
};

export const jobsAPI = {
  getJobs: (params = {}) => api.get('/jobs', { params }),
  searchJobs: (params) => api.get('/jobs/search', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.patch(`/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: (params = {}) => api.get('/jobs/employer/my-jobs', { params }),
  getCategories: () => api.get('/jobs/categories/list'),
  getDistricts: () => api.get('/jobs/districts/list'),
};


export const applicationsAPI = {
  createApplication: (data) => api.post('/applications', data),
  getMyApplications: (params = {}) => api.get('/applications/my-applications', { params }),
  getJobApplications: (jobId, params = {}) => api.get(`/applications/job/${jobId}`, { params }),
  updateApplicationStatus: (applicationId, data) => api.patch(`/applications/${applicationId}/status`, data),
  withdrawApplication: (applicationId) => api.delete(`/applications/${applicationId}`),
};

export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
};

export const employersAPI = {
  getProfile: () => api.get('/employers/me'),
  updateProfile: (data) => api.patch('/employers/me', data),
};

export const adminAPI = {
  login: (data) => api.post('/auth/login', data),
  getStats: () => api.get('/admin/stats'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getEmployers: (params = {}) => api.get('/admin/employers', { params }),
  getJobs: (params = {}) => api.get('/admin/jobs', { params }),
  getApplications: (params = {}) => api.get('/admin/applications', { params }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  deleteEmployer: (employerId) => api.delete(`/admin/employers/${employerId}`),
  deleteJob: (jobId) => api.delete(`/admin/jobs/${jobId}`),
  updateJobStatus: (jobId, status) => api.patch(`/admin/jobs/${jobId}/status`, { status }),
};

export const workTrackingAPI = {
  createSession: (data) => api.post('/work-sessions', data),
  requestStart: (sessionId, data) => api.post(`/work-sessions/${sessionId}/request-start`, data),
  requestEnd: (sessionId, data) => api.post(`/work-sessions/${sessionId}/request-end`, data),
  approveStart: (sessionId, data) => api.post(`/work-sessions/${sessionId}/approve-start`, data),
  approveEnd: (sessionId, data) => api.post(`/work-sessions/${sessionId}/approve-end`, data),
  getMySessions: (params = {}) => api.get('/work-sessions/my-sessions', { params }),
  getEmployerSessions: (params = {}) => api.get('/work-sessions/employer/sessions', { params }),
  getSummary: () => api.get('/work-sessions/summary'),
  getEmployerSummary: () => api.get('/work-sessions/employer/summary'),
};

export default api;