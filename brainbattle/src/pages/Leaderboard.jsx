import React from 'react';
import { useApp } from '../context/useApp';

const Leaderboard = () => {
  const { darkMode, userResults, user } = useApp();
  
  const mockData = [
    { name: "QuizMaster2024", score: 2847, accuracy: 94, gamesPlayed: 156, avatar: "🏆" },
    { name: "BrainiacBella", score: 2736, accuracy: 91, gamesPlayed: 143, avatar: "🧠" },
    { name: "TriviaKing", score: 2691, accuracy: 89, gamesPlayed: 139, avatar: "👑" },
    { name: "SmartCookie", score: 2456, accuracy: 87, gamesPlayed: 124, avatar: "🍪" },
    { name: "KnowledgeSeeker", score: 2389, accuracy: 85, gamesPlayed: 118, avatar: "🔍" },
    { name: "QuizNinja", score: 2234, accuracy: 82, gamesPlayed: 112, avatar: "🥷" },
    { name: "FactFinder", score: 2156, accuracy: 80, gamesPlayed: 98, avatar: "📚" },
    { name: "WisdomWarrior", score: 2089, accuracy: 78, gamesPlayed: 87, avatar: "⚔️" },
    { name: "MovieBuff", score: 1987, accuracy: 76, gamesPlayed: 79, avatar: "🎬" },
    { name: "MusicMaestro", score: 1823, accuracy: 74, gamesPlayed: 71, avatar: "🎵" }
  ];

  // Add current user results if available
  if (userResults.length > 0 && user) {
    const totalScore = userResults.reduce((sum, result) => sum + result.score, 0);
    const avgAccuracy = Math.round(
      userResults.reduce((sum, result) => sum + result.accuracy, 0) / userResults.length
    );
    
    mockData.push({
      name: user.name,
      score: totalScore,
      accuracy: avgAccuracy,
      gamesPlayed: userResults.length,
      avatar: user.picture ? "👤" : user.name.charAt(0).toUpperCase(),
      isCurrentUser: true
    });
    
    mockData.sort((a, b) => b.score - a.score);
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
              : 'text-gray-900'
          }`}>
            🏆 Global Leaderboard
          </h1>
          <p className={`text-lg ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Top performers in the BrainBattle arena
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-8 mb-12">
          {/* 2nd Place */}
          <div className="text-center">
            <div className={`rounded-t-full p-6 mb-4 ${
              darkMode ? 'glassy' : 'bg-white border-2 border-gray-300 shadow-lg'
            }`}>
              <div className="text-4xl mb-2">{mockData[1].avatar}</div>
              <div className={`text-lg font-bold ${
                darkMode ? 'text-gray-300' : 'text-gray-800'
              }`}>
                {mockData[1].name}
              </div>
              <div className={`text-xl font-bold ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {mockData[1].score}
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
              <div className="text-5xl mb-2">{mockData[0].avatar}</div>
              <div className={`text-xl font-bold ${
                darkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {mockData[0].name}
              </div>
              <div className={`text-2xl font-bold ${
                darkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {mockData[0].score}
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
              <div className="text-4xl mb-2">{mockData[2].avatar}</div>
              <div className={`text-lg font-bold ${
                darkMode ? 'text-orange-400' : 'text-orange-700'
              }`}>
                {mockData[2].name}
              </div>
              <div className={`text-xl font-bold ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {mockData[2].score}
              </div>
            </div>
            <div className="h-16 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg flex items-end justify-center pb-2">
              <span className="text-xl font-bold text-white">3</span>
            </div>
          </div>
        </div>

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
                {mockData.map((player, index) => (
                  <tr 
                    key={index} 
                    className={`border-b transition-colors ${
                      player.isCurrentUser 
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
                          index === 1 ? (darkMode ? 'text-gray-400' : 'text-gray-600') :
                          index === 2 ? 'text-orange-400' :
                          (darkMode ? 'text-gray-500' : 'text-gray-600')
                        }`}>
                          #{index + 1}
                        </span>
                        {index < 3 && (
                          <span className="ml-2 text-xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                        {player.isCurrentUser && (
                          <span className="ml-2 text-sm bg-purple-600 text-white px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{player.avatar}</div>
                        <div>
                          <div className={`font-semibold ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {player.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xl font-bold ${
                        darkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {player.score.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className={`w-16 rounded-full h-2 ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <div 
                            className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                            style={{ width: `${player.accuracy}%` }}
                          ></div>
                        </div>
                        <span className={`font-semibold ${
                          darkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          {player.accuracy}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {player.gamesPlayed}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-xl p-6 text-center transition-all duration-300 ${
            darkMode 
              ? 'glassy hover:bg-purple-600/10' 
              : 'bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              1,247
            </div>
            <div className={darkMode ? 'text-gray-400' : 'text-gray-700'}>
              Active Players
            </div>
          </div>
          <div className={`rounded-xl p-6 text-center transition-all duration-300 ${
            darkMode 
              ? 'glassy hover:bg-pink-600/10' 
              : 'bg-white border-2 border-pink-200 hover:border-pink-400 hover:shadow-lg'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              darkMode ? 'text-pink-400' : 'text-pink-600'
            }`}>
              23,891
            </div>
            <div className={darkMode ? 'text-gray-400' : 'text-gray-700'}>
              Games Played Today
            </div>
          </div>
          <div className={`rounded-xl p-6 text-center transition-all duration-300 ${
            darkMode 
              ? 'glassy hover:bg-green-600/10' 
              : 'bg-white border-2 border-green-200 hover:border-green-400 hover:shadow-lg'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              darkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              156
            </div>
            <div className={darkMode ? 'text-gray-400' : 'text-gray-700'}>
              Active Rooms
            </div>
          </div>
          <div className={`rounded-xl p-6 text-center transition-all duration-300 ${
            darkMode 
              ? 'glassy hover:bg-yellow-600/10' 
              : 'bg-white border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg'
          }`}>
            <div className={`text-3xl font-bold mb-2 ${
              darkMode ? 'text-yellow-400' : 'text-yellow-600'
            }`}>
              4.8★
            </div>
            <div className={darkMode ? 'text-gray-400' : 'text-gray-700'}>
              Average Rating
            </div>
          </div>
        </div>

        {/* Performance Chart Visualization */}
        <div className={`rounded-xl p-6 ${
          darkMode ? 'glassy' : 'bg-white border-2 border-purple-200'
        }`}>
          <h3 className={`text-2xl font-bold mb-6 text-center ${
            darkMode ? 'text-purple-400' : 'text-gray-900'
          }`}>
            Performance Trends
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Top Categories
              </h4>
              <div className="space-y-3">
                {['Movies', 'Music', 'History', 'Food', 'Current Affairs'].map((category, index) => {
                  const percentages = [85, 78, 72, 68, 65];
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-32 rounded-full h-2 ${
                          darkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                          <div 
                            className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                            style={{ width: `${percentages[index]}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-semibold ${
                          darkMode ? 'text-purple-400' : 'text-purple-600'
                        }`}>
                          {percentages[index]}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Daily Activity
              </h4>
              <div className="h-32 flex items-end justify-between space-x-1">
                {[40, 65, 55, 80, 70, 90, 85].map((height, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-600 to-pink-600 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className={`text-xs mt-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;