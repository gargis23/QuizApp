import React from 'react';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp.jsx';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import './App.css';

const AppContent = () => {
  const { currentPage, gameState, darkMode } = useApp();

  const renderPage = () => {
    if (gameState.inGame && currentPage === 'quiz') {
      return <Quiz />;
    }

    switch(currentPage) {
      case 'about': return <About />;
      case 'leaderboard': return <Leaderboard />;
      case 'login': return <Login />;
      case 'register': return <Register />;
      case 'quiz': return <Quiz />;
      case 'profile': return <Profile />;
      default: return <Home />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-800'
    }`}>
      <Navbar />
      <main>
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;