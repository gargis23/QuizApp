import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import socketClient from '../socket/socketClient';

const WaitingPage = () => {
  const { gameState, setGameState, darkMode, user } = useApp();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [hostInfo, setHostInfo] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'System', message: 'Waiting for host to start the game...', time: new Date() }
  ]);
  const [dots, setDots] = useState('');

  // Animated dots for "Waiting" text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!gameState.roomCode || !user) {
      navigate('/');
      return;
    }

    // Make sure socket is connected
    const token = localStorage.getItem('token');
    if (!socketClient.connected) {
      socketClient.connect(user.id, token);
    }

    // Join the room to get updates
    socketClient.joinRoom(gameState.roomCode, user.id, user.name);

    // Listen for room state from database
    socketClient.onRoomState((data) => {
      console.log('Waiting page - room state:', data);
      
      // Set all players from database
      setPlayers(data.players);
      
      // Set host info
      setHostInfo(data.host);
      
      // Load chat messages from database
      if (data.chatMessages && data.chatMessages.length > 0) {
        setChatMessages(data.chatMessages);
      }
    });

    // Listen for new players joining
    socketClient.onPlayerJoined((data) => {
      console.log('Waiting page - player joined:', data.player);
      setPlayers(prev => {
        if (prev.some(p => p.id === data.player.id)) {
          return prev;
        }
        return [...prev, data.player];
      });
    });

    // Listen for players leaving
    socketClient.onPlayerLeft((data) => {
      setPlayers(prev => prev.filter(p => p.id !== data.userId));
    });

    // Listen for chat messages
    socketClient.onChatMessage((data) => {
      setChatMessages(prev => [...prev, data]);
    });

    // Listen for game starting - navigate all users to quiz
    socketClient.onGameStarting((data) => {
      console.log('Game starting! Data received:', data);
      console.log('Setting game state with category:', data.category);
      setGameState(prev => ({
        ...prev,
        selectedCategory: data.category,
        waitingForHost: false,
        inGame: true,
        gameStarting: true,
        powerups: { hint: 3, skip: 2, freeze: 1 },
        currentQuestion: 0,
        score: 0,
        timeLeft: 30,
        questionsAttempted: 0,
        correctAnswers: 0,
        cheatingDetected: 0
      }));
      console.log('Navigating to quiz...');
      navigate('/quiz');
    });

    // Listen for errors
    socketClient.onError((data) => {
      alert(data.message);
    });

    // Listen for being kicked
    socketClient.onKickedFromRoom((data) => {
      alert(data.message);
      setGameState(prev => ({ ...prev, roomCode: null }));
      navigate('/');
    });

    // Listen for host leaving the room
    socketClient.socket?.on('host_left_room', (data) => {
      alert(data.message + ' You will be redirected to home.');
      setGameState(prev => ({ ...prev, roomCode: null }));
      // Redirect to home after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    });

    // Cleanup on unmount
    return () => {
      console.log('WaitingPage cleaning up socket listeners');
      socketClient.off('room_state');
      socketClient.off('player_joined');
      socketClient.off('player_left');
      socketClient.off('chat_message');
      socketClient.off('game_starting');
      socketClient.off('error');
      socketClient.off('kicked_from_room');
      socketClient.socket?.off('host_left_room');
    };
  }, [gameState.roomCode, user, navigate, setGameState]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      socketClient.sendMessage(gameState.roomCode, user.id, user.name, chatMessage);
      setChatMessage('');
    }
  };

  return (
    <div className={`min-h-screen p-4 transition-colors ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
    }`}>
      <div className="max-w-6xl mx-auto py-8">
        {/* Main Loading Card */}
        <div className={`p-8 rounded-2xl text-center mb-6 ${
          darkMode ? 'glassy' : 'bg-white border-2 border-purple-200 shadow-xl'
        }`}>
          {/* Animated Brain Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              {/* Outer spinning ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-32 h-32 rounded-full border-4 border-t-transparent animate-spin ${
                  darkMode ? 'border-purple-500' : 'border-purple-600'
                }`}></div>
              </div>
              
              {/* Middle pulsing ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-24 h-24 rounded-full border-4 border-r-transparent animate-spin ${
                  darkMode ? 'border-pink-500' : 'border-pink-600'
                }`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              
              {/* Center icon */}
              <div className={`relative w-32 h-32 rounded-full flex items-center justify-center ${
                darkMode 
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
              } animate-pulse`}>
                <span className="text-5xl">🧠</span>
              </div>
            </div>
          </div>

          {/* Waiting Text */}
          <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
              : 'text-gray-900'
          }`}>
            Waiting for {hostInfo ? hostInfo.name : 'Host'} to Start{dots}
          </h1>

          <p className={`text-lg mb-6 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Get ready! The quiz will begin soon.
          </p>

          {/* Game Info */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg ${
              darkMode ? 'bg-gray-800/50' : 'bg-purple-50 border border-purple-200'
            }`}>
              <div className={`text-2xl font-bold mb-1 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {gameState.selectedCategory || 'TBA'}
              </div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Category
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              darkMode ? 'bg-gray-800/50' : 'bg-pink-50 border border-pink-200'
            }`}>
              <div className={`text-2xl font-bold mb-1 ${
                darkMode ? 'text-pink-400' : 'text-pink-600'
              }`}>
                10
              </div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Questions
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              darkMode ? 'bg-gray-800/50' : 'bg-green-50 border border-green-200'
            }`}>
              <div className={`text-2xl font-bold mb-1 ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                {gameState.roomCode}
              </div>
              <div className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Room Code
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className={`p-4 rounded-lg text-left ${
            darkMode 
              ? 'bg-blue-900/20 border border-blue-500/30'
              : 'bg-blue-50 border-2 border-blue-200'
          }`}>
            <h3 className={`font-semibold mb-2 ${
              darkMode ? 'text-blue-400' : 'text-blue-700'
            }`}>
              💡 Pro Tips:
            </h3>
            <ul className={`text-sm space-y-1 ${
              darkMode ? 'text-blue-300' : 'text-blue-600'
            }`}>
              <li>• Answer quickly to earn time bonus points</li>
              <li>• Use powerups strategically - they're limited!</li>
              <li>• Stay focused - tab switching will penalize you</li>
              <li>• Copy-paste is disabled during the quiz</li>
            </ul>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Chat */}
          <div className={`lg:col-span-2 p-6 rounded-2xl ${
            darkMode ? 'glassy' : 'bg-white border-2 border-purple-200 shadow-xl'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              💬 Live Chat
            </h3>

            {/* Chat Messages */}
            <div className={`h-64 overflow-y-auto p-4 rounded-lg mb-4 ${
              darkMode ? 'bg-gray-800/50' : 'bg-purple-50/50 border border-purple-100'
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

          {/* Players Sidebar - All players from database */}
          <div className={`p-6 rounded-2xl ${
            darkMode ? 'glassy' : 'bg-white border-2 border-purple-200 shadow-xl'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${
              darkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              👥 Players ({players.length})
            </h3>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    darkMode ? 'bg-gray-800/50' : 'bg-purple-50'
                  }`}
                >
                  {player.picture ? (
                    <img
                      src={player.picture}
                      alt={player.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      darkMode ? 'bg-purple-600' : 'bg-purple-500'
                    }`}>
                      <span className="text-white font-bold">
                        {player.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className={`font-medium ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {player.name}
                      {player.id === user?.id && ' (You)'}
                    </div>
                    {player.isHost && (
                      <span className={`text-xs font-medium ${
                        darkMode ? 'text-yellow-400' : 'text-orange-600'
                      }`}>
                        👑 Host
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {players.length < 2 && (
              <div className={`mt-4 p-3 rounded-lg text-center text-sm ${
                darkMode 
                  ? 'bg-yellow-900/20 text-yellow-400'
                  : 'bg-yellow-50 text-yellow-700'
              }`}>
                Waiting for more players...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingPage;