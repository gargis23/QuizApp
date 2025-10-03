const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const GameResult = require('../models/GameResult');
const User = require('../models/User');

// Get global leaderboard (aggregated user statistics)
router.get('/global', async (req, res) => {
  try {
    const leaderboard = await GameResult.aggregate([
      {
        $group: {
          _id: '$player',
          playerName: { $first: '$playerName' },
          totalScore: { $sum: '$score' },
          totalGames: { $sum: 1 },
          totalCorrectAnswers: { $sum: '$correctAnswers' },
          totalQuestionsAttempted: { $sum: '$questionsAttempted' },
          lastPlayed: { $max: '$gameCompletedAt' }
        }
      },
      {
        $addFields: {
          overallAccuracy: {
            $cond: {
              if: { $eq: ['$totalQuestionsAttempted', 0] },
              then: 0,
              else: {
                $multiply: [
                  { $divide: ['$totalCorrectAnswers', '$totalQuestionsAttempted'] },
                  100
                ]
              }
            }
          },
          averageScore: {
            $cond: {
              if: { $eq: ['$totalGames', 0] },
              then: 0,
              else: { $divide: ['$totalScore', '$totalGames'] }
            }
          }
        }
      },
      {
        $sort: { totalScore: -1, overallAccuracy: -1, lastPlayed: -1 }
      },
      {
        $project: {
          _id: 1,
          playerName: 1,
          totalScore: 1,
          totalGames: 1,
          overallAccuracy: { $round: ['$overallAccuracy', 2] },
          averageScore: { $round: ['$averageScore', 2] },
          lastPlayed: 1
        }
      }
    ]);

    // Add ranks
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    res.json({
      success: true,
      leaderboard: rankedLeaderboard,
      total: rankedLeaderboard.length
    });
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching global leaderboard',
      error: error.message
    });
  }
});

// Get room-wise leaderboard for a specific game
router.get('/room/:roomCode', async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    console.log('Fetching room leaderboard for:', roomCode);

    // First, get all results for this room
    const allResults = await GameResult.find({ roomCode }).sort({ gameCompletedAt: -1 });
    console.log(`Found ${allResults.length} total results for room ${roomCode}`);

    if (allResults.length === 0) {
      return res.json({
        success: true,
        leaderboard: [],
        roomCode,
        message: 'No games found for this room'
      });
    }

    // Get the latest game session for this room (most recent gameStartedAt)
    const latestGameTime = await GameResult.findOne(
      { roomCode },
      { gameStartedAt: 1 }
    ).sort({ gameStartedAt: -1 });

    console.log('Latest game started at:', latestGameTime?.gameStartedAt);

    if (!latestGameTime) {
      return res.json({
        success: true,
        leaderboard: [],
        roomCode,
        message: 'No games found for this room'
      });
    }

    // Get all results from the latest game session (within 5 minutes tolerance)
    const gameStartTime = new Date(latestGameTime.gameStartedAt);
    const timeTolerance = 5 * 60 * 1000; // 5 minutes in milliseconds
    const startWindow = new Date(gameStartTime.getTime() - timeTolerance);
    const endWindow = new Date(gameStartTime.getTime() + timeTolerance);

    const leaderboard = await GameResult.find({
      roomCode,
      gameStartedAt: {
        $gte: startWindow,
        $lte: endWindow
      }
    }).sort({ 
      score: -1, 
      accuracy: -1, 
      timeTaken: 1 // Lower time taken is better
    });

    console.log(`Found ${leaderboard.length} results for latest game session`);

    // Add ranks
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry.toObject(),
      rank: index + 1
    }));

    res.json({
      success: true,
      leaderboard: rankedLeaderboard,
      roomCode,
      gameStartedAt: latestGameTime.gameStartedAt,
      total: rankedLeaderboard.length
    });
  } catch (error) {
    console.error('Error fetching room leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room leaderboard',
      error: error.message
    });
  }
});

// Save game result
router.post('/save-result', async (req, res) => {
  try {
    const {
      roomCode,
      playerId,
      playerName,
      category,
      score,
      questionsAttempted,
      correctAnswers,
      gameStartedAt,
      timeTaken
    } = req.body;

    console.log('Received save-result request:', req.body);

    // Validate required fields
    if (!roomCode || !playerId || !playerName || !category || score === undefined) {
      console.error('Missing required fields:', {
        roomCode: !!roomCode,
        playerId: !!playerId,
        playerName: !!playerName,
        category: !!category,
        score: score !== undefined
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['roomCode', 'playerId', 'playerName', 'category', 'score']
      });
    }

    // Calculate accuracy
    const accuracy = questionsAttempted > 0 
      ? Math.round((correctAnswers / questionsAttempted) * 100 * 100) / 100 
      : 0;

    // Ensure playerId is a valid ObjectId
    let validPlayerId;
    try {
      validPlayerId = new mongoose.Types.ObjectId(playerId);
    } catch (error) {
      console.error('Invalid playerId format:', playerId);
      return res.status(400).json({
        success: false,
        message: 'Invalid player ID format'
      });
    }

    const gameResult = new GameResult({
      roomCode,
      player: validPlayerId,
      playerName,
      category,
      score: parseInt(score) || 0,
      questionsAttempted: parseInt(questionsAttempted) || 0,
      correctAnswers: parseInt(correctAnswers) || 0,
      accuracy,
      gameStartedAt: new Date(gameStartedAt),
      timeTaken: parseInt(timeTaken) || 0
    });

    console.log('Attempting to save game result:', gameResult);

    const savedResult = await gameResult.save();
    console.log('Game result saved successfully:', savedResult._id);

    res.json({
      success: true,
      message: 'Game result saved successfully',
      result: savedResult
    });
  } catch (error) {
    console.error('Error saving game result:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error saving game result',
      error: error.message,
      details: error.errors ? Object.keys(error.errors) : null
    });
  }
});

// Get player's game history
router.get('/player/:playerId/history', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const history = await GameResult.find({ player: playerId })
      .sort({ gameCompletedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GameResult.countDocuments({ player: playerId });

    res.json({
      success: true,
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching player history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching player history',
      error: error.message
    });
  }
});

// Get player statistics
router.get('/player/:playerId/stats', async (req, res) => {
  try {
    const { playerId } = req.params;

    const stats = await GameResult.aggregate([
      { $match: { player: mongoose.Types.ObjectId(playerId) } },
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          totalScore: { $sum: '$score' },
          totalCorrectAnswers: { $sum: '$correctAnswers' },
          totalQuestionsAttempted: { $sum: '$questionsAttempted' },
          bestScore: { $max: '$score' },
          bestAccuracy: { $max: '$accuracy' },
          averageScore: { $avg: '$score' },
          averageAccuracy: { $avg: '$accuracy' },
          lastPlayed: { $max: '$gameCompletedAt' }
        }
      }
    ]);

    const playerStats = stats[0] || {
      totalGames: 0,
      totalScore: 0,
      totalCorrectAnswers: 0,
      totalQuestionsAttempted: 0,
      bestScore: 0,
      bestAccuracy: 0,
      averageScore: 0,
      averageAccuracy: 0,
      lastPlayed: null
    };

    res.json({
      success: true,
      stats: {
        ...playerStats,
        averageScore: Math.round(playerStats.averageScore * 100) / 100,
        averageAccuracy: Math.round(playerStats.averageAccuracy * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching player stats',
      error: error.message
    });
  }
});

module.exports = router;