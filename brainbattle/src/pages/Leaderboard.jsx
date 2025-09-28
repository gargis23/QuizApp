import React from 'react';

const Leaderboard = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 p-4">
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            🏆 Global Leaderboard
          </h1>
          <p className="text-gray-300 text-lg">Top performers in the BrainBattle arena</p>
        </div>

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-8 mb-12">
          {/* 2nd Place */}
          <div className="text-center">
            <div className="glassy rounded-t-full p-6 mb-4">
              <div className="text-4xl mb-2">{mockData[1].avatar}</div>
              <div className="text-lg font-bold text-gray-300">{mockData[1].name}</div>
              <div className="text-xl font-bold text-purple-400">{mockData[1].score}</div>
            </div>
            <div className="h-24 bg-gradient-to-t from-gray-600 to-gray-500 rounded-t-lg flex items-end justify-center pb-2">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
          </div>

          {/* 1st Place */}
          <div className="text-center">
            <div className="glassy rounded-t-full p-8 mb-4 border-2 border-yellow-400">
              <div className="text-5xl mb-2">{mockData[0].avatar}</div>
              <div className="text-xl font-bold text-yellow-400">{mockData[0].name}</div>
              <div className="text-2xl font-bold text-yellow-400">{mockData[0].score}</div>
            </div>
            <div className="h-32 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg flex items-end justify-center pb-2">
              <span className="text-3xl font-bold text-white">1</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="text-center">
            <div className="glassy rounded-t-full p-6 mb-4">
              <div className="text-4xl mb-2">{mockData[2].avatar}</div>
              <div className="text-lg font-bold text-orange-400">{mockData[2].name}</div>
              <div className="text-xl font-bold text-purple-400">{mockData[2].score}</div>
            </div>
            <div className="h-16 bg-gradient-to-t from-orange-600 to-orange-400 rounded-t-lg flex items-end justify-center pb-2">
              <span className="text-xl font-bold text-white">3</span>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="glassy rounded-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
            <h2 className="text-2xl font-bold text-white text-center">Complete Rankings</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-purple-400 font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left text-purple-400 font-semibold">Player</th>
                  <th className="px-6 py-4 text-center text-purple-400 font-semibold">Score</th>
                  <th className="px-6 py-4 text-center text-purple-400 font-semibold">Accuracy</th>
                  <th className="px-6 py-4 text-center text-purple-400 font-semibold">Games</th>
                </tr>
              </thead>
              <tbody>
                {mockData.map((player, index) => (
                  <tr key={index} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`text-2xl font-bold ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-400' :
                          index === 2 ? 'text-orange-400' :
                          'text-gray-500'
                        }`}>
                          #{index + 1}
                        </span>
                        {index < 3 && (
                          <span className="ml-2 text-xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{player.avatar}</div>
                        <div>
                          <div className="font-semibold text-white">{player.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xl font-bold text-green-400">{player.score.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                            style={{ width: `${player.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="text-blue-400 font-semibold">{player.accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-gray-300">{player.gamesPlayed}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="glassy rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">1,247</div>
            <div className="text-gray-400">Active Players</div>
          </div>
          <div className="glassy rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-pink-400 mb-2">23,891</div>
            <div className="text-gray-400">Games Played Today</div>
          </div>
          <div className="glassy rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">156</div>
            <div className="text-gray-400">Active Rooms</div>
          </div>
          <div className="glassy rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">4.8★</div>
            <div className="text-gray-400">Average Rating</div>
          </div>
        </div>

        {/* Performance Chart Visualization */}
        <div className="glassy rounded-xl p-6">
          <h3 className="text-2xl font-bold text-purple-400 mb-6 text-center">Performance Trends</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Top Categories</h4>
              <div className="space-y-3">
                {['Movies', 'Music', 'History', 'Food', 'Current Affairs'].map((category, index) => {
                  const percentages = [85, 78, 72, 68, 65];
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-gray-300">{category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full"
                            style={{ width: `${percentages[index]}%` }}
                          ></div>
                        </div>
                        <span className="text-purple-400 text-sm font-semibold">{percentages[index]}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Daily Activity</h4>
              <div className="h-32 flex items-end justify-between space-x-1">
                {[40, 65, 55, 80, 70, 90, 85].map((height, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-8 bg-gradient-to-t from-purple-600 to-pink-600 rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-400 mt-1">
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