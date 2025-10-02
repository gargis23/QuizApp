import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';

const WaitingPage = () => {
  const { gameState, setGameState, darkMode, user, setCurrentPage } = useApp();
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

  // Simulate host starting game after some time (for demo)
  useEffect(() => {
    const timer = setTimeout(() => {
      setChatMessages(prev => [...prev, {
        sender: 'System',
        message: 'Host is starting the game!',
        time: new Date()
      }]);
      
      setTimeout(() => {
        setGameState(prev => ({ ...prev, waitingForHost: false }));
        setCurrentPage('quiz');
      }, 2000);
    }, 10000);

    return () => clearTimeout(timer);
  }, [setCurrentPage, setGameState]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      setChatMessages(prev => [...prev, {
        sender: user?.name || 'You',
        message: chatMessage,
        time: new Date()
      }]);
      setChatMessage('');

      // Simulate other players responding
      setTimeout(() => {
        const responses = [
          'Good luck everyone!',
          'Can\'t wait to start!',
          'Let\'s do this!',
          'Ready when you are!',
          'This is going to be fun!'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        setChatMessages(prev => [...prev, {
          sender: 'Player2',
          message: randomResponse,
          time: new Date()
        }]);
      }, 1000 + Math.random() * 2000);
    }
  };

  return (
    <div className={`min-h-screen p-4 transition-colors flex items-center justify-center ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
    }`}>
      <div className="max-w-4xl w-full">
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
            Waiting for Host to Start{dots}
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

        {/* Live Chat */}
        <div className={`p-6 rounded-2xl ${
          darkMode ? 'glassy' : 'bg-white border-2 border-purple-200 shadow-xl'
        }`}>
          <h3 className={`text-xl font-bold mb-4 ${
            darkMode ? 'text-purple-400' : 'text-purple-600'
          }`}>
            💬 Live Chat
          </h3>

          {/* Chat Messages */}
          <div className={`h-48 overflow-y-auto p-4 rounded-lg mb-4 ${
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
              placeholder="Chat with other players..."
              className={`flex-1 p-3 rounded-lg border focus:outline-none transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                  : 'bg-white border-purple-200 text-gray-800 focus:border-purple-400'
              }`}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-lg font-medium text-white transition-all transform hover:scale-105 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Send
            </button>
          </form>
        </div>

        {/* Loading Progress Bar */}
        <div className="mt-6">
          <div className={`h-2 rounded-full overflow-hidden ${
            darkMode ? 'bg-gray-800' : 'bg-purple-100'
          }`}>
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-gradient"
              style={{
                backgroundSize: '200% 100%',
                animation: 'gradientMove 2s ease infinite'
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Gradient Animation CSS */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default WaitingPage;