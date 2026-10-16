import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject bearer token if present in localStorage (fallback for cross-origin/testing)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API helper functions
export const authApi = {
  login: (credentials: { email: string; password: string }) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const scenarioApi = {
  list: () => api.get('/scenarios'),
  get: (id: string) => api.get(`/scenarios/${id}`),
  create: (data: any) => api.post('/scenarios', data),
  update: (id: string, data: any) => api.patch(`/scenarios/${id}`, data),
  delete: (id: string) => api.delete(`/scenarios/${id}`),
  duplicate: (id: string) => api.post(`/scenarios/${id}/duplicate`),
  validate: (id: string) => api.post(`/scenarios/${id}/validate`),
};

export const sessionApi = {
  list: () => api.get('/sessions'),
  get: (id: string) => api.get(`/sessions/${id}`),
  createFromScenario: (scenarioId: string) => api.post(`/sessions/from-scenario/${scenarioId}`),
  join: (data: { sessionCode: string; roleId?: string }) => api.post('/sessions/join', data),
  start: (id: string) => api.post(`/sessions/${id}/start`),
  pause: (id: string) => api.post(`/sessions/${id}/pause`),
  resume: (id: string) => api.post(`/sessions/${id}/resume`),
  complete: (id: string) => api.post(`/sessions/${id}/complete`),
  injectDisruption: (id: string, data: any) => api.post(`/sessions/${id}/disruptions`, data),
  getFeed: (id: string, roleId?: string) => api.get(`/sessions/${id}/feed`, { params: { roleId } }),
  getTimeline: (id: string) => api.get(`/sessions/${id}/timeline`),
  reconstruct: (id: string, roleId: string, timestamp?: string) =>
    api.get(`/sessions/${id}/reconstruct`, { params: { roleId, timestamp } }),
  getMessages: (id: string) => api.get(`/sessions/${id}/messages`),
  sendMessage: (id: string, data: { message: string; recipientScope?: string; senderRoleId?: string }) =>
    api.post(`/sessions/${id}/messages`, data),
};

export const decisionApi = {
  submit: (sessionId: string, data: any) => api.post(`/sessions/${sessionId}/decisions`, data),
  list: (sessionId: string) => api.get(`/sessions/${sessionId}/decisions`),
  getAssessments: (sessionId: string) => api.get(`/sessions/${sessionId}/assessments`),
  computeAssessments: (sessionId: string) => api.post(`/sessions/${sessionId}/assessments/compute`),
  updateFeedback: (sessionId: string, assessmentId: string, data: any) =>
    api.patch(`/sessions/${sessionId}/assessments/${assessmentId}/feedback`, data),
};

export const aarApi = {
  get: (sessionId: string) => api.get(`/aar/${sessionId}`),
  generate: (sessionId: string) => api.post(`/aar/${sessionId}/generate`),
  downloadPdfUrl: (sessionId: string) => `/api/aar/${sessionId}/download-pdf`,
  downloadCsvUrl: (sessionId: string) => `/api/aar/${sessionId}/download-csv`,
};

export const userApi = {
  list: () => api.get('/users'),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
};
