import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import RoomLobby from './pages/RoomLobby';
import WaitingPage from './pages/WaitingPage';
import AvailableRooms from './pages/AvailableRooms';
import AuthCallback from './pages/AuthCallback';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { darkMode } = useApp();

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode
        ? 'bg-gray-900 text-white'
        : 'bg-gray-50 text-gray-800'
    }`}>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/lobby" element={<ProtectedRoute><RoomLobby /></ProtectedRoute>} />
          <Route path="/waiting" element={<ProtectedRoute><WaitingPage /></ProtectedRoute>} />
          {/* <Route path="/rooms" element={<ProtectedRoute><AvailableRooms /></ProtectedRoute>} /> */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
