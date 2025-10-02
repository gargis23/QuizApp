const User = require('../models/User');

// @desc    Get global leaderboard
// @route   GET /api/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    // Get top users by total score
    const users = await User.find({ isActive: true })
      .sort({ totalScore: -1, gamesPlayed: -1 })
      .limit(limit)
      .select('name picture totalScore gamesPlayed accuracy bestScore');

    // Assign ranks
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      name: user.name,
      picture: user.picture,
      totalScore: user.totalScore,
      gamesPlayed: user.gamesPlayed,
      accuracy: user.accuracy,
      bestScore: user.bestScore
    }));

    // Update ranks in database (optional, can be done via cron job)
    const updatePromises = leaderboard.map(entry => 
      User.findByIdAndUpdate(entry.id, { rank: entry.rank })
    );
    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
        totalPlayers: await User.countDocuments({ isActive: true })
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
};

// @desc    Get user rank and nearby players
// @route   GET /api/leaderboard/rank
// @access  Private
exports.getUserRank = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    // Get users with higher scores
    const higherScores = await User.countDocuments({
      totalScore: { $gt: currentUser.totalScore },
      isActive: true
    });

    const userRank = higherScores + 1;

    // Get nearby players (5 above and 5 below)
    const nearbyPlayers = await User.find({ isActive: true })
      .sort({ totalScore: -1 })
      .skip(Math.max(0, userRank - 6))
      .limit(11)
      .select('name picture totalScore gamesPlayed accuracy bestScore');

    res.status(200).json({
      success: true,
      data: {
        userRank,
        nearbyPlayers: nearbyPlayers.map((user, index) => ({
          rank: Math.max(1, userRank - 5) + index,
          id: user._id,
          name: user.name,
          picture: user.picture,
          totalScore: user.totalScore,
          gamesPlayed: user.gamesPlayed,
          accuracy: user.accuracy,
          isCurrentUser: user._id.toString() === req.user.id
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user rank',
      error: error.message
    });
  }
};

// @desc    Get category leaderboard
// @route   GET /api/leaderboard/category/:category
// @access  Public
exports.getCategoryLeaderboard = async (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    // Aggregate best scores by category
    const QuizResult = require('../models/QuizResult');
    
    const leaderboard = await QuizResult.aggregate([
      { $match: { category, completed: true } },
      {
        $group: {
          _id: '$user',
          bestScore: { $max: '$score' },
          totalGames: { $sum: 1 },
          avgAccuracy: { $avg: '$accuracy' }
        }
      },
      { $sort: { bestScore: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          name: '$userInfo.name',
          picture: '$userInfo.picture',
          bestScore: 1,
          totalGames: 1,
          avgAccuracy: { $round: ['$avgAccuracy', 0] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        category,
        leaderboard: leaderboard.map((entry, index) => ({
          rank: index + 1,
          ...entry
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category leaderboard',
      error: error.message
    });
  }
};