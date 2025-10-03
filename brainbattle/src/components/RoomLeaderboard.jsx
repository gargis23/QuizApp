import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardAPI } from '../services/leaderboardAPI';
import { useApp } from '../context/AppContext';

const RoomLeaderboard = ({ roomCode, gameStartedAt, onClose }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showPopup } = useApp();

  useEffect(() => {
    fetchRoomLeaderboard();
  }, [roomCode]);

  const fetchRoomLeaderboard = async () => {
    try {
      setLoading(true);
      console.log('Fetching room leaderboard for room:', roomCode);
      const response = await leaderboardAPI.getRoomLeaderboard(roomCode);
      
      console.log('Room leaderboard response:', response);
      
      if (response.success) {
        setLeaderboard(response.leaderboard || []);
        if (response.leaderboard?.length === 0) {
          console.log('No leaderboard data found for room:', roomCode);
          // Wait a bit and try again in case data is still being saved
          setTimeout(() => {
            if (leaderboard.length === 0) {
              fetchRoomLeaderboard();
            }
          }, 2000);
        }
      } else {
        setError(response.message || 'Failed to fetch leaderboard');
        console.error('Failed to fetch room leaderboard:', response.message);
      }
    } catch (error) {
      console.error('Error fetching room leaderboard:', error);
      setError('Failed to fetch leaderboard');
      showPopup('Failed to load room leaderboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      case 4: return '⭐';
      case 5: return '🌟';
      default: return `#${rank}`;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-500 bg-yellow-100 border-yellow-300';
      case 2: return 'text-gray-600 bg-gray-100 border-gray-300';
      case 3: return 'text-orange-600 bg-orange-100 border-orange-300';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const handlePlayAgain = () => {
    onClose();
    // Navigate back to home to create a new room
    navigate('/');
  };

  const handleGoHome = () => {
    onClose();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">🏆 Game Results</h2>
            <p className="text-blue-100">Room: {roomCode}</p>
            {gameStartedAt && (
              <p className="text-blue-100 text-sm">
                Completed: {new Date(gameStartedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-xl mb-4">❌</div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={fetchRoomLeaderboard}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <p className="text-gray-600 mb-4">No results found for this game</p>
              <p className="text-sm text-gray-500 mb-4">Results may still be processing...</p>
              <button 
                onClick={fetchRoomLeaderboard}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh Results
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((player, index) => (
                <div
                  key={player._id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${getRankClass(player.rank)}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold w-12 text-center">
                      {getRankIcon(player.rank)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{player.playerName}</h3>
                      <p className="text-sm opacity-75">
                        {player.correctAnswers}/{player.questionsAttempted} correct
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold">{player.score}</div>
                    <div className="text-sm opacity-75">{player.accuracy}% accuracy</div>
                    {player.timeTaken && (
                      <div className="text-xs opacity-60">
                        {Math.floor(player.timeTaken / 60)}:{(player.timeTaken % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t bg-gray-50 p-6 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handlePlayAgain}
              className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🎮</span>
              <span>Play Again</span>
            </button>
            <button
              onClick={handleGoHome}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🏠</span>
              <span>Go Home</span>
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
            >
              <span>🏆</span>
              <span>Global Leaderboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomLeaderboard;