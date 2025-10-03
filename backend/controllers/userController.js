const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, age, bio, picture } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields - save everything to database
    if (name) user.name = name;
    if (age !== undefined) user.age = age;
    if (bio !== undefined) user.bio = bio;
    if (picture !== undefined) user.picture = picture; // Save base64 or URL to database

    await user.save();

    // Return updated user data
    const updatedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      age: user.age,
      bio: user.bio,
      provider: user.provider,
      totalScore: user.totalScore,
      gamesPlayed: user.gamesPlayed,
      accuracy: user.accuracy,
      bestScore: user.bestScore,
      rank: user.rank
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          picture: user.picture,
          bio: user.bio,
          totalScore: user.totalScore,
          gamesPlayed: user.gamesPlayed,
          accuracy: user.accuracy,
          bestScore: user.bestScore,
          rank: user.rank
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalScore: user.totalScore,
          gamesPlayed: user.gamesPlayed,
          correctAnswers: user.correctAnswers,
          totalQuestions: user.totalQuestions,
          accuracy: user.accuracy,
          bestScore: user.bestScore,
          rank: user.rank
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
};