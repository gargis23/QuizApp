// Frontend API service for leaderboard operations
import { api } from '../api/api';

export const leaderboardAPI = {
  // Get global leaderboard
  getGlobalLeaderboard: async () => {
    try {
      const response = await api.get('/api/leaderboard/global');
      return response.data;
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
      throw error;
    }
  },

  // Get room-wise leaderboard
  getRoomLeaderboard: async (roomCode) => {
    try {
      const response = await api.get(`/api/leaderboard/room/${roomCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching room leaderboard:', error);
      throw error;
    }
  },

  // Save game result
  saveGameResult: async (gameData) => {
    try {
      const response = await api.post('/api/leaderboard/save-result', gameData);
      return response.data;
    } catch (error) {
      console.error('Error saving game result:', error);
      throw error;
    }
  },

  // Get player history
  getPlayerHistory: async (playerId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/api/leaderboard/player/${playerId}/history`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching player history:', error);
      throw error;
    }
  },

  // Get player statistics
  getPlayerStats: async (playerId) => {
    try {
      const response = await api.get(`/api/leaderboard/player/${playerId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw error;
    }
  }
};