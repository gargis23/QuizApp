import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { roomAPI } from '../api/api';

const AvailableRooms = () => {
  const { darkMode, user, setGameState } = useApp();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    fetchRooms();
    // Refresh rooms every 5 seconds
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      // Call the API to get all available rooms
      const response = await roomAPI.getAllRooms();
      if (response.data.success) {
        setRooms(response.data.data.rooms);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = (roomCode) => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(roomCode);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const joinRoom = async (roomCode) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await roomAPI.joinRoom(roomCode);
      
      if (response.data.success) {
        setGameState(prev => ({
          ...prev,
          roomCode: roomCode
        }));
        navigate('/waiting');
      }
    } catch (err) {
      console.error('Error joining room:', err);
      alert(err.response?.data?.message || 'Failed to join room');
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
            Loading available rooms...
          </p>
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
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}>
            🎮 Available Rooms
          </h1>
          <p className={`text-lg mb-6 ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Join an active room or create your own
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all transform hover:scale-105"
          >
            ← Back to Home
          </button>
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-lg ${
            darkMode 
              ? 'bg-red-900/30 border border-red-500 text-red-400'
              : 'bg-red-50 border-2 border-red-400 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {rooms.length === 0 ? (
          <div className={`text-center p-12 rounded-xl ${
            darkMode ? 'glassy' : 'bg-white border-2 border-purple-200'
          }`}>
            <div className="text-6xl mb-4">🎪</div>
            <p className={`text-xl mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              No rooms available right now
            </p>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Be the first to create one!
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all"
            >
              Create Room
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room.roomCode}
                className={`p-6 rounded-xl transition-all transform hover:scale-105 ${
                  darkMode ? 'glassy' : 'bg-white border-2 border-purple-200 shadow-lg'
                }`}
              >
                {/* Host Info */}
                <div className="flex items-center space-x-3 mb-4">
                  {room.host.picture ? (
                    <img
                      src={room.host.picture}
                      alt={room.host.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                      {room.host.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className={`font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      {room.host.name}
                    </div>
                    <div className={`text-xs ${
                      darkMode ? 'text-yellow-400' : 'text-orange-600'
                    }`}>
                      👑 Host
                    </div>
                  </div>
                </div>

                {/* Room Code */}
                <div className={`p-3 rounded-lg mb-4 ${
                  darkMode ? 'bg-gray-800/50' : 'bg-purple-50'
                }`}>
                  <div className={`text-xs mb-1 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Room Code
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {room.roomCode}
                    </span>
                    <button
                      onClick={() => copyRoomCode(room.roomCode)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        copiedCode === room.roomCode
                          ? 'bg-green-500 text-white'
                          : (darkMode 
                              ? 'bg-purple-600 hover:bg-purple-700 text-white'
                              : 'bg-purple-500 hover:bg-purple-600 text-white')
                      }`}
                    >
                      {copiedCode === room.roomCode ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Room Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${
                    darkMode ? 'bg-gray-800/50' : 'bg-pink-50'
                  }`}>
                    <div className={`text-xs mb-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Players
                    </div>
                    <div className={`text-lg font-bold ${
                      darkMode ? 'text-pink-400' : 'text-pink-600'
                    }`}>
                      {room.playerCount}/{room.maxPlayers}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    darkMode ? 'bg-gray-800/50' : 'bg-green-50'
                  }`}>
                    <div className={`text-xs mb-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Category
                    </div>
                    <div className={`text-sm font-bold ${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {room.category || 'TBA'}
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                <button
                  onClick={() => joinRoom(room.roomCode)}
                  disabled={room.playerCount >= room.maxPlayers}
                  className={`w-full py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    room.playerCount >= room.maxPlayers
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
                  }`}
                >
                  {room.playerCount >= room.maxPlayers ? '🔒 Room Full' : '🚀 Join Room'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableRooms;