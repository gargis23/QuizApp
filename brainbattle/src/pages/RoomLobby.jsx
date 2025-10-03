import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { roomAPI } from '../api/api';
import socketClient from '../socket/socketClient';

const RoomLobby = () => {
  const { gameState, setGameState, darkMode, user } = useApp();
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [roomClosed, setRoomClosed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['Movies', 'Music', 'Current Affairs', 'History', 'Food'];

  // Fetch room data from backend
  const fetchRoomData = async () => {
    if (!gameState.roomCode) {
      setError('No room code provided');
      setLoading(false);
      return;
    }

    try {
      const response = await roomAPI.getRoom(gameState.roomCode);
      if (response.data.success) {
        const room = response.data.data.room;
        setRoomData(room);
        setSelectedCategory(room.category || '');
        setRoomClosed(room.isEntryClosed || false);
        setChatMessages(room.chatMessages || []);
      }
    } catch (err) {
      console.error('Error fetching room:', err);
      setError(err.response?.data?.message || 'Failed to fetch room data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gameState.roomCode || !user) {
      navigate('/');
      return;
    }

    fetchRoomData();

    // Connect socket if not already connected
    const token = localStorage.getItem('token');
    if (!socketClient.connected) {
      socketClient.connect(user.id, token);
    }

    // Small delay to ensure socket is ready
    setTimeout(() => {
      // Join the room
      console.log('Joining room:', gameState.roomCode);
      socketClient.joinRoom(gameState.roomCode, user.id, user.name);
    }, 500);

    // Listen for room state updates
    socketClient.onRoomState((data) => {
      console.log('Room state received:', data);
      console.log('Current roomData before update:', roomData);
      // Use socket data directly instead of refetching
      if (data.roomCode === gameState.roomCode) {
        setRoomData(prev => {
          const updatedRoom = {
            ...prev,
            players: data.players || prev?.players || [],
            category: data.category || prev?.category,
            isEntryClosed: data.isEntryClosed || prev?.isEntryClosed,
            status: data.status || prev?.status,
            host: data.host || prev?.host
          };
          console.log('Updated roomData:', updatedRoom);
          return updatedRoom;
        });
        
        // Update chat messages from socket data
        if (data.chatMessages) {
          console.log('Updating chat messages from socket:', data.chatMessages.length);
          setChatMessages(data.chatMessages);
        }
      }
    });

    // Listen for new players joining
    socketClient.onPlayerJoined((data) => {
      console.log('Player joined event:', data.player);
      // Refresh room data for player joins to ensure accuracy
      fetchRoomData();
    });

    // Listen for players leaving
    socketClient.onPlayerLeft((data) => {
      console.log('Player left:', data.userId);
      // Refresh room data for player leaves to ensure accuracy
      fetchRoomData();
    });

    // Listen for chat messages (real-time)
    socketClient.onChatMessage((data) => {
      console.log('Chat message received:', data);
      setChatMessages(prev => {
        const newMessages = [...prev, {
          sender: data.sender,
          message: data.message,
          time: data.time || new Date()
        }];
        console.log('Updated chat messages:', newMessages.length);
        return newMessages;
      });
    });

    // Listen for game starting
    socketClient.onGameStarting((data) => {
      console.log('Game starting event received with data:', data);
      console.log('Current gameState before update:', gameState);
      setGameState(prev => ({
        ...prev,
        selectedCategory: data.category,
        waitingForHost: false,
        inGame: true,  // Set inGame to true immediately
        gameStarting: true,  // Add flag to indicate game is starting
        powerups: { hint: 3, skip: 2, freeze: 1 },
        currentQuestion: 0,
        score: 0,
        timeLeft: 30,
        questionsAttempted: 0,
        correctAnswers: 0,
        cheatingDetected: 0
      }));
      console.log('Navigating to /quiz');
      navigate('/quiz');
    });

    // Listen for host leaving
    socketClient.socket?.on('host_left', (data) => {
      console.log('Host left in lobby:', data);
      
      // Reset game state when host leaves
      setGameState(prev => ({ 
        ...prev, 
        inGame: false,
        selectedCategory: null,
        currentQuestion: 0,
        score: 0,
        timeLeft: 30,
        questionsAttempted: 0,
        correctAnswers: 0,
        questions: [],
        powerups: { hint: 3, skip: 2, freeze: 1 },
        cheatingDetected: 0,
        roomCode: null,
        gameStarting: false,
        waitingForHost: false
      }));
      
      alert(data.message || 'Host has left the room. Returning to home.');
      navigate('/');
    });

    // Cleanup on unmount
    return () => {
      // Remove specific listeners instead of all
      socketClient.socket?.off('game_starting');
      socketClient.socket?.off('host_left');
      socketClient.socket?.off('room_state_updated');
      socketClient.socket?.off('chat_message');
      socketClient.socket?.off('error');
    };
  }, [gameState.roomCode, user, navigate]);

  const handleLeaveRoom = () => {
    socketClient.leaveRoom(gameState.roomCode, user.id, user.name);
    setGameState(prev => ({ ...prev, roomCode: null }));
    navigate('/');
  };

  const handleKickPlayer = (playerId) => {
    const isHost = roomData?.host?._id === user?.id || roomData?.host?.id === user?.id;
    if (!isHost) return;
    socketClient.kickPlayer(gameState.roomCode, playerId, user.id);
  };

  const handleCloseEntry = () => {
    const isHost = roomData?.host?._id === user?.id || roomData?.host?.id === user?.id;
    if (!isHost) return;
    socketClient.closeEntry(gameState.roomCode, user.id);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      console.log('Sending message:', chatMessage, 'to room:', gameState.roomCode);
      socketClient.sendMessage(gameState.roomCode, user.id, user.name, chatMessage);
      setChatMessage('');
    }
  };

  const handleCategorySelect = (category) => {
    const isHost = roomData?.host?._id === user?.id || roomData?.host?.id === user?.id;
    if (!isHost) return;
    setSelectedCategory(category);
    socketClient.selectCategory(gameState.roomCode, category, user.id);
  };

  const handleStartGame = () => {
    const isHost = roomData?.host?._id === user?.id || roomData?.host?.id === user?.id;
    if (!isHost) return;
    
    if (!selectedCategory) {
      alert('Please select a category first!');
      return;
    }

    if (roomData?.players?.length < 2) {
      alert('Need at least 2 players to start!');
      return;
    }

    socketClient.startGame(gameState.roomCode, user.id, selectedCategory);
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
            Loading room...
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
          <div className="text-6xl mb-4">❌</div>
          <h2 className={`text-2xl font-bold mb-4 ${
            darkMode ? 'text-red-400' : 'text-red-600'
          }`}>
            Room Error
          </h2>
          <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
          : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
      }`}>
        <div className="text-center">
          <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
            No room data available
          </p>
        </div>
      </div>
    );
  }

  const isHost = roomData.host._id === user.id || roomData.host.id === user.id;

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
          <div className="mt-4">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Host: <span className={`font-semibold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {roomData.host.name} {isHost && '(You)'}
              </span>
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
            {/* Host Controls - Only show if user is host */}
            {isHost ? (
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
                          onClick={() => handleCategorySelect(category)}
                          className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                            selectedCategory === category
                              ? (darkMode 
                                  ? 'bg-purple-600 border-purple-500 text-white' 
                                  : 'bg-purple-600 border-purple-600 text-white')
                              : (darkMode 
                                  ? 'border-gray-600 hover:border-purple-500 text-gray-300' 
                                  : 'border-gray-300 hover:border-purple-400 text-gray-700')
                          }`}
                        >
                          <div className="text-3xl mb-2">{icons[index]}</div>
                          <div className="font-medium">{category}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Host Action Buttons */}
                <div className="flex gap-3">
                  {!roomClosed && (
                    <button
                      onClick={handleCloseEntry}
                      className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                        darkMode 
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      }`}
                    >
                      🔒 Close Entry
                    </button>
                  )}
                  <button
                    onClick={handleStartGame}
                    disabled={!selectedCategory || roomData.players.length < 2}
                    className={`flex-1 py-3 rounded-lg font-bold transition-all transform hover:scale-105 ${
                      !selectedCategory || roomData.players.length < 2
                        ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
                    }`}
                  >
                    🚀 Start Game
                  </button>
                </div>

                {!selectedCategory && (
                  <p className={`text-sm mt-4 ${
                    darkMode ? 'text-yellow-400' : 'text-orange-600'
                  }`}>
                    ⚠️ Please select a category to start the game
                  </p>
                )}
                {roomData.players.length < 2 && (
                  <p className={`text-sm mt-2 ${
                    darkMode ? 'text-yellow-400' : 'text-orange-600'
                  }`}>
                    ⚠️ Waiting for at least 2 players to start
                  </p>
                )}
              </div>
            ) : (
              /* Non-Host View */
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
                  {hostInfo ? `${hostInfo.name} is setting up the game. Please wait...` : 'The host is setting up the game. Please wait...'}
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
                          : (darkMode ? 'text-pink-400' : 'text-pink-600')
                      }`}>
                        {msg.sender}:
                      </span>
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {msg.message}
                      </span>
                    </div>
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
                  className={`flex-1 p-3 rounded-lg focus:outline-none transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border border-gray-600 text-white focus:border-purple-500'
                      : 'bg-white border-2 border-purple-200 text-gray-800 focus:border-purple-400'
                  }`}
                  maxLength="200"
                />
                <button
                  type="submit"
                  disabled={!chatMessage.trim()}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    !chatMessage.trim()
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                      : (darkMode 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white')
                  }`}
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar - Players List */}
          <div className={`p-6 rounded-xl ${
            darkMode ? 'glassy' : 'bg-white border border-purple-200'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              👥 Players ({roomData?.players?.length || 0})
            </h3>

            <div className="space-y-3">
              {roomData?.players?.map((player) => {
                const playerUser = player.user || player;
                const playerId = playerUser._id || playerUser.id;
                const playerName = playerUser.name;
                const isPlayerHost = roomData.host._id === playerId || roomData.host.id === playerId;
                
                console.log('Rendering player:', { playerId, playerName, isPlayerHost, player });
                
                return (
                  <div
                    key={playerId}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isPlayerHost
                        ? (darkMode 
                          ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-2 border-purple-500'
                          : 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400')
                        : (darkMode ? 'bg-gray-800/50' : 'bg-purple-50')
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {playerUser.picture ? (
                        <img
                          src={playerUser.picture}
                          alt={playerName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          darkMode ? 'bg-purple-600' : 'bg-purple-500'
                        }`}>
                          <span className="text-white font-bold">
                            {playerName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className={`font-medium ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        }`}>
                          {playerName}
                          {playerId === user?.id && ' (You)'}
                        </div>
                        {isPlayerHost && (
                          <span className={`text-xs font-medium ${
                            darkMode ? 'text-yellow-400' : 'text-orange-600'
                          }`}>
                            👑 Host
                          </span>
                        )}
                      </div>
                    </div>

                    {isHost && !isPlayerHost && (
                      <button
                        onClick={() => handleKickPlayer(playerId)}
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
                );
              })}
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
  );
};

export default RoomLobby;