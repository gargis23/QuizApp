import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { leaderboardAPI } from '../api/api';

const Leaderboard = () => {
  const { darkMode, user } = useApp();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboardAPI.getLeaderboard(50);
      
      if (response.data.success) {
        setLeaderboard(response.data.data.leaderboard);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
          : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
            Loading leaderboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
          : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
      }`}>
        <div className="text-center">
          <p className={`text-xl mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
            {error}
          </p>
          <button
            onClick={fetchLeaderboard}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 transition-colors ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
    }`}>
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}>
            🏆 Leaderboard
          </h1>
          <p className={`text-lg ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Top performers in the BrainBattle arena
          </p>
        </div>

        {leaderboard.length === 0 ? (
          <div className={`text-center p-12 rounded-xl ${
            darkMode ? 'glassy' : 'bg-white border-2 border-purple-200'
          }`}>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              No players yet. Be the first to play!
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="flex justify-center items-end gap-8 mb-12">
                {/* 2nd Place */}
                <div className="text-center">
                  <div className={`rounded-t-full p-6 mb-4 ${
                    darkMode ? 'glassy' : 'bg-white border-2 border-gray-300 shadow-lg'
                  }`}>
                    {leaderboard[1].picture ? (
                      <img 
                        src={leaderboard[1].picture} 
                        alt={leaderboard[1].name}
                        className="w-16 h-16 rounded-full mx-auto mb-2"
                      />
                    ) : (
                      <div className="text-4xl mb-2">
                        {leaderboard[1].name?.charAt(0).toUpperCase() || '🏆'}
                      </div>
                    )}
                    <div className={`text-lg font-bold ${
                      darkMode ? 'text-gray-300' : 'text-gray-800'
                    }`}>
                      {leaderboard[1].name}
                    </div>
                    <div className={`text-xl font-bold ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {leaderboard[1].totalScore}
                    </div>
                  </div>
                  <div className="h-24 bg-gradient-to-t from-gray-500 to-gray-400 rounded-t-lg flex items-end justify-center pb-2">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <div className={`rounded-t-full p-8 mb-4 border-4 ${
                    darkMode 
                      ? 'glassy border-yellow-400' 
                      : 'bg-white border-yellow-500 shadow-2xl'
                  }`}>
                    {leaderboard[0].picture ? (
                      <img 
                        src={leaderboard[0].picture} 
                        alt={leaderboard[0].name}
                        className="w-20 h-20 rounded-full mx-auto mb-2"
                      />
                    ) : (
                      <div className="text-5xl mb-2">
                        {leaderboard[0].name?.charAt(0).toUpperCase() || '👑'}
                      </div>
                    )}
                    <div className={`text-xl font-bold ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`}>
                      {leaderboard[0].name}
                    </div>
                    <div className={`text-2xl font-bold ${
                      darkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`}>
                      {leaderboard[0].totalScore}
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex items-end justify-center pb-2 shadow-lg">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <div className={`rounded-t-full p-6 mb-4 ${
                    darkMode ? 'glassy' : 'bg-white border-2 border-orange-300 shadow-lg'
                  }`}>
                    {leaderboard[2].picture ? (
                      <img 
                        src={leaderboard[2].picture} 
                        alt={leaderboard[2].name}
                        className="w-16 h-16 rounded-full mx-auto mb-2"
                      />
                    ) : (
                      <div className="text-4xl mb-2">
                        {leaderboard[2].name?.charAt(0).toUpperCase() || '🥉'}
                      </div>
                    )}
                    <div className={`text-lg font-bold ${
                      darkMode ? 'text-orange-400' : 'text-orange-700'
                    }`}>
                      {leaderboard[2].name}
                    </div>
                    <div className={`text-xl font-bold ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {leaderboard[2].totalScore}
                    </div>
                  </div>
                  <div className="h-16 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg flex items-end justify-center pb-2">
                    <span className="text-xl font-bold text-white">3</span>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            <div className={`rounded-xl overflow-hidden mb-8 ${
              darkMode ? 'glassy' : 'bg-white border-2 border-purple-200 shadow-xl'
            }`}>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                <h2 className="text-2xl font-bold text-white text-center">Complete Rankings</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? 'bg-gray-800' : 'bg-purple-50'}>
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
                        Score
                      </th>
                      <th className={`px-6 py-4 text-center font-semibold ${
                        darkMode ? 'text-purple-400' : 'text-purple-700'
                      }`}>
                        Accuracy
                      </th>
                      <th className={`px-6 py-4 text-center font-semibold ${
                        darkMode ? 'text-purple-400' : 'text-purple-700'
                      }`}>
                        Games
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((player, index) => {
                      const isCurrentUser = user && player.id === user.id;
                      return (
                        <tr 
                          key={player.id || index} 
                          className={`border-b transition-colors ${
                            isCurrentUser 
                              ? (darkMode 
                                ? 'bg-purple-900/30 border-purple-500' 
                                : 'bg-purple-100 border-purple-300')
                              : (darkMode 
                                ? 'border-gray-700 hover:bg-gray-800/50' 
                                : 'border-purple-100 hover:bg-purple-50')
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className={`text-2xl font-bold ${
                                index === 0 ? 'text-yellow-400' :
                                index === 1 ? (darkMode ? 'text-gray-400' : 'text-gray-500') :
                                index === 2 ? 'text-orange-400' :
                                (darkMode ? 'text-gray-500' : 'text-gray-600')
                              }`}>
                                #{index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              {player.picture ? (
                                <img 
                                  src={player.picture} 
                                  alt={player.name}
                                  className="w-10 h-10 rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                  {player.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                              )}
                              <div>
                                <div className={`font-medium ${
                                  darkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {player.name}
                                  {isCurrentUser && (
                                    <span className={`ml-2 text-sm ${
                                      darkMode ? 'text-purple-400' : 'text-purple-600'
                                    }`}>
                                      (You)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`text-xl font-bold ${
                              darkMode ? 'text-purple-400' : 'text-purple-600'
                            }`}>
                              {player.totalScore || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`font-semibold ${
                              player.accuracy >= 80 ? 'text-green-500' :
                              player.accuracy >= 60 ? 'text-yellow-500' :
                              'text-orange-500'
                            }`}>
                              {player.accuracy || 0}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                              {player.gamesPlayed || 0}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;