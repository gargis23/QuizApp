import axios from 'axios';

// Base URL for API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIs ====================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (data) => api.post('/auth/google', data),
  getMe: () => api.get('/auth/me')
};

// ==================== USER APIs ====================

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  getUserById: (id) => api.get(`/users/${id}`),
  getUserStats: () => api.get('/users/stats')
};

// ==================== QUIZ APIs ====================

export const quizAPI = {
  submitResult: (data) => api.post('/quiz/submit', data),
  getHistory: (page = 1, limit = 10) => api.get(`/quiz/history?page=${page}&limit=${limit}`),
  getResultsByCategory: (category) => api.get(`/quiz/category/${category}`)
};

// ==================== LEADERBOARD APIs ====================

export const leaderboardAPI = {
  getLeaderboard: (limit = 100) => api.get(`/leaderboard?limit=${limit}`),
  getUserRank: () => api.get('/leaderboard/rank'),
  getCategoryLeaderboard: (category, limit = 50) => 
    api.get(`/leaderboard/category/${category}?limit=${limit}`)
};

// ==================== ROOM APIs ====================

export const roomAPI = {
  createRoom: () => api.post('/rooms/create'),
  joinRoom: (roomCode) => api.post(`/rooms/join/${roomCode}`),
  leaveRoom: (roomCode) => api.post(`/rooms/leave/${roomCode}`),
  getRoom: (roomCode) => api.get(`/rooms/${roomCode}`),
  updateSettings: (roomCode, data) => api.put(`/rooms/${roomCode}/settings`, data),
  kickPlayer: (roomCode, userId) => api.post(`/rooms/${roomCode}/kick/${userId}`),
  startGame: (roomCode) => api.post(`/rooms/${roomCode}/start`),
  addChatMessage: (roomCode, message) => api.post(`/rooms/${roomCode}/chat`, { message })
};

// ==================== HEALTH CHECK ====================

export const healthCheck = () => api.get('/health');

export default api;