import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';

const RoomLobby = () => {
  const { gameState, setGameState, darkMode, user, setCurrentPage } = useApp();
  const [players, setPlayers] = useState([
    { id: 1, name: user?.name || 'You', isHost: true, email: user?.email }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'System', message: 'Welcome to the room! Waiting for other players...', time: new Date() }
  ]);
  const [roomClosed, setRoomClosed] = useState(false);

  const categories = ['Movies', 'Music', 'Current Affairs', 'History', 'Food'];
  const isHost = players.find(p => p.email === user?.email)?.isHost || false;

  // Simulate players joining (for demonstration)
  useEffect(() => {
    const mockPlayers = [
      { id: 2, name: 'Player2', isHost: false, email: 'player2@example.com' },
      { id: 3, name: 'Player3', isHost: false, email: 'player3@example.com' },
    ];

    let timeouts = [];
    mockPlayers.forEach((player, index) => {
      const timeout = setTimeout(() => {
        if (!roomClosed) {
          setPlayers(prev => [...prev, player]);
          setChatMessages(prev => [...prev, {
            sender: 'System',
            message: `${player.name} joined the room`,
            time: new Date()
          }]);
        }
      }, (index + 1) * 3000);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(t => clearTimeout(t));
  }, [roomClosed]);

  const handleKickPlayer = (playerId) => {
    const player = players.find(p => p.id === playerId);
    setPlayers(players.filter(p => p.id !== playerId));
    setChatMessages(prev => [...prev, {
      sender: 'System',
      message: `${player.name} was removed from the room`,
      time: new Date()
    }]);
  };

  const handleCloseEntry = () => {
    setRoomClosed(true);
    setChatMessages(prev => [...prev, {
      sender: 'System',
      message: 'Room entry is now closed. No new players can join.',
      time: new Date()
    }]);
  };

  const handleLeaveRoom = () => {
    setGameState(prev => ({ ...prev, roomCode: null }));
    setCurrentPage('home');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      setChatMessages(prev => [...prev, {
        sender: user?.name || 'You',
        message: chatMessage,
        time: new Date()
      }]);
      setChatMessage('');
    }
  };

  const handleStartGame = () => {
    if (!selectedCategory) {
      alert('Please select a category first!');
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      selectedCategory,
      waitingForHost: true
    }));
    setCurrentPage('waiting');
  };

  return (
    <div className={`min-h-screen p-4 transition-colors ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
    }`}>
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}>
            Room Lobby
          </h1>
          <div className={`inline-block px-6 py-2 rounded-lg ${
            darkMode ? 'glassy' : 'bg-white border border-purple-200'
          }`}>
            <p className={`font-semibold ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              Room Code: <span className={`text-xl ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>{gameState.roomCode}</span>
            </p>
          </div>
          {roomClosed && (
            <div className="mt-4 inline-block px-4 py-2 rounded-lg bg-red-500/20 border border-red-500">
              <p className="text-red-400 font-medium">🔒 Room Entry Closed</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Host Controls */}
            {isHost && (
              <div className={`p-6 rounded-xl ${
                darkMode ? 'glassy' : 'bg-white border border-purple-200'
              }`}>
                <h2 className={`text-2xl font-bold mb-4 ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  👑 Host Controls
                </h2>

                {/* Category Selection */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-3 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Select Quiz Category:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((category, index) => {
                      const icons = ['🎬', '🎵', '📰', '🏛️', '🍽️'];
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                            selectedCategory === category
                              ? (darkMode 
                                ? 'border-purple-500 bg-purple-600/20' 
                                : 'border-purple-500 bg-purple-50')
                              : (darkMode 
                                ? 'border-gray-600 hover:border-purple-400' 
                                : 'border-purple-200 hover:border-purple-400')
                          }`}
                        >
                          <div className="text-3xl mb-2">{icons[index]}</div>
                          <div className={`text-sm font-medium ${
                            darkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            {category}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleCloseEntry}
                    disabled={roomClosed}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      darkMode 
                        ? 'bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white'
                        : 'bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white'
                    } disabled:cursor-not-allowed`}
                  >
                    🔒 Close Entry
                  </button>

                  <button
                    onClick={handleStartGame}
                    disabled={!selectedCategory || players.length < 2}
                    className={`px-6 py-2 rounded-lg font-bold transition-all transform hover:scale-105 disabled:scale-100 ${
                      darkMode 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white'
                    } disabled:cursor-not-allowed`}
                  >
                    🚀 Start Game
                  </button>
                </div>

                {!selectedCategory && (
                  <p className={`text-sm mt-3 ${
                    darkMode ? 'text-yellow-400' : 'text-orange-600'
                  }`}>
                    ⚠️ Please select a category to start the game
                  </p>
                )}
                {players.length < 2 && (
                  <p className={`text-sm mt-2 ${
                    darkMode ? 'text-yellow-400' : 'text-orange-600'
                  }`}>
                    ⚠️ Waiting for at least 2 players to start
                  </p>
                )}
              </div>
            )}

            {/* Non-Host View */}
            {!isHost && (
              <div className={`p-6 rounded-xl ${
                darkMode ? 'glassy' : 'bg-white border border-purple-200'
              }`}>
                <h2 className={`text-2xl font-bold mb-4 ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  Waiting for Host
                </h2>
                <p className={`mb-4 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  The host is setting up the game. Please wait...
                </p>
                
                {selectedCategory && (
                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-green-900/20 border border-green-500' : 'bg-green-50 border border-green-300'
                  }`}>
                    <p className={`font-medium ${
                      darkMode ? 'text-green-400' : 'text-green-700'
                    }`}>
                      Selected Category: {selectedCategory}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleLeaveRoom}
                  className={`mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  🚪 Leave Room
                </button>
              </div>
            )}

            {/* Live Chat */}
            <div className={`p-6 rounded-xl ${
              darkMode ? 'glassy' : 'bg-white border border-purple-200'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                💬 Live Chat
              </h3>

              {/* Chat Messages */}
              <div className={`h-64 overflow-y-auto p-4 rounded-lg mb-4 ${
                darkMode ? 'bg-gray-800/50' : 'bg-purple-50/50'
              }`}>
                {chatMessages.map((msg, index) => (
                  <div key={index} className="mb-3">
                    <div className="flex items-baseline space-x-2">
                      <span className={`font-semibold text-sm ${
                        msg.sender === 'System' 
                          ? (darkMode ? 'text-yellow-400' : 'text-orange-600')
                          : msg.sender === user?.name 
                          ? (darkMode ? 'text-purple-400' : 'text-purple-600')
                          : (darkMode ? 'text-blue-400' : 'text-blue-600')
                      }`}>
                        {msg.sender}:
                      </span>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {msg.message}
                      </span>
                    </div>
                    <span className={`text-xs ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {msg.time.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={`flex-1 p-3 rounded-lg border focus:outline-none transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                      : 'bg-white border-purple-200 text-gray-800 focus:border-purple-400'
                  }`}
                />
                <button
                  type="submit"
                  className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    darkMode 
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } text-white`}
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Players Sidebar */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-xl sticky top-20 ${
              darkMode ? 'glassy' : 'bg-white border border-purple-200'
            }`}>
              <h3 className={`text-xl font-bold mb-4 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                👥 Players ({players.length})
              </h3>

              <div className="space-y-3">
                {players.map(player => (
                  <div
                    key={player.id}
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      player.isHost
                        ? (darkMode 
                          ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-2 border-purple-500'
                          : 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400')
                        : (darkMode ? 'bg-gray-800/50' : 'bg-purple-50/50')
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        darkMode 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600'
                      }`}>
                        <span className="text-white font-bold">
                          {player.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className={`font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {player.name}
                        </div>
                        {player.isHost && (
                          <span className={`text-xs ${
                            darkMode ? 'text-yellow-400' : 'text-orange-600'
                          }`}>
                            👑 Host
                          </span>
                        )}
                      </div>
                    </div>

                    {isHost && !player.isHost && (
                      <button
                        onClick={() => handleKickPlayer(player.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode 
                            ? 'hover:bg-red-600/20 text-red-400'
                            : 'hover:bg-red-100 text-red-600'
                        }`}
                        title="Kick player"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {!roomClosed && (
                <div className={`mt-4 p-3 rounded-lg text-center text-sm ${
                  darkMode 
                    ? 'bg-blue-900/20 text-blue-400'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  Waiting for more players to join...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomLobby;