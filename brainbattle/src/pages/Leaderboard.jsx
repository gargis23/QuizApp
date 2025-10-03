import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { leaderboardAPI } from '../services/leaderboardAPI';

const Leaderboard = () => {
  const { user, showPopup, darkMode } = useApp();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await leaderboardAPI.getGlobalLeaderboard();
      
      if (response.success) {
        setLeaderboard(response.leaderboard);
      } else {
        setError(response.message || 'Failed to load leaderboard');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
      showPopup('Failed to load leaderboard', 'error');
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
      case 6: return '💫';
      case 7: return '✨';
      case 8: return '🔸';
      case 9: return '🔹';
      case 10: return '💎';
      default: return `${rank}`;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1: 
        return darkMode 
          ? 'text-yellow-400 bg-yellow-400/20 border-yellow-400/50' 
          : 'text-yellow-600 bg-yellow-50 border-yellow-300';
      case 2: 
        return darkMode 
          ? 'text-gray-300 bg-gray-400/20 border-gray-400/50' 
          : 'text-gray-600 bg-gray-50 border-gray-300';
      case 3: 
        return darkMode 
          ? 'text-orange-400 bg-orange-400/20 border-orange-400/50' 
          : 'text-orange-600 bg-orange-50 border-orange-300';
      case 4: 
        return darkMode 
          ? 'text-blue-400 bg-blue-400/20 border-blue-400/50' 
          : 'text-blue-600 bg-blue-50 border-blue-300';
      case 5: 
        return darkMode 
          ? 'text-green-400 bg-green-400/20 border-green-400/50' 
          : 'text-green-600 bg-green-50 border-green-300';
      case 6: case 7: case 8: case 9: case 10:
        return darkMode 
          ? 'text-purple-400 bg-purple-400/15 border-purple-400/40' 
          : 'text-purple-600 bg-purple-50 border-purple-300';
      default: 
        return darkMode 
          ? 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30' 
          : 'text-indigo-600 bg-indigo-50 border-indigo-200';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
          : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
      } flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading global leaderboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-colors ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
          : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
      } flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <p className={`text-xl mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            {error}
          </p>
          <button
            onClick={fetchLeaderboard}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
    } py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}>
            🏆 Global Leaderboard
          </h1>
          <p className={`text-lg mb-2 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Top performers across all BrainBattle games
          </p>
          <div className={`text-sm ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Ranked by total score • {leaderboard.length} players competing
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className={`text-center p-12 rounded-xl ${
            darkMode ? 'glassy' : 'bg-white/80 border-2 border-purple-200'
          }`}>
            <div className="text-6xl mb-4">🎮</div>
            <p className={`text-xl mb-2 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              No players yet!
            </p>
            <p className={`${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Be the first to play and claim the top spot
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="flex justify-center items-end gap-4 mb-12 px-4">
                {/* 2nd Place */}
                <div className="text-center flex-1 max-w-xs">
                  <div className={`rounded-xl p-6 mb-4 transform hover:scale-105 transition-all duration-300 ${
                    darkMode 
                      ? 'glassy border-2 border-gray-400/30' 
                      : 'bg-white/90 border-2 border-gray-300 shadow-lg'
                  }`}>
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                      darkMode 
                        ? 'bg-gradient-to-r from-gray-500 to-gray-600' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                      {leaderboard[1].playerName?.charAt(0).toUpperCase() || '2'}
                    </div>
                    <div className={`text-lg font-bold truncate ${
                      darkMode ? 'text-gray-300' : 'text-gray-800'
                    }`}>
                      {leaderboard[1].playerName}
                    </div>
                    <div className={`text-2xl font-bold ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {leaderboard[1].totalScore.toLocaleString()}
                    </div>
                    <div className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {leaderboard[1].totalGames} games • {leaderboard[1].overallAccuracy}%
                    </div>
                  </div>
                  <div className="h-20 bg-gradient-to-t from-gray-500 to-gray-400 rounded-t-lg flex items-end justify-center pb-2 shadow-lg">
                    <span className="text-2xl font-bold text-white">🥈</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center flex-1 max-w-xs">
                  <div className={`rounded-xl p-8 mb-4 transform hover:scale-105 transition-all duration-300 border-4 ${
                    darkMode 
                      ? 'glassy border-yellow-400/50' 
                      : 'bg-white/90 border-yellow-500 shadow-2xl'
                  }`}>
                    <div className="text-3xl mb-2">👑</div>
                    <div className={`w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-white font-bold text-2xl ${
                      darkMode 
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' 
                        : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                    }`}>
                      {leaderboard[0].playerName?.charAt(0).toUpperCase() || '👑'}
                    </div>
                    <div className={`text-xl font-bold truncate ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`}>
                      {leaderboard[0].playerName}
                    </div>
                    <div className={`text-3xl font-bold ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`}>
                      {leaderboard[0].totalScore.toLocaleString()}
                    </div>
                    <div className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {leaderboard[0].totalGames} games • {leaderboard[0].overallAccuracy}%
                    </div>
                  </div>
                  <div className="h-24 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex items-end justify-center pb-2 shadow-lg">
                    <span className="text-3xl font-bold text-white">👑</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center flex-1 max-w-xs">
                  <div className={`rounded-xl p-6 mb-4 transform hover:scale-105 transition-all duration-300 ${
                    darkMode 
                      ? 'glassy border-2 border-orange-400/30' 
                      : 'bg-white/90 border-2 border-orange-300 shadow-lg'
                  }`}>
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                      darkMode 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600' 
                        : 'bg-gradient-to-r from-orange-400 to-orange-500'
                    }`}>
                      {leaderboard[2].playerName?.charAt(0).toUpperCase() || '3'}
                    </div>
                    <div className={`text-lg font-bold truncate ${
                      darkMode ? 'text-orange-400' : 'text-orange-700'
                    }`}>
                      {leaderboard[2].playerName}
                    </div>
                    <div className={`text-2xl font-bold ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {leaderboard[2].totalScore.toLocaleString()}
                    </div>
                    <div className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {leaderboard[2].totalGames} games • {leaderboard[2].overallAccuracy}%
                    </div>
                  </div>
                  <div className="h-16 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg flex items-end justify-center pb-2 shadow-lg">
                    <span className="text-xl font-bold text-white">🥉</span>
                  </div>
                </div>
              </div>
            )}

            {/* Complete Rankings */}
            <div className={`rounded-xl overflow-hidden shadow-xl ${
              darkMode ? 'glassy' : 'bg-white/90 border-2 border-purple-200'
            }`}>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <h2 className="text-3xl font-bold text-white text-center">Complete Rankings</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? 'bg-gray-800/50' : 'bg-purple-50'}>
                    <tr>
                      <th className={`px-6 py-4 text-left font-semibold ${
                        darkMode ? 'text-purple-400' : 'text-purple-700'
                      }`}>
                        Rank
                      </th>
                      <th className={`px-6 py-4 text-left font-semibold ${
                        darkMode ? 'text-purple-400' : 'text-purple-700'
                      }`}>
                        Player
                      </th>
                      <th className={`px-6 py-4 text-center font-semibold ${
                        darkMode ? 'text-purple-400' : 'text-purple-700'
                      }`}>
                        Total Score
                      </th>
                      <th className={`px-6 py-4 text-center font-semibold ${
                        darkMode ? 'text-purple-400' : 'text-purple-700'
                      }`}>
                        Games
                      </th>
                      <th className={`px-6 py-4 text-center font-semibold ${
                        darkMode ? 'text-purple-400' : 'text-purple-700'
                      }`}>
                        Avg Score
                      </th>
                      <th className={`px-6 py-4 text-center font-semibold ${
                        darkMode ? 'text-purple-400' : 'text-purple-700'
                      }`}>
                        Accuracy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((player, index) => {
                      const isCurrentUser = user && player._id === user._id;
                      return (
                        <tr 
                          key={player._id || index} 
                          className={`border-b transition-colors hover:scale-[1.01] hover:shadow-lg ${
                            isCurrentUser 
                              ? (darkMode 
                                ? 'bg-purple-900/40 border-purple-500/50' 
                                : 'bg-purple-100/80 border-purple-300')
                              : (darkMode 
                                ? 'border-gray-700/50 hover:bg-gray-800/30' 
                                : 'border-purple-100 hover:bg-purple-50/50')
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold border-2 ${getRankClass(player.rank)}`}>
                              {getRankIcon(player.rank)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                darkMode 
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
                              }`}>
                                {player.playerName?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <div className={`font-bold text-lg ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {player.playerName}
                                  {isCurrentUser && (
                                    <span className={`ml-2 text-sm px-2 py-1 rounded-full ${
                                      darkMode 
                                        ? 'bg-purple-600/50 text-purple-300' 
                                        : 'bg-purple-200 text-purple-600'
                                    }`}>
                                      You
                                    </span>
                                  )}
                                </div>
                                {player.lastPlayed && (
                                  <div className={`text-sm ${
                                    darkMode ? 'text-gray-400' : 'text-gray-500'
                                  }`}>
                                    Last played: {new Date(player.lastPlayed).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-2xl font-bold ${
                              darkMode ? 'text-purple-400' : 'text-purple-600'
                            }`}>
                              {player.totalScore.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-lg font-semibold ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {player.totalGames}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-lg font-semibold ${
                              darkMode ? 'text-blue-400' : 'text-blue-600'
                            }`}>
                              {player.averageScore}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-bold px-3 py-2 rounded-full text-sm ${
                              player.overallAccuracy >= 80 
                                ? (darkMode ? 'bg-green-600/30 text-green-400' : 'bg-green-100 text-green-700')
                                : player.overallAccuracy >= 60 
                                ? (darkMode ? 'bg-yellow-600/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700')
                                : (darkMode ? 'bg-red-600/30 text-red-400' : 'bg-red-100 text-red-700')
                            }`}>
                              {player.overallAccuracy}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`rounded-xl p-6 text-center transform hover:scale-105 transition-all ${
                darkMode 
                  ? 'glassy border-2 border-blue-400/30' 
                  : 'bg-white/90 border-2 border-blue-200'
              }`}>
                <div className={`text-4xl font-bold mb-2 ${
                  darkMode ? 'text-blue-400' : 'text-blue-600'
                }`}>
                  {leaderboard.reduce((sum, p) => sum + p.totalGames, 0).toLocaleString()}
                </div>
                <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Total Games Played
                </div>
              </div>
              <div className={`rounded-xl p-6 text-center transform hover:scale-105 transition-all ${
                darkMode 
                  ? 'glassy border-2 border-green-400/30' 
                  : 'bg-white/90 border-2 border-green-200'
              }`}>
                <div className={`text-4xl font-bold mb-2 ${
                  darkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  {Math.round(leaderboard.reduce((sum, p) => sum + p.overallAccuracy, 0) / leaderboard.length)}%
                </div>
                <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Average Accuracy
                </div>
              </div>
              <div className={`rounded-xl p-6 text-center transform hover:scale-105 transition-all ${
                darkMode 
                  ? 'glassy border-2 border-purple-400/30' 
                  : 'bg-white/90 border-2 border-purple-200'
              }`}>
                <div className={`text-4xl font-bold mb-2 ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  {Math.max(...leaderboard.map(p => p.totalScore)).toLocaleString()}
                </div>
                <div className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Highest Score
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;