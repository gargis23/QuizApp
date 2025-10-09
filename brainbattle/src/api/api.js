import axios from 'axios';

// Base URL for API
const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.VITE_API_URL || 'https://brainbattle-backend.onrender.com'
  : 'http://localhost:5000';

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
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  googleAuth: (data) => api.post('/api/auth/google', data),
  getMe: () => api.get('/api/auth/me'),
};

// ==================== USER APIs ====================

export const userAPI = {
  updateProfile: (data) => api.put('/api/users/profile', data),
  getUserById: (id) => api.get(`/api/users/${id}`),
  getUserStats: () => api.get('/api/users/stats')
};

// ==================== QUIZ APIs ====================

export const quizAPI = {
  submitResult: (data) => api.post('/api/quiz/submit', data),
  getHistory: (page = 1, limit = 10) => api.get(`/api/quiz/history?page=${page}&limit=${limit}`),
  getResultsByCategory: (category) => api.get(`/api/quiz/category/${category}`)
};

// ==================== LEADERBOARD APIs ====================

export const leaderboardAPI = {
  getLeaderboard: (limit = 100) => api.get(`/api/leaderboard?limit=${limit}`),
  getUserRank: () => api.get('/api/leaderboard/rank'),
  getCategoryLeaderboard: (category, limit = 50) => 
    api.get(`/api/leaderboard/category/${category}?limit=${limit}`)
};

// ==================== ROOM APIs ====================

export const roomAPI = {
  getAllRooms: () => api.get('/api/rooms'),
  createRoom: () => api.post('/api/rooms/create'),
  joinRoom: (roomCode) => api.post(`/api/rooms/join/${roomCode}`),
  leaveRoom: (roomCode) => api.post(`/api/rooms/leave/${roomCode}`),
  getRoom: (roomCode) => api.get(`/api/rooms/${roomCode}`),
  updateSettings: (roomCode, data) => api.put(`/api/rooms/${roomCode}/settings`, data),
  kickPlayer: (roomCode, userId) => api.post(`/api/rooms/${roomCode}/kick/${userId}`),
  startGame: (roomCode, data) => api.post(`/api/rooms/${roomCode}/start`, data),
  addChatMessage: (roomCode, message) => api.post(`/api/rooms/${roomCode}/chat`, { message }),
  quitGame: (roomCode) => api.post(`/api/rooms/${roomCode}/quit`),
  endGame: (roomCode) => api.post(`/api/rooms/${roomCode}/end`)
};

// ==================== HEALTH CHECK ====================

export const healthCheck = () => api.get('/api/health');

export { api };
export default api;