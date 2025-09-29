import React from 'react';
import { useApp } from '../context/useApp.jsx';

const About = () => {
  const { darkMode, isLoggedIn, setCurrentPage } = useApp();
  
  const features = [
    {
      title: "Real-Time Multiplayer",
      description: "Challenge friends and players worldwide in live quiz battles with instant scoring and leaderboards. Connect with players across the globe and compete in real-time matches that test your knowledge and speed.",
      icon: "🌐",
      tags: ["Instant Matching", "Global Players", "Live Scoring"]
    },
    {
      title: "Anti-Cheating Technology",
      description: "Advanced detection system monitors tab switching and prevents copy-paste, ensuring fair play for everyone. Our sophisticated monitoring keeps the competition honest and maintains integrity across all matches.",
      icon: "🛡️",
      tags: ["Tab Detection", "Copy-Paste Block", "Fair Play"]
    },
    {
      title: "Strategic Powerups",
      description: "Use hints, skip questions, or freeze time strategically. Limited powerups add depth to your quiz strategy, allowing you to save difficult situations and maximize your scoring potential.",
      icon: "⚡",
      tags: ["💡 Hints (3)", "⏭️ Skip (2)", "❄️ Freeze (1)"]
    },
    {
      title: "Private Room System",
      description: "Create custom rooms with unique codes. Play with friends, classmates, or colleagues in private battles. Share your room code and enjoy exclusive matches with your selected group.",
      icon: "🏠",
      tags: ["6-Digit Codes", "Custom Rooms", "Private Battles"]
    },
    {
      title: "Diverse Categories",
      description: "Test knowledge across Movies, Music, Current Affairs, History, and Food. Something for every trivia lover! Each category features carefully curated questions that challenge different aspects of your knowledge.",
      icon: "🎭",
      tags: ["🎬 Movies", "🎵 Music", "📰 Current Affairs", "🏛️ History", "🍽️ Food"]
    },
    {
      title: "Dynamic Scoring",
      description: "Earn points based on accuracy and speed. Faster correct answers yield bonus points for competitive edge. The scoring system rewards both knowledge and quick thinking to determine the ultimate champion.",
      icon: "🏆",
      tags: ["Speed Bonus", "Accuracy Points", "Time Multiplier"]
    }
  ];

  const handleStartPlaying = () => {
    if (isLoggedIn) {
      setCurrentPage('quiz');
    } else {
      setCurrentPage('login');
    }
  };

  const handleViewLeaderboard = () => {
    setCurrentPage('leaderboard');
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
              : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}>
            About BrainBattle
          </h1>
          <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
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
                  : 'bg-white/80 border border-purple-100 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-pink-50/50 hover:border-purple-200'
              }`}
            >
              <div className="text-6xl mb-4">{feature.icon}</div>
              <h3 className={`text-2xl font-bold mb-4 ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {feature.title}
              </h3>
              <p className={`text-lg leading-relaxed mb-6 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {feature.description}
              </p>
              
              {/* Feature Tags */}
              <div className="flex flex-wrap gap-2">
                {feature.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex}
                    className={`px-3 py-1 rounded-full text-sm ${
                      darkMode 
                        ? `bg-${['purple', 'pink', 'blue'][tagIndex % 3]}-600/20 text-${['purple', 'pink', 'blue'][tagIndex % 3]}-300`
                        : `bg-${['purple', 'pink', 'blue'][tagIndex % 3]}-100 text-${['purple', 'pink', 'blue'][tagIndex % 3]}-700`
                    }`}
                  >
                    {tag}
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
            : 'bg-white/80 border border-purple-100'
        }`}>
          <h2 className={`text-4xl font-bold mb-8 ${
            darkMode ? 'text-purple-400' : 'text-purple-600'
          }`}>
            Why Choose BrainBattle?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`space-y-4 p-6 rounded-xl transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-br from-purple-600/10 to-transparent hover:from-purple-600/20' 
                : 'bg-gradient-to-br from-purple-50 to-transparent hover:from-purple-100'
            }`}>
              <div className="text-5xl mb-4">🎯</div>
              <h3 className={`text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Focused Learning
              </h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Each question is carefully selected to challenge and educate, making learning fun and engaging.
              </p>
            </div>
            
            <div className={`space-y-4 p-6 rounded-xl transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-br from-pink-600/10 to-transparent hover:from-pink-600/20' 
                : 'bg-gradient-to-br from-pink-50 to-transparent hover:from-pink-100'
            }`}>
              <div className="text-5xl mb-4">🚀</div>
              <h3 className={`text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Fast-Paced Action
              </h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                30-second timers keep the adrenaline pumping and maintain an exciting pace throughout the game.
              </p>
            </div>
            
            <div className={`space-y-4 p-6 rounded-xl transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-br from-blue-600/10 to-transparent hover:from-blue-600/20' 
                : 'bg-gradient-to-br from-blue-50 to-transparent hover:from-blue-100'
            }`}>
              <div className="text-5xl mb-4">🤝</div>
              <h3 className={`text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Fair Competition
              </h3>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
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
                  : `bg-white/80 border border-purple-100 hover:bg-${stat.color}-50`
              }`}
            >
              <div className={`text-4xl font-bold mb-2 ${
                darkMode ? `text-${stat.color}-400` : `text-${stat.color}-600`
              }`}>
                {stat.value}
              </div>
              <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`rounded-2xl p-12 text-center ${
          darkMode 
            ? 'glassy' 
            : 'bg-white/80 border border-purple-100'
        }`}>
          <h2 className={`text-4xl font-bold mb-6 ${
            darkMode 
              ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
          }`}>
            Ready to Challenge Your Mind?
          </h2>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Join thousands of players worldwide and test your knowledge across multiple categories in our competitive quiz platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleStartPlaying}
              className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 ${
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
                  : 'border-2 border-purple-500 hover:bg-purple-500 text-purple-600 hover:text-white'
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