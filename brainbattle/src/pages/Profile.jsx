import React, { useState } from 'react';
import { useApp } from '../context/useApp';

const Profile = () => {
  const { user, updateUserProfile, darkMode, setCurrentPage } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    bio: user?.bio || '',
    picture: user?.picture || ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, picture: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateUserProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      age: user?.age || '',
      bio: user?.bio || '',
      picture: user?.picture || ''
    });
    setIsEditing(false);
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
                } text-white`}>
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
                        ? 'bg-gray-800 border-gray-700 text-gray-300'
                        : 'bg-gray-50 border-gray-200 text-gray-600')
                  } focus:outline-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={true} // Email should not be editable
                  className={`w-full p-3 border rounded-lg ${
                    darkMode 
                      ? 'bg-gray-800 border-gray-700 text-gray-300'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  } cursor-not-allowed`}
                />
                <p className={`text-xs mt-1 ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Age (Optional)
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  min="13"
                  max="100"
                  className={`w-full p-3 border rounded-lg transition-colors ${
                    isEditing 
                      ? (darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                        : 'bg-white border-purple-200 text-gray-800 focus:border-purple-400')
                      : (darkMode 
                        ? 'bg-gray-800 border-gray-700 text-gray-300'
                        : 'bg-gray-50 border-gray-200 text-gray-600')
                  } focus:outline-none`}
                  placeholder="Enter your age"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className={`text-lg font-semibold mb-4 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Additional Information
              </h3>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Bio (Optional)
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
                        ? 'bg-gray-800 border-gray-700 text-gray-300'
                        : 'bg-gray-50 border-gray-200 text-gray-600')
                  } focus:outline-none`}
                  placeholder="Tell us a bit about yourself..."
                />
                <p className={`text-xs mt-1 text-right ${
                  darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {formData.bio.length}/200 characters
                </p>
              </div>

              {/* Quiz Stats */}
              <div className={`p-4 rounded-lg ${
                darkMode ? 'bg-gray-800/50' : 'bg-purple-50'
              }`}>
                <h4 className={`font-semibold mb-3 ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  Quiz Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Games Played:</span>
                    <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {user?.gamesPlayed || 0}
                    </div>
                  </div>
                  <div>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Best Score:</span>
                    <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {user?.bestScore || 0}
                    </div>
                  </div>
                  <div>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Accuracy:</span>
                    <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {user?.accuracy || 0}%
                    </div>
                  </div>
                  <div>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Rank:</span>
                    <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      #{user?.rank || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    darkMode 
                      ? 'border-2 border-gray-500 text-gray-300 hover:bg-gray-700'
                      : 'border-2 border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className={`px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                  darkMode 
                    ? 'border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white'
                    : 'border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white'
                }`}
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Back to Home Button */}
          <div className="text-center mt-6">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-purple-400'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;