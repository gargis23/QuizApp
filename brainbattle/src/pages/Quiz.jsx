import React, { useState, useEffect } from 'react';
import { useApp } from '../context/useApp';
import { quizQuestions } from '../data/quizQuestions';

const Quiz = () => {
  const { gameState, setGameState, setCurrentPage, darkMode, showPopup, addUserResult } = useApp();
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const categories = ['Movies', 'Music', 'Current Affairs', 'History', 'Food'];

  useEffect(() => {
    if (!gameState.inGame && !selectedCategory) {
      return;
    }

    if (selectedCategory && !gameState.inGame) {
      // Get random 10 questions from the selected category
      const categoryQuestions = quizQuestions[selectedCategory];
      const shuffledQuestions = categoryQuestions.sort(() => Math.random() - 0.5).slice(0, 10);
      
      setGameState(prev => ({
        ...prev,
        inGame: true,
        questions: shuffledQuestions,
        currentQuestion: 0,
        score: 0,
        timeLeft: 30,
        powerups: { hint: 3, skip: 2, freeze: 1 },
        cheatingDetected: 0,
        selectedCategory,
        questionsAttempted: 0,
        correctAnswers: 0
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
      setShowAnswer(true);
      setGameState(prev => ({ ...prev, questionsAttempted: prev.questionsAttempted + 1 }));
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
      score: prev.score + scoreIncrease,
      questionsAttempted: prev.questionsAttempted + 1,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers
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
    const finalResult = {
      category: selectedCategory,
      score: gameState.score,
      questionsAttempted: gameState.questionsAttempted,
      correctAnswers: gameState.correctAnswers,
      accuracy: Math.round((gameState.correctAnswers / gameState.questionsAttempted) * 100) || 0,
      roomCode: gameState.roomCode
    };

    addUserResult(finalResult);
    
    setGameState(prev => ({ 
      ...prev, 
      inGame: false,
      selectedCategory: null
    }));
    setSelectedCategory(null);
    
    showFinalScorePopup(finalResult);
  };

  const quitQuiz = () => {
    if (gameState.questionsAttempted > 0) {
      const finalResult = {
        category: selectedCategory,
        score: gameState.score,
        questionsAttempted: gameState.questionsAttempted,
        correctAnswers: gameState.correctAnswers,
        accuracy: Math.round((gameState.correctAnswers / gameState.questionsAttempted) * 100) || 0,
        roomCode: gameState.roomCode,
        completed: false
      };

      addUserResult(finalResult);
      showFinalScorePopup(finalResult);
    }
    
    setGameState(prev => ({ 
      ...prev, 
      inGame: false,
      selectedCategory: null,
      currentQuestion: 0,
      score: 0,
      timeLeft: 30,
      questionsAttempted: 0,
      correctAnswers: 0
    }));
    setSelectedCategory(null);
    setCurrentPage('leaderboard');
  };

  const showFinalScorePopup = (result) => {
    const popup = document.createElement('div');
    popup.className = `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`;
    
    popup.innerHTML = `
      <div class="${darkMode ? 'bg-gray-800 border-purple-500' : 'bg-white border-purple-300'} border-2 rounded-2xl p-8 max-w-md mx-4 text-center">
        <div class="text-6xl mb-4">${result.completed !== false ? '🎉' : '⏹️'}</div>
        <h2 class="${darkMode ? 'text-white' : 'text-gray-800'} text-2xl font-bold mb-4">
          ${result.completed !== false ? 'Quiz Complete!' : 'Quiz Ended'}
        </h2>
        <div class="space-y-2 mb-6">
          <p class="${darkMode ? 'text-purple-400' : 'text-purple-600'} text-lg font-semibold">
            Final Score: ${result.score}
          </p>
          <p class="${darkMode ? 'text-gray-300' : 'text-gray-600'}">
            Questions Attempted: ${result.questionsAttempted}/10
          </p>
          <p class="${darkMode ? 'text-gray-300' : 'text-gray-600'}">
            Correct Answers: ${result.correctAnswers}
          </p>
          <p class="${darkMode ? 'text-gray-300' : 'text-gray-600'}">
            Accuracy: ${result.accuracy}%
          </p>
          <p class="${darkMode ? 'text-gray-300' : 'text-gray-600'}">
            Category: ${result.category}
          </p>
        </div>
        <button 
          onclick="this.closest('.fixed').remove(); window.dispatchEvent(new CustomEvent('closeScorePopup'))"
          class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
        >
          View Leaderboard
        </button>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Handle close popup event
    window.addEventListener('closeScorePopup', () => {
      setCurrentPage('leaderboard');
    }, { once: true });
  };

  const usePowerup = (type) => {
    if (gameState.powerups[type] > 0 && !showAnswer) {
      setGameState(prev => ({
        ...prev,
        powerups: { ...prev.powerups, [type]: prev.powerups[type] - 1 }
      }));

      switch(type) {
        case 'hint':
          const correctAnswer = currentQuestionData.correct;
          let wrongAnswers = [];
          for (let i = 0; i < 4; i++) {
            if (i !== correctAnswer) wrongAnswers.push(i);
          }
          const toRemove = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);
          showPopup(`💡 Hint: Options ${String.fromCharCode(65 + toRemove[0])} and ${String.fromCharCode(65 + toRemove[1])} are incorrect!`, 'info');
          break;
        case 'skip':
          nextQuestion();
          break;
        case 'freeze':
          setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft + 15 }));
          showPopup('❄️ Time frozen! +15 seconds added', 'success');
          break;
      }
    }
  };

  // Category selection screen
  if (!gameState.inGame && !selectedCategory) {
    return (
      <div className={`min-h-screen p-4 transition-colors ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
          : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
      }`}>
        <div className="max-w-4xl mx-auto py-16">
          <div className="text-center mb-12">
            <h1 className={`text-4xl font-bold mb-6 ${
              darkMode 
                ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
            }`}>
              Choose Your Battle Category
            </h1>
            {gameState.roomCode && (
              <div className={`rounded-xl p-4 mb-8 inline-block ${
                darkMode 
                  ? 'glassy' 
                  : 'bg-white/80 border border-purple-200'
              }`}>
                <p className={`font-semibold ${
                  darkMode ? 'text-purple-400' : 'text-purple-600'
                }`}>
                  Room Code: <span className={darkMode ? 'text-white' : 'text-gray-800'}>{gameState.roomCode}</span>
                </p>
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
                  className={`p-8 rounded-xl transition-all transform hover:scale-105 border-2 border-transparent ${
                    darkMode 
                      ? 'glassy hover:bg-gradient-to-br hover:from-purple-600/20 hover:to-pink-600/20 hover:border-purple-500'
                      : 'bg-white/80 border border-purple-100 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:border-purple-300'
                  }`}
                >
                  <div className="text-6xl mb-4">{icons[index]}</div>
                  <h3 className={`text-2xl font-bold mb-2 ${
                    darkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    {category}
                  </h3>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Test your knowledge in {category.toLowerCase()}
                  </p>
                  <div className={`mt-4 text-sm ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    10 Questions • 10 Points Each
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                darkMode 
                  ? 'border-2 border-gray-500 hover:border-purple-500 hover:bg-purple-500 text-gray-300 hover:text-white'
                  : 'border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-500 text-purple-600 hover:text-white'
              }`}
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
    <div className={`min-h-screen p-4 prevent-select transition-colors ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
        : 'bg-gradient-to-br from-purple-50 via-pink-50/30 to-purple-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className={`rounded-xl p-6 mb-6 ${
          darkMode 
            ? 'glassy' 
            : 'bg-white/80 border border-purple-200'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className={`text-2xl font-bold ${
                darkMode ? 'text-purple-400' : 'text-purple-600'
              }`}>
                Question {gameState.currentQuestion + 1}/10
              </h2>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Category: {selectedCategory}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                Score: {gameState.score}
              </div>
              {gameState.roomCode && (
                <div className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Room: {gameState.roomCode}
                </div>
              )}
            </div>
          </div>

          {/* Timer */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className={`text-sm font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Time Left
              </span>
              <span className={`text-sm font-bold ${
                gameState.timeLeft <= 10 
                  ? 'text-red-400' 
                  : (darkMode ? 'text-orange-400' : 'text-orange-600')
              }`}>
                {gameState.timeLeft}s
              </span>
            </div>
            <div className={`w-full rounded-full h-3 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  gameState.timeLeft > 20 ? 'bg-green-400' :
                  gameState.timeLeft > 10 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${(gameState.timeLeft / 30) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Powerups and Quit Button */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button 
                onClick={() => usePowerup('hint')}
                disabled={gameState.powerups.hint === 0 || showAnswer}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:opacity-50 text-white'
                }`}
              >
                💡 Hint ({gameState.powerups.hint})
              </button>
              <button 
                onClick={() => usePowerup('skip')}
                disabled={gameState.powerups.skip === 0 || showAnswer}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  darkMode 
                    ? 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:opacity-50 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 disabled:opacity-50 text-white'
                }`}
              >
                ⏭️ Skip ({gameState.powerups.skip})
              </button>
              <button 
                onClick={() => usePowerup('freeze')}
                disabled={gameState.powerups.freeze === 0 || showAnswer}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  darkMode 
                    ? 'bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:opacity-50 text-white'
                    : 'bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 disabled:opacity-50 text-white'
                }`}
              >
                ❄️ Freeze (+15s) ({gameState.powerups.freeze})
              </button>
            </div>
            
            <button 
              onClick={quitQuiz}
              className={`px-4 py-1 rounded text-sm font-medium transition-colors ${
                darkMode 
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              Quit Quiz
            </button>
          </div>

          {gameState.cheatingDetected > 0 && (
            <div className={`mt-3 p-2 border rounded ${
              darkMode 
                ? 'bg-red-900/30 border-red-500 text-red-400'
                : 'bg-red-50 border-red-300 text-red-600'
            } text-sm`}>
              ⚠️ Cheating detected: {gameState.cheatingDetected} time(s). Penalties applied!
            </div>
          )}
        </div>

        {/* Question */}
        <div className={`rounded-xl p-8 animated-question ${
          darkMode 
            ? 'glassy' 
            : 'bg-white/80 border border-purple-200'
        }`}>
          <h3 className={`text-2xl font-semibold mb-8 text-center ${
            darkMode ? 'text-white' : 'text-gray-800'
          }`}>
            {currentQuestionData.question}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestionData.options.map((option, index) => {
              let buttonClass = `p-4 text-left rounded-lg transition-all transform border ${
                darkMode ? 'border-gray-600' : 'border-purple-200'
              }`;
              
              if (showAnswer) {
                if (index === currentQuestionData.correct) {
                  buttonClass += darkMode 
                    ? " bg-green-600 border-green-400" 
                    : " bg-green-100 border-green-400 text-green-800";
                } else if (index === selectedAnswer && index !== currentQuestionData.correct) {
                  buttonClass += darkMode 
                    ? " bg-red-600 border-red-400" 
                    : " bg-red-100 border-red-400 text-red-800";
                } else {
                  buttonClass += darkMode 
                    ? " bg-gray-700" 
                    : " bg-gray-100";
                }
              } else {
                buttonClass += darkMode 
                  ? " bg-gray-700 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:scale-105 hover:border-purple-500 cursor-pointer"
                  : " bg-white hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:scale-105 hover:border-purple-400 cursor-pointer";
              }

              return (
                <button
                  key={index}
                  onClick={() => answerQuestion(index)}
                  disabled={showAnswer}
                  className={buttonClass}
                >
                  <span className={`font-bold mr-3 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className={darkMode ? 'text-white' : 'text-gray-800'}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {showAnswer && (
            <div className="mt-6 text-center">
              <div className={`text-xl font-bold ${
                selectedAnswer === currentQuestionData.correct 
                  ? 'text-green-400' 
                  : 'text-red-400'
              }`}>
                {selectedAnswer === currentQuestionData.correct ? '✅ Correct!' : '❌ Wrong Answer!'}
              </div>
              <div className={`mt-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                The correct answer was: <span className="font-bold text-green-400">
                  {String.fromCharCode(65 + currentQuestionData.correct)}. {currentQuestionData.options[currentQuestionData.correct]}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Chat (Mock) */}
        <div className={`rounded-xl p-4 mt-6 ${
          darkMode 
            ? 'glassy' 
            : 'bg-white/80 border border-purple-200'
        }`}>
          <h4 className={`text-lg font-semibold mb-3 ${
            darkMode ? 'text-purple-400' : 'text-purple-600'
          }`}>
            Live Chat
          </h4>
          <div className={`h-32 rounded p-3 mb-3 overflow-y-auto ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className={`text-sm mb-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Player1: Good luck everyone! 🍀
            </div>
            <div className={`text-sm mb-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Player2: This {selectedCategory} category is tough! 😅
            </div>
            <div className={`text-sm mb-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Player3: Great question! 🤔
            </div>
            <div className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              You: Let's do this! 💪
            </div>
          </div>
          <input
            type="text"
            placeholder="Type your message..."
            className={`w-full p-2 rounded text-sm focus:outline-none transition-colors ${
              darkMode 
                ? 'bg-gray-700 border border-gray-600 text-white focus:border-purple-500'
                : 'bg-white border border-purple-200 text-gray-800 focus:border-purple-400'
            }`}
            onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
          />
        </div>
      </div>
    </div>
  );
};

export default Quiz;