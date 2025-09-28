import React from 'react';

const About = () => {
  const features = [
    {
      title: "Real-Time Multiplayer",
      description: "Challenge friends and players worldwide in live quiz battles with instant scoring and leaderboards. Connect with players across the globe and compete in real-time matches that test your knowledge and speed.",
      image: "🌐",
      side: "left"
    },
    {
      title: "Anti-Cheating Technology",
      description: "Advanced detection system monitors tab switching and prevents copy-paste, ensuring fair play for everyone. Our sophisticated monitoring keeps the competition honest and maintains integrity across all matches.",
      image: "🛡️",
      side: "right"
    },
    {
      title: "Strategic Powerups",
      description: "Use hints, skip questions, or freeze time strategically. Limited powerups add depth to your quiz strategy, allowing you to save difficult situations and maximize your scoring potential.",
      image: "⚡",
      side: "left"
    },
    {
      title: "Private Room System",
      description: "Create custom rooms with unique codes. Play with friends, classmates, or colleagues in private battles. Share your room code and enjoy exclusive matches with your selected group.",
      image: "🏠",
      side: "right"
    },
    {
      title: "Diverse Categories",
      description: "Test knowledge across Movies, Music, Current Affairs, History, and Food. Something for every trivia lover! Each category features carefully curated questions that challenge different aspects of your knowledge.",
      image: "🎭",
      side: "left"
    },
    {
      title: "Live Chat Integration",
      description: "Communicate with other players during matches using our built-in websocket-powered chat system. Share reactions, encourage competitors, and build a community around your quiz battles.",
      image: "💬",
      side: "right"
    },
    {
      title: "Dynamic Scoring",
      description: "Earn points based on accuracy and speed. Faster correct answers yield bonus points for competitive edge. The scoring system rewards both knowledge and quick thinking to determine the ultimate champion.",
      image: "🏆",
      side: "left"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            About BrainBattle
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The ultimate multiplayer quiz platform designed to challenge minds, prevent cheating, and create unforgettable competitive experiences.
          </p>
        </div>

        {/* Features Section - Zigzag Layout */}
        <div className="space-y-16">
          {features.map((feature, index) => (
            <div key={index} className={`flex items-center gap-12 ${feature.side === 'right' ? 'flex-row-reverse' : ''} lg:flex-row flex-col`}>
              {/* Content Side */}
              <div className="flex-1">
                <div className="glassy rounded-2xl p-8 hover:bg-gradient-to-br hover:from-purple-600/10 hover:to-pink-600/10 transition-all duration-300">
                  <div className="text-6xl mb-4">{feature.image}</div>
                  <h3 className="text-3xl font-bold text-purple-400 mb-4">{feature.title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{feature.description}</p>
                  
                  {/* Feature highlights based on title */}
                  <div className="mt-6">
                    {feature.title === "Real-Time Multiplayer" && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">Instant Matching</span>
                        <span className="px-3 py-1 bg-pink-600/20 text-pink-300 rounded-full text-sm">Global Players</span>
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">Live Scoring</span>
                      </div>
                    )}
                    
                    {feature.title === "Anti-Cheating Technology" && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-red-600/20 text-red-300 rounded-full text-sm">Tab Detection</span>
                        <span className="px-3 py-1 bg-orange-600/20 text-orange-300 rounded-full text-sm">Copy-Paste Block</span>
                        <span className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm">Fair Play</span>
                      </div>
                    )}
                    
                    {feature.title === "Strategic Powerups" && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">💡 Hints (3)</span>
                        <span className="px-3 py-1 bg-yellow-600/20 text-yellow-300 rounded-full text-sm">⏭️ Skip (2)</span>
                        <span className="px-3 py-1 bg-cyan-600/20 text-cyan-300 rounded-full text-sm">❄️ Freeze (1)</span>
                      </div>
                    )}
                    
                    {feature.title === "Private Room System" && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">6-Digit Codes</span>
                        <span className="px-3 py-1 bg-pink-600/20 text-pink-300 rounded-full text-sm">Custom Rooms</span>
                        <span className="px-3 py-1 bg-indigo-600/20 text-indigo-300 rounded-full text-sm">Private Battles</span>
                      </div>
                    )}
                    
                    {feature.title === "Diverse Categories" && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-red-600/20 text-red-300 rounded-full text-sm">🎬 Movies</span>
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">🎵 Music</span>
                        <span className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm">📰 Current Affairs</span>
                        <span className="px-3 py-1 bg-yellow-600/20 text-yellow-300 rounded-full text-sm">🏛️ History</span>
                        <span className="px-3 py-1 bg-orange-600/20 text-orange-300 rounded-full text-sm">🍽️ Food</span>
                      </div>
                    )}
                    
                    {feature.title === "Live Chat Integration" && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm">WebSocket</span>
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">Real-time</span>
                        <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm">Community</span>
                      </div>
                    )}
                    
                    {feature.title === "Dynamic Scoring" && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm">Speed Bonus</span>
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm">Accuracy Points</span>
                        <span className="px-3 py-1 bg-yellow-600/20 text-yellow-300 rounded-full text-sm">Time Multiplier</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Visual Side */}
              <div className="flex-1">
                <div className={`h-64 md:h-80 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30 flex items-center justify-center relative overflow-hidden ${feature.side === 'left' ? 'zigzag-right' : 'zigzag-left'}`}>
                  <div className="text-8xl opacity-50 z-10">{feature.image}</div>
                  
                  {/* Animated background elements */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                  <div className="absolute top-4 left-4 w-12 h-12 bg-purple-500/20 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-6 right-6 w-8 h-8 bg-pink-500/20 rounded-full animate-pulse delay-1000"></div>
                  <div className="absolute top-1/2 right-8 w-6 h-6 bg-blue-500/20 rounded-full animate-pulse delay-500"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-20 glassy rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-purple-400 mb-8">Why Choose BrainBattle?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-purple-600/10 to-transparent hover:from-purple-600/20 transition-all duration-300">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white">Focused Learning</h3>
              <p className="text-gray-400">Each question is carefully selected to challenge and educate, making learning fun and engaging.</p>
              <div className="flex justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-pink-600/10 to-transparent hover:from-pink-600/20 transition-all duration-300">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white">Fast-Paced Action</h3>
              <p className="text-gray-400">30-second timers keep the adrenaline pumping and maintain an exciting pace throughout the game.</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                <div className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full w-3/4 animate-pulse"></div>
              </div>
            </div>
            
            <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-blue-600/10 to-transparent hover:from-blue-600/20 transition-all duration-300">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-white">Fair Competition</h3>
              <p className="text-gray-400">Advanced anti-cheating measures ensure everyone plays on a level field for genuine competition.</p>
              <div className="flex justify-center items-center space-x-1 mt-4">
                <div className="w-3 h-8 bg-blue-400/60 rounded"></div>
                <div className="w-3 h-6 bg-blue-400/80 rounded"></div>
                <div className="w-3 h-10 bg-blue-400 rounded"></div>
                <div className="w-3 h-4 bg-blue-400/70 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid md:grid-cols-4 gap-6">
          <div className="glassy rounded-xl p-6 text-center hover:bg-purple-600/10 transition-all duration-300">
            <div className="text-4xl font-bold text-purple-400 mb-2">100+</div>
            <div className="text-gray-400">Questions Per Category</div>
          </div>
          <div className="glassy rounded-xl p-6 text-center hover:bg-pink-600/10 transition-all duration-300">
            <div className="text-4xl font-bold text-pink-400 mb-2">30s</div>
            <div className="text-gray-400">Per Question Timer</div>
          </div>
          <div className="glassy rounded-xl p-6 text-center hover:bg-green-600/10 transition-all duration-300">
            <div className="text-4xl font-bold text-green-400 mb-2">6</div>
            <div className="text-gray-400">Character Room Codes</div>
          </div>
          <div className="glassy rounded-xl p-6 text-center hover:bg-yellow-600/10 transition-all duration-300">
            <div className="text-4xl font-bold text-yellow-400 mb-2">∞</div>
            <div className="text-gray-400">Possibilities to Learn</div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mt-16 glassy rounded-2xl p-8">
          <h3 className="text-3xl font-bold text-purple-400 mb-6 text-center">Built with Modern Technology</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="text-4xl">⚛️</div>
              <h4 className="font-semibold text-white">React</h4>
              <p className="text-sm text-gray-400">Modern UI Framework</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl">🎨</div>
              <h4 className="font-semibold text-white">Tailwind CSS</h4>
              <p className="text-sm text-gray-400">Utility-First Styling</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl">🔗</div>
              <h4 className="font-semibold text-white">WebSocket</h4>
              <p className="text-sm text-gray-400">Real-time Communication</p>
            </div>
            <div className="text-center space-y-3">
              <div className="text-4xl">🛡️</div>
              <h4 className="font-semibold text-white">Security</h4>
              <p className="text-sm text-gray-400">Anti-cheat Protection</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="glassy rounded-2xl p-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              Ready to Challenge Your Mind?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of players worldwide and test your knowledge across multiple categories in our competitive quiz platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105">
                Start Playing Now
              </button>
              <button className="border-2 border-purple-500 hover:bg-purple-500 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105">
                View Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;