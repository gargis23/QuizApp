import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const About = () => {
  const navigate = useNavigate();
  const { darkMode, isLoggedIn } = useApp();
  
  const features = [
    {
      title: "Real-Time Multiplayer",
      description: "Challenge friends and players worldwide in live quiz battles with instant scoring and leaderboards. Connect with players across the globe and compete in real-time matches that test your knowledge and speed.",
      icon: "🌐",
      tags: [
        { text: "Instant Matching", color: "purple" },
        { text: "Global Players", color: "pink" },
        { text: "Live Scoring", color: "blue" }
      ]
    },
    {
      title: "Anti-Cheating Technology",
      description: "Advanced detection system monitors tab switching and prevents copy-paste, ensuring fair play for everyone. Our sophisticated monitoring keeps the competition honest and maintains integrity across all matches.",
      icon: "🛡️",
      tags: [
        { text: "Tab Detection", color: "red" },
        { text: "Copy-Paste Block", color: "orange" },
        { text: "Fair Play", color: "green" }
      ]
    },
    {
      title: "Strategic Powerups",
      description: "Use hints, skip questions, or freeze time strategically. Limited powerups add depth to your quiz strategy, allowing you to save difficult situations and maximize your scoring potential.",
      icon: "⚡",
      tags: [
        { text: "Hints", color: "blue" },
        { text: "Skip", color: "yellow" },
        { text: "Freeze", color: "cyan" }
      ]
    },
    {
      title: "Private Room System",
      description: "Create custom rooms with unique codes. Play with friends, classmates, or colleagues in private battles. Share your room code and enjoy exclusive matches with your selected group.",
      icon: "🏠",
      tags: [
        { text: "6-Digit Codes", color: "purple" },
        { text: "Custom Rooms", color: "pink" },
        { text: "Private Battles", color: "indigo" }
      ]
    },
    {
      title: "Diverse Categories",
      description: "Test knowledge across Movies, Music, Current Affairs, History, and Food. Something for every trivia lover! Each category features carefully curated questions that challenge different aspects of your knowledge.",
      icon: "🎭",
      tags: [
        { text: "Movies", color: "red" },
        { text: "Music", color: "blue" },
        { text: "History", color: "yellow" }
      ]
    },
    {
      title: "Dynamic Scoring",
      description: "Earn points based on accuracy and speed. Faster correct answers yield bonus points for competitive edge. The scoring system rewards both knowledge and quick thinking to determine the ultimate champion.",
      icon: "🏆",
      tags: [
        { text: "Speed Bonus", color: "green" },
        { text: "Accuracy Points", color: "blue" },
        { text: "Time Multiplier", color: "yellow" }
      ]
    }
  ];

  const getTagClasses = (color) => {
    const colorMap = {
      purple: darkMode ? 'border-purple-500 text-purple-400' : 'border-purple-600 text-purple-700 bg-purple-50',
      pink: darkMode ? 'border-pink-500 text-pink-400' : 'border-pink-600 text-pink-700 bg-pink-50',
      blue: darkMode ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-700 bg-blue-50',
      red: darkMode ? 'border-red-500 text-red-400' : 'border-red-600 text-red-700 bg-red-50',
      orange: darkMode ? 'border-orange-500 text-orange-400' : 'border-orange-600 text-orange-700 bg-orange-50',
      green: darkMode ? 'border-green-500 text-green-400' : 'border-green-600 text-green-700 bg-green-50',
      yellow: darkMode ? 'border-yellow-500 text-yellow-400' : 'border-yellow-600 text-yellow-700 bg-yellow-50',
      cyan: darkMode ? 'border-cyan-500 text-cyan-400' : 'border-cyan-600 text-cyan-700 bg-cyan-50',
      indigo: darkMode ? 'border-indigo-500 text-indigo-400' : 'border-indigo-600 text-indigo-700 bg-indigo-50'
    };
    return colorMap[color] || colorMap.purple;
  };

  const handleStartPlaying = () => {
    if (isLoggedIn) {
      navigate('/quiz');
    } else {
      navigate('/login');
    }
  };

  const handleViewLeaderboard = () => {
    navigate('/leaderboard');
  };

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
              : 'text-gray-900'
          }`}>
            About BrainBattle
          </h1>
          <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            The ultimate multiplayer quiz platform designed to challenge minds, prevent cheating, and create unforgettable competitive experiences.
          </p>
        </div>

        {/* Features Section - 2x3 Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`p-8 rounded-2xl transition-all duration-300 ${
                darkMode 
                  ? 'glassy hover:bg-gradient-to-br hover:from-purple-600/10 hover:to-pink-600/10' 
                  : 'bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl'
              }`}
            >
              <div className="text-6xl mb-4">{feature.icon}</div>
              <h3 className={`text-2xl font-bold mb-4 ${
                darkMode ? 'text-purple-400' : 'text-gray-900'
              }`}>
                {feature.title}
              </h3>
              <p className={`text-lg leading-relaxed mb-6 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {feature.description}
              </p>
              
              {/* Feature Tags with Colored Outlines */}
              <div className="flex flex-wrap gap-2">
                {feature.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex}
                    className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getTagClasses(tag.color)}`}
                  >
                    {tag.text}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Why Choose Section */}
        <div className={`rounded-2xl p-12 text-center mb-16 ${
          darkMode 
            ? 'glassy' 
            : 'bg-white border-2 border-purple-200'
        }`}>
          <h2 className={`text-4xl font-bold mb-8 ${
            darkMode ? 'text-purple-400' : 'text-gray-900'
          }`}>
            Why Choose BrainBattle?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`space-y-4 p-6 rounded-xl transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-br from-purple-600/10 to-transparent hover:from-purple-600/20' 
                : 'bg-purple-50 hover:bg-purple-100 border-2 border-purple-200'
            }`}>
              <div className="text-5xl mb-4">🎯</div>
              <h3 className={`text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Focused Learning
              </h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-700'}>
                Each question is carefully selected to challenge and educate, making learning fun and engaging.
              </p>
            </div>
            
            <div className={`space-y-4 p-6 rounded-xl transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-br from-pink-600/10 to-transparent hover:from-pink-600/20' 
                : 'bg-pink-50 hover:bg-pink-100 border-2 border-pink-200'
            }`}>
              <div className="text-5xl mb-4">🚀</div>
              <h3 className={`text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Fast-Paced Action
              </h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-700'}>
                30-second timers keep the adrenaline pumping and maintain an exciting pace throughout the game.
              </p>
            </div>
            
            <div className={`space-y-4 p-6 rounded-xl transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-br from-blue-600/10 to-transparent hover:from-blue-600/20' 
                : 'bg-blue-50 hover:bg-blue-100 border-2 border-blue-200'
            }`}>
              <div className="text-5xl mb-4">🤝</div>
              <h3 className={`text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Fair Competition
              </h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-700'}>
                Advanced anti-cheating measures ensure everyone plays on a level field for genuine competition.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {[
            { value: "20", label: "Questions Per Category", color: "purple" },
            { value: "30s", label: "Per Question Timer", color: "pink" },
            { value: "6", label: "Character Room Codes", color: "green" },
            { value: "∞", label: "Possibilities to Learn", color: "yellow" }
          ].map((stat, index) => (
            <div 
              key={index}
              className={`rounded-xl p-6 text-center transition-all duration-300 ${
                darkMode 
                  ? `glassy hover:bg-${stat.color}-600/10` 
                  : `bg-white border-2 border-${stat.color}-200 hover:border-${stat.color}-400 hover:shadow-lg`
              }`}
            >
              <div className={`text-4xl font-bold mb-2 ${
                darkMode ? `text-${stat.color}-400` : `text-${stat.color}-600`
              }`}>
                {stat.value}
              </div>
              <div className={darkMode ? 'text-gray-400' : 'text-gray-700'}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`rounded-2xl p-12 text-center ${
          darkMode 
            ? 'glassy' 
            : 'bg-white border-2 border-purple-200'
        }`}>
          <h2 className={`text-4xl font-bold mb-6 ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
              : 'text-gray-900'
          }`}>
            Ready to Challenge Your Mind?
          </h2>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Join thousands of players worldwide and test your knowledge across multiple categories in our competitive quiz platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleStartPlaying}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg ${
                darkMode 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              Start Playing Now
            </button>
            <button 
              onClick={handleViewLeaderboard}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 ${
                darkMode 
                  ? 'border-2 border-purple-500 hover:bg-purple-500 text-purple-400 hover:text-white'
                  : 'border-2 border-purple-600 hover:bg-purple-600 text-purple-600 hover:text-white'
              }`}
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;