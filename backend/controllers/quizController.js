const QuizResult = require('../models/QuizResult');
const User = require('../models/User');

// @desc    Submit quiz result
// @route   POST /api/quiz/submit
// @access  Private
exports.submitQuizResult = async (req, res) => {
  try {
    const { score, correctAnswers, totalQuestions, accuracy, category, roomCode } = req.body;
    
    // Save to QuizResult
    const result = await QuizResult.create({
      user: req.user.id,
      score,
      correctAnswers,
      totalQuestions,
      accuracy,
      category,
      roomCode
    });
    
    // If roomCode provided, save to Room.results
    if (roomCode) {
      const room = await Room.findOne({ roomCode });
      if (room) {
        room.results.push({
          user: req.user.id,
          score,
          accuracy,
          correctAnswers,
          totalQuestions,
          completedAt: new Date()
        });
        
        // Check if all players finished
        if (room.results.length === room.players.length) {
          room.status = 'completed';
          room.completedAt = Date.now();
        }
        
        await room.save();
      }
    }
    
    // Update user stats
    await user.updateGameStats(score, correctAnswers, totalQuestions);
    
    res.status(200).json({
      success: true,
      data: { result }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting result'
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