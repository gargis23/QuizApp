import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/api';
import socketClient from '../socket/socketClient';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState({
    roomCode: null,
    selectedCategory: null,
    currentQuestion: 0,
    score: 0,
    answers: [],
    questions: [],
    timeRemaining: 15,
    timeLeft: 30,
    inGame: false,
    gameStarting: false,
    waitingForHost: false,
    questionsAttempted: 0,
    correctAnswers: 0,
    cheatingDetected: 0,
    powerups: {
      hint: 3,
      skip: 2,
      freeze: 1
    }
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const response = await authAPI.getMe();
        if (response.data.success) {
          const userData = response.data.data.user;
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Connect socket when user is authenticated
          socketClient.connect(userData.id, token);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Connect socket on login
    socketClient.connect(userData.id, token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Disconnect socket on logout
    socketClient.disconnect();
    
    setGameState({
      roomCode: null,
      selectedCategory: null,
      currentQuestion: 0,
      score: 0,
      answers: [],
      questions: [],
      timeRemaining: 15,
      timeLeft: 30,
      inGame: false,
      gameStarting: false,
      waitingForHost: false,
      questionsAttempted: 0,
      correctAnswers: 0,
      cheatingDetected: 0,
      powerups: {
        hint: 3,
        skip: 2,
        freeze: 1
      }
    });
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const resetGameState = () => {
    setGameState({
      roomCode: null,
      selectedCategory: null,
      currentQuestion: 0,
      score: 0,
      answers: [],
      questions: [],
      timeRemaining: 15,
      timeLeft: 30,
      inGame: false,
      gameStarting: false,
      waitingForHost: false,
      questionsAttempted: 0,
      correctAnswers: 0,
      cheatingDetected: 0,
      powerups: {
        hint: 3,
        skip: 2,
        freeze: 1
      }
    });
  };

  const showPopup = (message, type = 'info') => {
    if (!message) return;
    
    // Create a simple toast notification
    const popup = document.createElement('div');
    popup.className = `fixed top-4 right-4 z-50 p-4 rounded-lg max-w-sm transform transition-all duration-300 translate-x-0 shadow-lg`;
    
    // Style based on type
    let bgColor, textColor, icon;
    switch(type) {
      case 'error':
        bgColor = 'bg-red-500';
        textColor = 'text-white';
        icon = '❌';
        break;
      case 'success':
        bgColor = 'bg-green-500';
        textColor = 'text-white';
        icon = '✅';
        break;
      case 'info':
        bgColor = 'bg-blue-500';
        textColor = 'text-white';
        icon = 'ℹ️';
        break;
      default:
        bgColor = 'bg-purple-500';
        textColor = 'text-white';
        icon = '📝';
    }
    
    popup.className += ` ${bgColor} ${textColor}`;
    popup.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-lg">${icon}</span>
        <span class="font-medium">${String(message).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (popup.parentNode) {
        popup.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
          }
        }, 300);
      }
    }, 3000);
  };

  const value = {
    user,
    setUser,
    darkMode,
    toggleDarkMode,
    loading,
    login,
    logout,
    gameState,
    setGameState,
    resetGameState,
    showPopup
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};