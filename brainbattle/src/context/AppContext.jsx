import React, { useState, useEffect, createContext, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [gameState, setGameState] = useState({
    inGame: false,
    currentQuestion: 0,
    score: 0,
    timeLeft: 30,
    powerups: { hint: 3, skip: 2, freeze: 1 },
    questions: [],
    roomCode: null,
    cheatingDetected: 0,
    selectedCategory: null,
    questionsAttempted: 0,
    correctAnswers: 0
  });
  const [userResults, setUserResults] = useState([]);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.setProperty('--bg-primary', '#111827');
      document.documentElement.style.setProperty('--bg-secondary', '#1F2937');
      document.documentElement.style.setProperty('--text-primary', '#ffffff');
      document.documentElement.style.setProperty('--text-secondary', '#9CA3AF');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.setProperty('--bg-primary', '#F6F4FF');
      document.documentElement.style.setProperty('--bg-secondary', '#F0EBFF');
      document.documentElement.style.setProperty('--text-primary', '#1E1E2F');
      document.documentElement.style.setProperty('--text-secondary', '#4B4B65');
    }
    
    localStorage.setItem('darkMode', newDarkMode);
  };

  const login = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const updateUserProfile = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('home');
    setGameState(prev => ({
      ...prev,
      inGame: false,
      currentQuestion: 0,
      score: 0,
      timeLeft: 30,
      powerups: { hint: 3, skip: 2, freeze: 1 },
      questions: [],
      roomCode: null,
      cheatingDetected: 0,
      questionsAttempted: 0,
      correctAnswers: 0
    }));
  };

  const addUserResult = (result) => {
    const newResult = {
      ...result,
      userId: user?.email || 'anonymous',
      userName: user?.name || 'Anonymous',
      timestamp: new Date().toISOString()
    };
    
    const updatedResults = [...userResults, newResult];
    setUserResults(updatedResults);
    localStorage.setItem('userResults', JSON.stringify(updatedResults));
  };

  // Google Sign-In function
  const signInWithGoogle = () => {
    // Simulate Google OAuth flow
    const mockGoogleUser = {
      name: "John Doe",
      email: "johndoe@gmail.com",
      picture: "https://via.placeholder.com/150/8B5CF6/FFFFFF?text=JD",
      provider: "google"
    };
    
    login(mockGoogleUser);
    setCurrentPage('home');
  };

  useEffect(() => {
    // Load saved theme
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const isDark = JSON.parse(savedDarkMode);
      setDarkMode(isDark);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
        toggleTheme(); // Apply light mode styles
      }
    }

    // Load saved user
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setUser(userData);
    }

    // Load user results
    const savedResults = localStorage.getItem('userResults');
    if (savedResults) {
      setUserResults(JSON.parse(savedResults));
    }
  }, []);

  // Anti-cheating detection
  useEffect(() => {
    if (gameState.inGame) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          setGameState(prev => ({
            ...prev,
            cheatingDetected: prev.cheatingDetected + 1,
            timeLeft: Math.max(0, prev.timeLeft - 10)
          }));
          
          // Custom popup instead of alert
          showPopup('⚠️ Tab switching detected! 10 seconds penalty applied.', 'warning');
        }
      };

      const handleCopyPaste = (e) => {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'v')) {
          e.preventDefault();
          showPopup('🚫 Copy-paste is disabled during the quiz!', 'error');
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('keydown', handleCopyPaste);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('keydown', handleCopyPaste);
      };
    }
  }, [gameState.inGame]);

  // Custom popup function
  const showPopup = (message, type = 'info') => {
    const popup = document.createElement('div');
    popup.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm animate-popup ${
      type === 'success' ? 'bg-green-600 text-white' :
      type === 'warning' ? 'bg-yellow-600 text-white' :
      type === 'error' ? 'bg-red-600 text-white' :
      darkMode ? 'bg-gray-800 text-white border border-purple-500' : 'bg-white text-gray-800 border border-purple-300'
    }`;
    
    popup.innerHTML = `
      <div class="flex items-center justify-between">
        <span>${message}</span>
        <button class="ml-4 text-lg font-bold" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (popup.parentElement) {
        popup.remove();
      }
    }, 5000);
  };

  return (
    <AppContext.Provider value={{
      darkMode, setDarkMode, toggleTheme,
      isLoggedIn, setIsLoggedIn, login, logout, signInWithGoogle,
      currentPage, setCurrentPage,
      user, setUser, updateUserProfile,
      gameState, setGameState,
      userResults, setUserResults, addUserResult,
      showPopup
    }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext };