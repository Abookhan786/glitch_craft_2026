import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'https://glitch-craft-2026.onrender.com';
const normalizedApiUrl = apiUrl.replace(/\/$/, '');
const apiBaseUrl = normalizedApiUrl.endsWith('/api') ? normalizedApiUrl : `${normalizedApiUrl}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gc_token');
      localStorage.removeItem('gc_team');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Challenges
export const challengeAPI = {
  getAll: () => api.get('/challenges'),
  getById: (id) => api.get(`/challenges/${id}`),
  getCategories: () => api.get('/challenges/categories'),
};

// Submissions
export const submissionAPI = {
  submit: (challengeId, flag) => api.post('/submissions', { challengeId, flag }),
  getMine: () => api.get('/submissions/mine'),
};

// Scores
export const scoreAPI = {
  getScoreboard: () => api.get('/scores'),
  getHistory: () => api.get('/scores/history'),
  getStats: () => api.get('/scores/stats'),
};

// Hints
export const hintAPI = {
  unlock: (hintId) => api.post(`/hints/${hintId}/unlock`),
};

// Admin
export const adminAPI = {
  // Challenges
  getChallenges: () => api.get('/admin/challenges'),
  createChallenge: (data) => api.post('/admin/challenges', data),
  updateChallenge: (id, data) => api.patch(`/admin/challenges/${id}`, data),
  deleteChallenge: (id) => api.delete(`/admin/challenges/${id}`),
  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  // Teams
  getTeams: () => api.get('/admin/teams'),
  resetTeam: (id) => api.post(`/admin/teams/${id}/reset`),
  deleteTeam: (id) => api.delete(`/admin/teams/${id}`),
  // Files
  uploadFile: (formData) => api.post('/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  // Config
  getConfig: () => api.get('/admin/config'),
  updateConfig: (key, value) => api.put('/admin/config', { key, value }),
};

export const configAPI = {
  get: () => api.get('/config'),
};

export default api;
