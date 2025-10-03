import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { userAPI } from '../api/api';
import { leaderboardAPI } from '../services/leaderboardAPI';

const Profile = () => {
  const { user, setUser, darkMode } = useApp();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    bio: user?.bio || '',
    picture: user?.picture || ''
  });

  // Fetch player statistics on component mount
  useEffect(() => {
    const fetchPlayerStats = async () => {
      if (!user?.id && !user?._id) {
        console.log('No user ID available for stats fetch');
        setStatsLoading(false);
        return;
      }

      try {
        setStatsLoading(true);
        const playerId = user.id || user._id;
        console.log('Fetching stats for player:', playerId);
        
        const response = await leaderboardAPI.getPlayerStats(playerId);
        
        if (response.success) {
          setPlayerStats(response.stats);
          console.log('Player stats loaded:', response.stats);
        } else {
          console.error('Failed to fetch player stats:', response.message);
        }
      } catch (error) {
        console.error('Error fetching player stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchPlayerStats();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, picture: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Send all data including picture to backend to save in database
      const response = await userAPI.updateProfile({
        name: formData.name,
        age: formData.age || undefined,
        bio: formData.bio || undefined,
        picture: formData.picture || undefined // Save to database, not localStorage
      });

      if (response.data.success) {
        // Update user context with data from database
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        
        // Update localStorage with fresh data from database
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Update form data to match database
        setFormData({
          name: updatedUser.name,
          email: updatedUser.email,
          age: updatedUser.age || '',
          bio: updatedUser.bio || '',
          picture: updatedUser.picture || ''
        });

        setSuccess('Profile updated successfully!');
        setIsEditing(false);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to user data from database
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      age: user?.age || '',
      bio: user?.bio || '',
      picture: user?.picture || ''
    });
    setIsEditing(false);
    setError('');
  };

  const refreshStats = async () => {
    if (!user?.id && !user?._id) return;

    try {
      setStatsLoading(true);
      const playerId = user.id || user._id;
      console.log('Refreshing stats for player:', playerId);
      
      const response = await leaderboardAPI.getPlayerStats(playerId);
      
      if (response.success) {
        setPlayerStats(response.stats);
        console.log('Player stats refreshed:', response.stats);
        setSuccess('Statistics updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        console.error('Failed to refresh player stats:', response.message);
        setError('Failed to refresh statistics');
      }
    } catch (error) {
      console.error('Error refreshing player stats:', error);
      setError('Failed to refresh statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen p-4 transition-colors ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
    }`}>
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}>
            My Profile
          </h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Manage your account information and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/50">
            <p className="text-green-400 text-center">✓ {success}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/50">
            <p className="text-red-400 text-center">✗ {error}</p>
          </div>
        )}

        <div className={`rounded-2xl p-8 ${
          darkMode
            ? 'glassy'
            : 'bg-white/90 border border-purple-200 shadow-xl'
        }`}>
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {formData.picture ? (
                <img 
                  src={formData.picture} 
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-500"
                />
              ) : (
                <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 border-purple-500 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600'
                }`}>
                  <span className="text-white text-4xl font-bold">
                    {formData.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              
              {isEditing && (
                <label className={`absolute bottom-0 right-0 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                  darkMode 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-purple-500 hover:bg-purple-600'
                } text-white shadow-lg`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <h2 className={`text-2xl font-bold mt-4 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              {formData.name || 'User'}
            </h2>
            
            {user?.provider && (
              <span className={`text-sm px-3 py-1 rounded-full mt-2 ${
                darkMode 
                  ? 'bg-green-600/20 text-green-300' 
                  : 'bg-green-100 text-green-700'
              }`}>
                Connected via {user.provider === 'google' ? 'Google' : user.provider}
              </span>
            )}
          </div>

          {/* Profile Form */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold mb-4 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Basic Information
              </h3>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full p-3 border rounded-lg transition-colors ${
                    isEditing 
                      ? (darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                          : 'bg-white border-purple-200 text-gray-800 focus:border-purple-400')
                      : (darkMode 
                          ? 'bg-gray-800/50 border-gray-700 text-gray-300 cursor-not-allowed' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed')
                  } focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className={`w-full p-3 border rounded-lg cursor-not-allowed ${
                    darkMode 
                      ? 'bg-gray-800/50 border-gray-700 text-gray-400'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}
                />
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="13"
                  max="120"
                  className={`w-full p-3 border rounded-lg transition-colors ${
                    isEditing 
                      ? (darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                          : 'bg-white border-purple-200 text-gray-800 focus:border-purple-400')
                      : (darkMode 
                          ? 'bg-gray-800/50 border-gray-700 text-gray-300 cursor-not-allowed' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed')
                  } focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows="4"
                  maxLength="200"
                  className={`w-full p-3 border rounded-lg transition-colors resize-none ${
                    isEditing 
                      ? (darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500' 
                          : 'bg-white border-purple-200 text-gray-800 focus:border-purple-400')
                      : (darkMode 
                          ? 'bg-gray-800/50 border-gray-700 text-gray-300 cursor-not-allowed' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed')
                  } focus:outline-none`}
                  placeholder="Tell us about yourself..."
                />
                <p className={`text-xs mt-1 text-right ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {formData.bio?.length || 0}/200
                </p>
              </div>
            </div>

            {/* Game Statistics */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold mb-4 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Game Statistics
              </h3>

              {statsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                  <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Loading statistics...
                  </p>
                </div>
              ) : playerStats ? (
                <>
                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-800/50' : 'bg-purple-50'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Total Score
                      </span>
                      <span className={`font-bold text-xl ${
                        darkMode ? 'text-purple-400' : 'text-purple-600'
                      }`}>
                        {playerStats.totalScore || 0}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-800/50' : 'bg-pink-50'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Games Played
                      </span>
                      <span className={`font-bold text-xl ${
                        darkMode ? 'text-pink-400' : 'text-pink-600'
                      }`}>
                        {playerStats.totalGames || 0}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-800/50' : 'bg-green-50'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Average Accuracy
                      </span>
                      <span className={`font-bold text-xl ${
                        darkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        {Math.round(playerStats.averageAccuracy || 0)}%
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-800/50' : 'bg-orange-50'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Best Score
                      </span>
                      <span className={`font-bold text-xl ${
                        darkMode ? 'text-orange-400' : 'text-orange-600'
                      }`}>
                        {playerStats.bestScore || 0}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    darkMode ? 'bg-gray-800/50' : 'bg-blue-50'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                        Average Score
                      </span>
                      <span className={`font-bold text-xl ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}>
                        {Math.round(playerStats.averageScore || 0)}
                      </span>
                    </div>
                  </div>

                  {playerStats.lastPlayed && (
                    <div className={`p-3 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-800/30 border-gray-700' 
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Last Played: {new Date(playerStats.lastPlayed).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={`p-6 rounded-lg text-center ${
                  darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                }`}>
                  <div className="text-4xl mb-2">🎮</div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No game statistics yet
                  </p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Play some games to see your stats!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-3 rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all transform hover:scale-105 shadow-lg"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/leaderboard')}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    darkMode 
                      ? 'border-2 border-purple-500 hover:bg-purple-500 text-purple-400 hover:text-white'
                      : 'border-2 border-purple-600 hover:bg-purple-600 text-purple-600 hover:text-white'
                  }`}
                >
                  View Leaderboard
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`px-8 py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 shadow-lg ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  }`}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                      : (darkMode 
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white')
                  }`}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;