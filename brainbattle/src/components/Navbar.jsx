import React from 'react';
import { useApp } from '../context/useApp.jsx';

const Navbar = () => {
  const { darkMode, toggleTheme, isLoggedIn, logout, currentPage, setCurrentPage, user } = useApp();

  return (
    <nav className={`backdrop-blur-md border-b sticky top-0 z-50 transition-colors ${
      darkMode 
        ? 'bg-gray-800/90 border-gray-700' 
        : 'bg-white/90 border-purple-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="logo-hover cursor-pointer flex items-center space-x-2" onClick={() => setCurrentPage('home')}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600'
              }`}>
                <span className="text-white font-bold text-xl">BB</span>
              </div>
              <span className={`text-2xl font-bold transition-colors ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
              }`}>
                BrainBattle
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'home' 
                  ? (darkMode ? 'text-purple-400' : 'text-purple-600') 
                  : (darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800')
              }`}
            >
              Home
            </button>
            <button 
              onClick={() => setCurrentPage('about')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'about' 
                  ? (darkMode ? 'text-purple-400' : 'text-purple-600') 
                  : (darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800')
              }`}
            >
              About
            </button>
            <button 
              onClick={() => setCurrentPage('leaderboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'leaderboard' 
                  ? (darkMode ? 'text-purple-400' : 'text-purple-600') 
                  : (darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800')
              }`}
            >
              Leaderboard
            </button>
            
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setCurrentPage('profile')}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  {user?.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      darkMode 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-r from-purple-600 to-pink-600'
                    }`}>
                      <span className="text-white text-sm font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <span className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Hi, {user?.name || 'User'}
                  </span>
                </button>
                <button 
                  onClick={logout}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    darkMode 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setCurrentPage('login')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Login
              </button>
            )}
            
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-purple-100 hover:bg-purple-200'
              }`}
            >
              {darkMode ? (
                // Sun icon for light mode
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                // Moon icon for dark mode
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;