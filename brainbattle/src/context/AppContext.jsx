import React, { useState, useEffect, createContext } from 'react';

export const AppContext = createContext();

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
    selectedCategory: null
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const login = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
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
      cheatingDetected: 0
    }));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setUser(userData);
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
          alert('Tab switching detected! 10 seconds penalty applied.');
        }
      };

      const handleCopyPaste = (e) => {
        if (e.ctrlKey && (e.key === 'c' || e.key === 'v')) {
          e.preventDefault();
          alert('Copy-paste is disabled during the quiz!');
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

  return (
    <AppContext.Provider value={{
      darkMode, setDarkMode, toggleTheme,
      isLoggedIn, setIsLoggedIn, login, logout,
      currentPage, setCurrentPage,
      user, setUser,
      gameState, setGameState
    }}>
      {children}
    </AppContext.Provider>
  );
};

// useApp hook moved to a separate file for Fast Refresh compatibility