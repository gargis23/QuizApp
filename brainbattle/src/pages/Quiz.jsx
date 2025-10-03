import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/useApp';
import { quizQuestions } from '../data/quizQuestions';
import socketClient from '../socket/socketClient';
import { roomAPI } from '../api/api';

const Quiz = () => {
  const { gameState, setGameState, darkMode, showPopup, user } = useApp();
  const navigate = useNavigate();
  const [currentQuestionData, setCurrentQuestionData] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [category, setCategory] = useState(null);
  const chatEndRef = useRef(null);

  // Safety check for gameState
  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  useEffect(() => {
    // Listen for game starting from socket
    socketClient.onGameStarting((data) => {
      console.log('Game starting event received in Quiz:', data);
      setCategory(data.category);
      setGameStarted(true);
      
      // Initialize game state with selected category questions
      const categoryQuestions = quizQuestions[data.category];
      console.log('Initializing questions for category:', data.category, 'Found:', categoryQuestions?.length || 0);
      if (categoryQuestions) {
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
          selectedCategory: data.category,
          questionsAttempted: 0,
          correctAnswers: 0
        }));
      } else {
        console.error('No questions found for category in Quiz component:', data.category);
      }
    });

    // Check if game was already started from navigation
    if (gameState.gameStarting && gameState.selectedCategory && !gameStarted) {
      console.log('Initializing game from navigation state');
      console.log('Selected category:', gameState.selectedCategory);
      console.log('Available categories in quizQuestions:', Object.keys(quizQuestions));
      setCategory(gameState.selectedCategory);
      setGameStarted(true);
      
      // Initialize game state with selected category questions
      const categoryQuestions = quizQuestions[gameState.selectedCategory];
      console.log('Category questions found:', categoryQuestions ? categoryQuestions.length : 'None');
      if (categoryQuestions) {
        const shuffledQuestions = categoryQuestions.sort(() => Math.random() - 0.5).slice(0, 10);
        console.log('Shuffled questions:', shuffledQuestions.length);
        
        setGameState(prev => ({
          ...prev,
          inGame: true,
          questions: shuffledQuestions,
          currentQuestion: 0,
          score: 0,
          timeLeft: 30,
          powerups: { hint: 3, skip: 2, freeze: 1 },
          cheatingDetected: 0,
          questionsAttempted: 0,
          correctAnswers: 0,
          gameStarting: false  // Clear the flag
        }));
      } else {
        console.error('No questions found for category:', gameState.selectedCategory);
      }
    }

    // Also check if we have inGame but no questions (edge case)
    if (gameState.inGame && gameState.selectedCategory && (!gameState.questions || gameState.questions.length === 0) && !gameStarted) {
      console.log('Edge case: inGame but no questions, initializing...');
      setCategory(gameState.selectedCategory);
      setGameStarted(true);
      
      const categoryQuestions = quizQuestions[gameState.selectedCategory];
      if (categoryQuestions) {
        const shuffledQuestions = categoryQuestions.sort(() => Math.random() - 0.5).slice(0, 10);
        
        setGameState(prev => ({
          ...prev,
          questions: shuffledQuestions,
          currentQuestion: 0,
          score: 0,
          timeLeft: 30,
          powerups: { hint: 3, skip: 2, freeze: 1 },
          cheatingDetected: 0,
          questionsAttempted: 0,
          correctAnswers: 0
        }));
      }
    }

    // Listen for chat messages
    socketClient.onChatMessage((message) => {
      setChatMessages(prev => [...prev, message]);
    });

    // Listen for host leaving
    socketClient.socket?.on('host_left', (data) => {
      console.log('Host left in quiz:', data);
      console.log('Current user:', user);
      console.log('Current gameState:', gameState);
      
      // Only trigger if we're actually in a game and this is a real host leave event
      if (gameState?.inGame && gameState?.roomCode) {
        showPopup(data.message || 'Host has left the game. Returning to home.', 'error');
        
        // Reset ALL game state when host leaves
        setGameState(prev => ({ 
          ...prev, 
          inGame: false,
          selectedCategory: null,
          currentQuestion: 0,
          score: 0,
          timeLeft: 30,
          questionsAttempted: 0,
          correctAnswers: 0,
          questions: [],
          powerups: { hint: 3, skip: 2, freeze: 1 },
          cheatingDetected: 0,
          roomCode: null,
          gameStarting: false,
          waitingForHost: false
        }));
        
        // Reset local state
        setCategory(null);
        setGameStarted(false);
        setShowAnswer(false);
        setSelectedAnswer(null);
        setChatMessages([]);
        setNewMessage('');
        
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        console.log('Ignoring host_left event - not in active game');
      }
    });

    // Listen for player quitting
    socketClient.socket?.on('player_quit', (data) => {
      showPopup(data.message, 'info');
    });

    // Listen for game ending
    socketClient.socket?.on('game_ended', (data) => {
      showPopup(data.message, 'success');
      setTimeout(() => {
        endQuiz();
      }, 2000);
    });

    return () => {
      socketClient.off('game_starting');
      socketClient.off('chat_message');
      socketClient.socket?.off('host_left');
      socketClient.socket?.off('player_quit');
      socketClient.socket?.off('game_ended');
    };
  }, [navigate, setGameState, showPopup, gameState.gameStarting, gameState.selectedCategory, gameStarted]);

  useEffect(() => {
    if (gameState.questions && gameState.questions.length > 0 && gameState.currentQuestion < gameState.questions.length) {
      setCurrentQuestionData(gameState.questions[gameState.currentQuestion]);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }
  }, [gameState.currentQuestion, gameState.questions]);

  useEffect(() => {
    if (gameState?.inGame && gameState?.timeLeft > 0 && !showAnswer) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState?.timeLeft === 0 && !showAnswer) {
      setShowAnswer(true);
      setGameState(prev => ({ ...prev, questionsAttempted: prev.questionsAttempted + 1 }));
      setTimeout(() => nextQuestion(), 2000);
    }
  }, [gameState?.timeLeft, gameState?.inGame, showAnswer, setGameState]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  const endQuiz = async () => {
    const finalResult = {
      category: category || gameState.selectedCategory,
      score: gameState.score,
      questionsAttempted: gameState.questionsAttempted,
      correctAnswers: gameState.correctAnswers,
      accuracy: Math.round((gameState.correctAnswers / gameState.questionsAttempted) * 100) || 0,
      roomCode: gameState.roomCode
    };

    // End the game in the backend if not already ended
    try {
      await roomAPI.endGame(gameState.roomCode);
    } catch (error) {
      console.error('Error ending game:', error);
    }
    
    setGameState(prev => ({ 
      ...prev, 
      inGame: false,
      selectedCategory: null,
      roomCode: null
    }));
    
    showFinalScorePopup(finalResult);
  };

  const quitQuiz = async () => {
    try {
      // Notify via socket that player is quitting
      socketClient.socket?.emit('quit_game', {
        roomCode: gameState?.roomCode,
        userId: user?.id,
        userName: user?.name
      });

      // Call API to quit game
      if (gameState?.roomCode) {
        await roomAPI.quitGame(gameState.roomCode);
      }

      // Reset ALL game state
      setGameState(prev => ({ 
        ...prev, 
        inGame: false,
        selectedCategory: null,
        currentQuestion: 0,
        score: 0,
        timeLeft: 30,
        questionsAttempted: 0,
        correctAnswers: 0,
        questions: [],
        powerups: { hint: 3, skip: 2, freeze: 1 },
        cheatingDetected: 0,
        roomCode: null,
        gameStarting: false,
        waitingForHost: false
      }));

      // Reset local state
      setCategory(null);
      setGameStarted(false);
      setShowAnswer(false);
      setSelectedAnswer(null);
      setChatMessages([]);
      setNewMessage('');

      // Always navigate to home when quitting
      showPopup('You have quit the quiz', 'info');
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (error) {
      console.error('Error quitting game:', error);
      showPopup('Error quitting game', 'error');
      // Navigate home anyway
      navigate('/');
    }
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
      navigate('/');
    }, { once: true });
  };

  const usePowerup = (type) => {
    console.log('Using powerup:', type, 'Current powerups:', gameState?.powerups);
    if (!gameState?.powerups || gameState.powerups[type] <= 0 || showAnswer) {
      showPopup(`No ${type} powerups remaining!`, 'error');
      return;
    }

    setGameState(prev => ({
      ...prev,
      powerups: { ...prev.powerups, [type]: prev.powerups[type] - 1 }
    }));

    switch(type) {
      case 'hint':
        if (!currentQuestionData) {
          showPopup('No question data available for hint', 'error');
          return;
        }
        const correctAnswer = currentQuestionData.correct;
        let wrongAnswers = [];
        for (let i = 0; i < 4; i++) {
          if (i !== correctAnswer) wrongAnswers.push(i);
        }
        const toRemove = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);
        showPopup(`💡 Hint: Options ${String.fromCharCode(65 + toRemove[0])} and ${String.fromCharCode(65 + toRemove[1])} are incorrect!`, 'info');
        break;
      case 'skip':
        showPopup('⏭️ Question skipped!', 'info');
        setTimeout(() => nextQuestion(), 1000);
        break;
      case 'freeze':
        setGameState(prev => ({ ...prev, timeLeft: Math.min(prev.timeLeft + 15, 30) }));
        showPopup('❄️ Time frozen! +15 seconds added', 'success');
        break;
    }
  };

  const sendChatMessage = () => {
    if (!newMessage.trim() || !gameState?.roomCode) return;

    socketClient.sendMessage(gameState.roomCode, user?.id, user?.name, newMessage);
    setNewMessage('');
  };

  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  };

  // Waiting for game to start screen
  if (!gameStarted && !gameState.inGame) {
    console.log('Quiz showing waiting screen:', { 
      gameStarted, 
      'gameState.inGame': gameState.inGame,
      'gameState.gameStarting': gameState.gameStarting,
      'gameState.selectedCategory': gameState.selectedCategory,
      'gameState.questions': gameState.questions?.length || 0
    });
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
              Waiting for Game to Start...
            </h1>
            <div className="text-sm text-gray-500 mb-4">
              Debug: gameStarted={String(gameStarted)}, gameState.inGame={String(gameState?.inGame)}, gameState.gameStarting={String(gameState?.gameStarting)}
            </div>
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
            <div className="animate-pulse text-6xl mb-4">⏳</div>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              The host is preparing to start the quiz. Get ready!
            </p>
          </div>

          {/* Chat Section */}
          <div className={`max-w-2xl mx-auto rounded-xl p-6 ${
            darkMode 
              ? 'glassy border border-purple-500/30' 
              : 'bg-white/80 border border-purple-200'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Room Chat
            </h3>
            
            <div className={`h-64 overflow-y-auto mb-4 p-4 rounded-lg ${
              darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}>
              {chatMessages.length === 0 ? (
                <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No messages yet. Start chatting!
                </p>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className="mb-2">
                    <span className={`font-semibold ${
                      msg.sender === 'System' 
                        ? (darkMode ? 'text-yellow-400' : 'text-orange-600')
                        : (darkMode ? 'text-purple-400' : 'text-purple-600')
                    }`}>
                      {msg.sender}:
                    </span>
                    <span className={`ml-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {msg.message}
                    </span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleChatKeyPress}
                placeholder="Type a message..."
                className={`flex-1 px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <button
                onClick={sendChatMessage}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
              >
                Send
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <button 
              onClick={quitQuiz}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Quit Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestionData) {
    console.log('Quiz showing loading screen - no currentQuestionData:', {
      'gameState.questions': gameState.questions?.length || 0,
      'gameState.currentQuestion': gameState.currentQuestion,
      gameStarted,
      'gameState.inGame': gameState.inGame
    });
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
                Question {(gameState?.currentQuestion || 0) + 1}/10
              </h2>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Category: {category || gameState?.selectedCategory}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${
                darkMode ? 'text-green-400' : 'text-green-600'
              }`}>
                Score: {gameState?.score || 0}
              </div>
              {gameState?.roomCode && (
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
                (gameState?.timeLeft || 0) <= 10 
                  ? 'text-red-400' 
                  : (darkMode ? 'text-orange-400' : 'text-orange-600')
              }`}>
                {gameState?.timeLeft || 0}s
              </span>
            </div>
            <div className={`w-full rounded-full h-3 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  (gameState?.timeLeft || 0) > 20 ? 'bg-green-400' :
                  (gameState?.timeLeft || 0) > 10 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${((gameState?.timeLeft || 0) / 30) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Powerups and Quit Button */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button 
                onClick={() => usePowerup('hint')}
                disabled={!gameState.powerups || gameState.powerups.hint === 0 || showAnswer}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  darkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:opacity-50 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:opacity-50 text-white'
                }`}
              >
                💡 Hint ({gameState.powerups?.hint || 0})
              </button>
              <button 
                onClick={() => usePowerup('skip')}
                disabled={!gameState.powerups || gameState.powerups.skip === 0 || showAnswer}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  darkMode 
                    ? 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:opacity-50 text-white'
                    : 'bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 disabled:opacity-50 text-white'
                }`}
              >
                ⏭️ Skip ({gameState.powerups?.skip || 0})
              </button>
              <button 
                onClick={() => usePowerup('freeze')}
                disabled={!gameState.powerups || gameState.powerups.freeze === 0 || showAnswer}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  darkMode 
                    ? 'bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:opacity-50 text-white'
                    : 'bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-400 disabled:opacity-50 text-white'
                }`}
              >
                ❄️ Freeze (+15s) ({gameState.powerups?.freeze || 0})
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

        {/* Live Chat */}
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
            {chatMessages.length === 0 ? (
              <p className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No messages yet
              </p>
            ) : (
              chatMessages.map((msg, index) => (
                <div key={index} className={`text-sm mb-1 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <span className={`font-semibold ${
                    msg.sender === 'System' 
                      ? (darkMode ? 'text-yellow-400' : 'text-orange-600')
                      : (darkMode ? 'text-purple-400' : 'text-purple-600')
                  }`}>
                    {msg.sender}:
                  </span>
                  <span className="ml-1">{msg.message}</span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleChatKeyPress}
              placeholder="Type your message..."
              className={`flex-1 p-2 rounded text-sm focus:outline-none transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border border-gray-600 text-white focus:border-purple-500 placeholder-gray-400'
                  : 'bg-white border border-purple-200 text-gray-800 focus:border-purple-400 placeholder-gray-500'
              }`}
            />
            <button
              onClick={sendChatMessage}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded text-sm font-semibold transition-all"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;