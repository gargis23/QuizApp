import React, { useState } from 'react';
import { useApp } from '../context/useApp.jsx';

const Home = () => {
  const { isLoggedIn, setCurrentPage, gameState, setGameState } = useApp();
  const [roomCode, setRoomCode] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = () => {
    const code = generateRoomCode();
    setGameState(prev => ({ ...prev, roomCode: code }));
    setShowCreateRoom(true);
  };

  const joinRoom = () => {
    if (roomCode.length === 6) {
      setGameState(prev => ({ ...prev, roomCode: roomCode.toUpperCase() }));
      setCurrentPage('quiz');
    } else {
      alert('Please enter a valid 6-character room code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
        
        <div className="glassy rounded-3xl p-12 max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              BrainBattle
            </h1>
            <p className="text-2xl text-gray-300 mb-8">
              Challenge Your Mind in the Ultimate Multiplayer Quiz Experience
            </p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Test your knowledge across Movies, Music, Current Affairs, History, and Food. 
              Battle friends in real-time with anti-cheating technology and strategic powerups!
            </p>
          </div>

          {!isLoggedIn ? (
            <div className="space-y-4">
              <p className="text-gray-300 mb-6">Join the battle to test your knowledge!</p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => setCurrentPage('register')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
                >
                  Sign Up Now
                </button>
                <button 
                  onClick={() => setCurrentPage('login')}
                  className="border-2 border-purple-500 hover:bg-purple-500 px-8 py-3 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
                >
                  Login
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-purple-400 mb-6">Ready to Battle?</h2>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="glassy p-6 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4 text-pink-400">Create Private Room</h3>
                  <button 
                    onClick={createRoom}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    Create Room
                  </button>
                  {showCreateRoom && gameState.roomCode && (
                    <div className="mt-4 p-4 bg-green-900/30 border border-green-500 rounded-lg">
                      <p className="text-green-400 font-semibold">Room Created!</p>
                      <p className="text-2xl font-bold text-white mt-2">Code: {gameState.roomCode}</p>
                      <p className="text-sm text-gray-300 mt-2">Share this code with friends</p>
                      <button 
                        onClick={() => setCurrentPage('quiz')}
                        className="mt-3 w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg font-medium transition-colors"
                      >
                        Start Quiz
                      </button>
                    </div>
                  )}
                </div>

                <div className="glassy p-6 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4 text-pink-400">Join Room</h3>
                  <input
                    type="text"
                    placeholder="Enter Room Code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-white mb-4 focus:border-purple-500 focus:outline-none"
                    maxLength="6"
                  />
                  <button 
                    onClick={joinRoom}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    Join Room
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => setCurrentPage('leaderboard')}
                  className="border-2 border-purple-500 hover:bg-purple-500 px-6 py-2 rounded-lg font-medium transition-all"
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