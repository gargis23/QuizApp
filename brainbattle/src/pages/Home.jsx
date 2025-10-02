import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';

const Home = () => {
  const { user, gameState, setGameState, darkMode } = useApp();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = () => {
  if (!user) {
  navigate('/login');
      return;
    }
    const code = generateRoomCode();
    setGameState(prev => ({ ...prev, roomCode: code }));
    setShowCreateRoom(true);
  };

  const joinRoom = () => {
  if (!user) {
  navigate('/login');
      return;
    }
    if (roomCode.length === 6) {
      setGameState(prev => ({ ...prev, roomCode: roomCode.toUpperCase() }));
  navigate('/lobby');
    } else {
      alert('Please enter a valid 6-character room code');
    }
  };

  const goToLobby = () => {
    navigate('/lobby');
  };

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20'
        : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
    }`}>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
        
        <div className={`rounded-3xl p-12 max-w-4xl mx-auto text-center relative z-10 ${
          darkMode ? 'glassy' : 'bg-white/90 border border-purple-200 shadow-2xl'
        }`}>
          <div className="mb-8">
            <h1 className={`text-6xl font-bold mb-4 animate-pulse ${
              darkMode 
                ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent'
            }`}>
              BrainBattle
            </h1>
            <p className={`text-2xl mb-8 ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Challenge Your Mind in the Ultimate Multiplayer Quiz Experience
            </p>
            <p className={`text-lg max-w-2xl mx-auto ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Test your knowledge across Movies, Music, Current Affairs, History, and Food. 
              Battle friends in real-time with anti-cheating technology and strategic powerups!
            </p>
          </div>

          {!user ? (
            <div className="space-y-4">
              <p className={`mb-6 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Join the battle to test your knowledge!
              </p>
              <div className="flex gap-4 justify-center">
          <button 
            onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-lg font-semibold text-lg text-white transition-all transform hover:scale-105 shadow-lg"
                >
                  Sign Up Now
                </button>
                <button 
                  onClick={() => navigate('/login')}
                  className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 ${
                    darkMode 
                      ? 'border-2 border-purple-500 hover:bg-purple-500 text-purple-400 hover:text-white'
                      : 'border-2 border-purple-600 hover:bg-purple-600 text-purple-600 hover:text-white'
                  }`}
                >
                  Login
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className={`text-3xl font-bold mb-6 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Ready to Battle?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className={`p-6 rounded-xl ${
                  darkMode ? 'glassy' : 'bg-purple-50/80 border-2 border-purple-200'
                }`}>
                  <h3 className={`text-xl font-semibold mb-4 ${
                    darkMode ? 'text-pink-400' : 'text-pink-600'
                  }`}>
                    Create Private Room
                  </h3>
                  <button 
                    onClick={createRoom}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 shadow-md"
                  >
                    Create Room
                  </button>
                  {showCreateRoom && gameState.roomCode && (
                    <div className={`mt-4 p-4 rounded-lg ${
                      darkMode 
                        ? 'bg-green-900/30 border border-green-500'
                        : 'bg-green-50 border-2 border-green-400'
                    }`}>
                      <p className={`font-semibold ${
                        darkMode ? 'text-green-400' : 'text-green-700'
                      }`}>
                        Room Created!
                      </p>
                      <p className={`text-2xl font-bold mt-2 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        Code: {gameState.roomCode}
                      </p>
                      <p className={`text-sm mt-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Share this code with friends
                      </p>
                      <button 
                        onClick={goToLobby}
                        className={`mt-3 w-full py-2 rounded-lg font-medium transition-colors ${
                          darkMode 
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        Go to Lobby
                      </button>
                    </div>
                  )}
                </div>

                <div className={`p-6 rounded-xl ${
                  darkMode ? 'glassy' : 'bg-pink-50/80 border-2 border-pink-200'
                }`}>
                  <h3 className={`text-xl font-semibold mb-4 ${
                    darkMode ? 'text-pink-400' : 'text-pink-600'
                  }`}>
                    Join Room
                  </h3>
                  <input
                    type="text"
                    placeholder="Enter Room Code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className={`w-full p-3 rounded-lg mb-4 focus:outline-none transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 border border-gray-600 text-white focus:border-purple-500'
                        : 'bg-white border-2 border-purple-200 text-gray-800 focus:border-purple-400'
                    }`}
                    maxLength="6"
                  />
                  <button 
                    onClick={joinRoom}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 shadow-md"
                  >
                    Join Room
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => navigate('/leaderboard')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    darkMode 
                      ? 'border-2 border-purple-500 hover:bg-purple-500 text-purple-400 hover:text-white'
                      : 'border-2 border-purple-600 hover:bg-purple-600 text-purple-600 hover:text-white'
                  }`}
                >
                  View Leaderboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;