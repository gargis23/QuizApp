import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp.jsx';
import { quizQuestions } from '../data/QuizQuestions.jsx';

const Quiz = () => {
  const { gameState, setGameState, setCurrentPage } = useApp();
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const categories = ['Movies', 'Music', 'Current Affairs', 'History', 'Food'];

  useEffect(() => {
    if (!gameState.inGame && !selectedCategory) {
      // Quiz setup phase
      return;
    }

    if (selectedCategory && !gameState.inGame) {
      // Initialize quiz with selected category
      const categoryQuestions = quizQuestions[selectedCategory];
      const shuffledQuestions = categoryQuestions.sort(() => Math.random() - 0.5).slice(0, 20);
      
      setGameState(prev => ({
        ...prev,
        inGame: true,
        questions: shuffledQuestions,
        currentQuestion: 0,
        score: 0,
        timeLeft: 30,
        powerups: { hint: 3, skip: 2, freeze: 1 },
        cheatingDetected: 0,
        selectedCategory
      }));
    }
  }, [selectedCategory, gameState.inGame, setGameState]);

  useEffect(() => {
    if (gameState.questions.length > 0 && gameState.currentQuestion < gameState.questions.length) {
      setCurrentQuestionData(gameState.questions[gameState.currentQuestion]);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }
  }, [gameState.currentQuestion, gameState.questions]);

  useEffect(() => {
    if (gameState.inGame && gameState.timeLeft > 0 && !showAnswer) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState.timeLeft === 0 && !showAnswer) {
      // Time's up
      setShowAnswer(true);
      setTimeout(() => nextQuestion(), 2000);
    }
  }, [gameState.timeLeft, gameState.inGame, showAnswer, setGameState]);

  const selectCategory = (category) => {
    setSelectedCategory(category);
  };

  const answerQuestion = (selectedIndex) => {
    if (showAnswer) return;

    setSelectedAnswer(selectedIndex);
    setShowAnswer(true);

    const isCorrect = selectedIndex === currentQuestionData.correct;
    const timeBonus = Math.floor(gameState.timeLeft / 3);
    const scoreIncrease = isCorrect ? currentQuestionData.points + timeBonus : 0;

    setGameState(prev => ({
      ...prev,
      score: prev.score + scoreIncrease
    }));

    setTimeout(() => nextQuestion(), 2000);
  };

  const nextQuestion = () => {
    if (gameState.currentQuestion + 1 >= gameState.questions.length) {
      endQuiz();
    } else {
      setGameState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        timeLeft: 30
      }));
    }
  };

  const endQuiz = () => {
    setGameState(prev => ({ 
      ...prev, 
      inGame: false,
      selectedCategory: null
    }));
    setSelectedCategory(null);
    alert(`Quiz completed! Your final score: ${gameState.score}`);
    setCurrentPage('leaderboard');
  };

  const handlePowerup = (type) => {
    if (gameState.powerups[type] > 0 && !showAnswer) {
      setGameState(prev => ({
        ...prev,
        powerups: { ...prev.powerups, [type]: prev.powerups[type] - 1 }
      }));

      switch(type) {
        case 'hint': {
          // Remove two wrong answers
          const correctAnswer = currentQuestionData.correct;
          let wrongAnswers = [];
          for (let i = 0; i < 4; i++) {
            if (i !== correctAnswer) wrongAnswers.push(i);
          }
          const toRemove = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);
          alert(`Hint: Options ${String.fromCharCode(65 + toRemove[0])} and ${String.fromCharCode(65 + toRemove[1])} are incorrect!`);
          break;
        }
        case 'skip':
          nextQuestion();
          break;
        case 'freeze':
          setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft + 15 }));
          break;
      }
    }
  };

  // Category selection screen
  if (!gameState.inGame && !selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 p-4">
        <div className="max-w-4xl mx-auto py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              Choose Your Battle Category
            </h1>
            {gameState.roomCode && (
              <div className="glassy rounded-xl p-4 mb-8 inline-block">
                <p className="text-purple-400 font-semibold">Room Code: <span className="text-white text-xl">{gameState.roomCode}</span></p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const icons = ['🎬', '🎵', '📰', '🏛️', '🍽️'];
              return (
                <button
                  key={category}
                  onClick={() => selectCategory(category)}
                  className="glassy p-8 rounded-xl hover:bg-gradient-to-br hover:from-purple-600/20 hover:to-pink-600/20 transition-all transform hover:scale-105 border-2 border-transparent hover:border-purple-500"
                >
                  <div className="text-6xl mb-4">{icons[index]}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{category}</h3>
                  <p className="text-gray-400">Test your knowledge in {category.toLowerCase()}</p>
                  <div className="mt-4 text-sm text-purple-400">20 Questions • 10 Points Each</div>
                </button>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={() => setCurrentPage('home')}
              className="border-2 border-gray-500 hover:border-purple-500 hover:bg-purple-500 px-6 py-2 rounded-lg font-medium transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Loading Quiz...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 p-4 prevent-select">
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="glassy rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-purple-400">Question {gameState.currentQuestion + 1}/20</h2>
              <p className="text-gray-400">Category: {selectedCategory}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-400">Score: {gameState.score}</div>
              {gameState.roomCode && (
                <div className="text-sm text-gray-400">Room: {gameState.roomCode}</div>
              )}
            </div>
          </div>

          {/* Timer */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Time Left</span>
              <span className={`text-sm font-bold ${gameState.timeLeft <= 10 ? 'text-red-400' : 'text-orange-400'}`}>
                {gameState.timeLeft}s
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  gameState.timeLeft > 20 ? 'bg-green-400' :
                  gameState.timeLeft > 10 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${(gameState.timeLeft / 30) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Powerups */}
          <div className="flex gap-2">
            <button 
              onClick={() => handlePowerup('hint')}
              disabled={gameState.powerups.hint === 0 || showAnswer}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 rounded text-sm transition-colors"
            >
              💡 Hint ({gameState.powerups.hint})
            </button>
            <button 
              onClick={() => handlePowerup('skip')}
              disabled={gameState.powerups.skip === 0 || showAnswer}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:opacity-50 rounded text-sm transition-colors"
            >
              ⏭️ Skip ({gameState.powerups.skip})
            </button>
            <button 
              onClick={() => handlePowerup('freeze')}
              disabled={gameState.powerups.freeze === 0 || showAnswer}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:opacity-50 rounded text-sm transition-colors"
            >
              ❄️ Freeze (+15s) ({gameState.powerups.freeze})
            </button>
          </div>

          {gameState.cheatingDetected > 0 && (
            <div className="mt-3 p-2 bg-red-900/30 border border-red-500 rounded text-red-400 text-sm">
              ⚠️ Cheating detected: {gameState.cheatingDetected} time(s). Penalties applied!
            </div>
          )}
        </div>

        {/* Question */}
        <div className="glassy rounded-xl p-8 animated-question">
          <h3 className="text-2xl font-semibold mb-8 text-center text-white">
            {currentQuestionData.question}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestionData.options.map((option, index) => {
              let buttonClass = "p-4 text-left rounded-lg transition-all transform border border-gray-600";
              
              if (showAnswer) {
                if (index === currentQuestionData.correct) {
                  buttonClass += " bg-green-600 border-green-400"; // Correct answer
                } else if (index === selectedAnswer && index !== currentQuestionData.correct) {
                  buttonClass += " bg-red-600 border-red-400"; // Wrong selected answer
                } else {
                  buttonClass += " bg-gray-700"; // Other options
                }
              } else {
                buttonClass += " bg-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:scale-105 hover:border-purple-500 cursor-pointer";
              }

              return (
                <button
                  key={index}
                  onClick={() => answerQuestion(index)}
                  disabled={showAnswer}
                  className={buttonClass}
                >
                  <span className="font-bold text-purple-400 mr-3">{String.fromCharCode(65 + index)}.</span>
                  <span className="text-white">{option}</span>
                </button>
              );
            })}
          </div>

          {showAnswer && (
            <div className="mt-6 text-center">
              <div className={`text-xl font-bold ${selectedAnswer === currentQuestionData.correct ? 'text-green-400' : 'text-red-400'}`}>
                {selectedAnswer === currentQuestionData.correct ? '✅ Correct!' : '❌ Wrong Answer!'}
              </div>
              <div className="text-gray-300 mt-2">
                The correct answer was: <span className="font-bold text-green-400">
                  {String.fromCharCode(65 + currentQuestionData.correct)}. {currentQuestionData.options[currentQuestionData.correct]}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Chat (Mock) */}
        <div className="glassy rounded-xl p-4 mt-6">
          <h4 className="text-lg font-semibold text-purple-400 mb-3">Live Chat</h4>
          <div className="h-32 bg-gray-800 rounded p-3 mb-3 overflow-y-auto">
            <div className="text-sm text-gray-400 mb-1">Player1: Good luck everyone! 🍀</div>
            <div className="text-sm text-gray-400 mb-1">Player2: This {selectedCategory} category is tough! 😅</div>
            <div className="text-sm text-gray-400 mb-1">Player3: Great question! 🤔</div>
            <div className="text-sm text-gray-400">You: Let's do this! 💪</div>
          </div>
          <input
            type="text"
            placeholder="Type your message..."
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:border-purple-500 focus:outline-none"
            onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
          />
        </div>
      </div>
    </div>
  );
};

export default Quiz;