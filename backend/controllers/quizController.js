const QuizResult = require('../models/QuizResult');
const User = require('../models/User');

// @desc    Submit quiz result
// @route   POST /api/quiz/submit
// @access  Private
exports.submitQuizResult = async (req, res) => {
  try {
    const { category, score, correctAnswers, totalQuestions, accuracy, timeTaken, roomCode, cheatingDetected, powerupsUsed } = req.body;

    // Create quiz result
    const quizResult = await QuizResult.create({
      user: req.user.id,
      category,
      score,
      correctAnswers,
      totalQuestions,
      accuracy,
      timeTaken,
      roomCode,
      isMultiplayer: !!roomCode,
      cheatingDetected,
      powerupsUsed: powerupsUsed || { hints: 0, skips: 0, freezes: 0 }
    });

    // Update user stats
    const user = await User.findById(req.user.id);
    await user.updateGameStats(score, correctAnswers, totalQuestions);

    res.status(201).json({
      success: true,
      message: 'Quiz result submitted successfully',
      data: {
        result: quizResult,
        userStats: {
          totalScore: user.totalScore,
          gamesPlayed: user.gamesPlayed,
          accuracy: user.accuracy,
          bestScore: user.bestScore
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz result',
      error: error.message
    });
  }
};

// @desc    Get user's quiz history
// @route   GET /api/quiz/history
// @access  Private
exports.getQuizHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const results = await QuizResult.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await QuizResult.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      data: {
        results,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalResults: total,
          hasMore: skip + results.length < total
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz history',
      error: error.message
    });
  }
};

// @desc    Get quiz results by category
// @route   GET /api/quiz/category/:category
// @access  Private
exports.getResultsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const results = await QuizResult.find({
      user: req.user.id,
      category
    }).sort({ createdAt: -1 });

    // Calculate category stats
    const totalGames = results.length;
    const avgScore = totalGames > 0 
      ? results.reduce((sum, r) => sum + r.score, 0) / totalGames 
      : 0;
    const avgAccuracy = totalGames > 0 
      ? results.reduce((sum, r) => sum + r.accuracy, 0) / totalGames 
      : 0;
    const bestScore = totalGames > 0 
      ? Math.max(...results.map(r => r.score)) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        category,
        results,
        stats: {
          totalGames,
          avgScore: Math.round(avgScore),
          avgAccuracy: Math.round(avgAccuracy),
          bestScore
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category results',
      error: error.message
    });
  }
};