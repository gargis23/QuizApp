import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { roomAPI } from '../api/api';
import socketClient from '../socket/socketClient';

const Home = () => {
  const { user, darkMode } = useApp();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeRooms, setActiveRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const { gameState, setGameState } = useApp();

  // Fetch active rooms
  const fetchActiveRooms = async () => {
    setRoomsLoading(true);
    try {
      const response = await roomAPI.getAllRooms();
      if (response.data.success) {
        setActiveRooms(response.data.data.rooms);
      }
    } catch (err) {
      console.error('Error fetching rooms:', err);
    } finally {
      setRoomsLoading(false);
    }
  };

  // Fetch rooms on component mount and when user logs in
  useEffect(() => {
    fetchActiveRooms();
    
    // Refresh rooms every 30 seconds
    const interval = setInterval(fetchActiveRooms, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const createRoom = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await roomAPI.createRoom();
      
      if (response.data.success) {
        const newRoomCode = response.data.data.room.roomCode;
        setCreatedRoomCode(newRoomCode);
        setShowCreateRoom(true);
        
        setGameState(prev => ({
          ...prev,
          roomCode: newRoomCode
        }));
        
        // Refresh rooms list
        fetchActiveRooms();
      }
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err.response?.data?.message || 'Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!roomCode || roomCode.length !== 6) {
      setError('Please enter a valid 6-character room code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await roomAPI.joinRoom(roomCode);
      
      if (response.data.success) {
        setGameState(prev => ({
          ...prev,
          roomCode: roomCode
        }));

        // Connect socket and navigate to waiting page (participants go to waiting)
        const token = localStorage.getItem('token');
        if (!socketClient.connected) {
          socketClient.connect(user.id, token);
        }

        // Participants go to waiting page, not lobby
        navigate('/waiting');
      }
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.response?.data?.message || 'Failed to join room. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToLobby = () => {
    // Host goes to lobby after creating room
    const token = localStorage.getItem('token');
    if (!socketClient.connected) {
      socketClient.connect(user.id, token);
    }
    navigate('/lobby');
  };

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${
              darkMode 
                ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
            }`}>
              Welcome to BrainBattle
            </h1>
            <p className={`text-xl mb-4 ${
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

              {error && (
                <div className={`p-4 rounded-lg mb-4 ${
                  darkMode 
                    ? 'bg-red-900/30 border border-red-500 text-red-400'
                    : 'bg-red-50 border-2 border-red-400 text-red-700'
                }`}>
                  {error}
                </div>
              )}
              
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
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 shadow-md ${
                      loading 
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    }`}
                  >
                    {loading ? 'Creating...' : 'Create Room'}
                  </button>
                  {showCreateRoom && createdRoomCode && (
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
                        Code: {createdRoomCode}
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
                    disabled={loading || !roomCode}
                    className={`w-full py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 shadow-md ${
                      loading || !roomCode
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'
                    }`}
                  >
                    {loading ? 'Joining...' : 'Join Room'}
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

              {/* Active Rooms Section */}
              <div className="mt-8">
                <div className={`p-6 rounded-xl ${
                  darkMode ? 'glassy' : 'bg-white/80 border-2 border-purple-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-semibold ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      🎮 Active Rooms
                    </h3>
                    <button
                      onClick={fetchActiveRooms}
                      disabled={roomsLoading}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        darkMode 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      } ${roomsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {roomsLoading ? '↻' : '🔄'} Refresh
                    </button>
                  </div>

                  {roomsLoading ? (
                    <div className={`text-center py-4 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Loading rooms...
                    </div>
                  ) : activeRooms.length === 0 ? (
                    <div className={`text-center py-4 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      No active rooms available. Create one to get started!
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {activeRooms.map((room) => (
                        <div
                          key={room.roomCode}
                          className={`p-4 rounded-lg border transition-colors ${
                            darkMode 
                              ? 'bg-gray-800/50 border-gray-600 hover:border-purple-500'
                              : 'bg-purple-50/50 border-purple-200 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-lg font-bold ${
                                  darkMode ? 'text-white' : 'text-gray-800'
                                }`}>
                                  {room.roomCode}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  room.status === 'waiting' 
                                    ? (darkMode ? 'bg-green-600/20 text-green-400' : 'bg-green-100 text-green-700')
                                    : (darkMode ? 'bg-orange-600/20 text-orange-400' : 'bg-orange-100 text-orange-700')
                                }`}>
                                  {room.status}
                                </span>
                              </div>
                              <div className={`text-sm ${
                                darkMode ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                <div>Host: <span className="font-medium">{room.host}</span></div>
                                <div>Players: {room.players}/{room.maxPlayers}</div>
                                {room.category && (
                                  <div>Category: <span className="font-medium">{room.category}</span></div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setRoomCode(room.roomCode);
                                // Auto-scroll to join section
                                document.querySelector('input[placeholder="Enter Room Code"]')?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className={`ml-3 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                darkMode 
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                  : 'bg-purple-600 hover:bg-purple-700 text-white'
                              }`}
                            >
                              Copy Code
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;