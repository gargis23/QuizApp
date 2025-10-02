const Room = require('../models/Room');

// Generate random room code
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// @desc    Create a new room
// @route   POST /api/rooms/create
// @access  Private
exports.createRoom = async (req, res) => {
  try {
    let roomCode;
    let roomExists = true;

    // Generate unique room code
    while (roomExists) {
      roomCode = generateRoomCode();
      roomExists = await Room.findOne({ roomCode, status: { $ne: 'completed' } });
    }

    const room = await Room.create({
      roomCode,
      host: req.user.id,
      players: [{ user: req.user.id }]
    });

    await room.populate('host', 'name picture');
    await room.populate('players.user', 'name picture');

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: { room }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
};

// @desc    Join a room
// @route   POST /api/rooms/join/:roomCode
// @access  Private
exports.joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode, status: 'waiting' });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found or already started'
      });
    }

    // Add player to room
    await room.addPlayer(req.user.id);
    await room.populate('host', 'name picture');
    await room.populate('players.user', 'name picture');

    res.status(200).json({
      success: true,
      message: 'Joined room successfully',
      data: { room }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Leave a room
// @route   POST /api/rooms/leave/:roomCode
// @access  Private
exports.leaveRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    await room.removePlayer(req.user.id);

    // If host leaves, close the room
    if (room.host.toString() === req.user.id) {
      room.status = 'closed';
      await room.save();
    }

    res.status(200).json({
      success: true,
      message: 'Left room successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error leaving room',
      error: error.message
    });
  }
};

// @desc    Get room details
// @route   GET /api/rooms/:roomCode
// @access  Private
exports.getRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode })
      .populate('host', 'name picture')
      .populate('players.user', 'name picture');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { room }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message
    });
  }
};

// @desc    Update room settings (host only)
// @route   PUT /api/rooms/:roomCode/settings
// @access  Private
exports.updateRoomSettings = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { category, isEntryClosed } = req.body;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is host
    if (room.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only host can update room settings'
      });
    }

    if (category) room.category = category;
    if (isEntryClosed !== undefined) room.isEntryClosed = isEntryClosed;

    await room.save();
    await room.populate('host', 'name picture');
    await room.populate('players.user', 'name picture');

    res.status(200).json({
      success: true,
      message: 'Room settings updated',
      data: { room }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating room settings',
      error: error.message
    });
  }
};

// @desc    Kick player from room (host only)
// @route   POST /api/rooms/:roomCode/kick/:userId
// @access  Private
exports.kickPlayer = async (req, res) => {
  try {
    const { roomCode, userId } = req.params;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is host
    if (room.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only host can kick players'
      });
    }

    await room.removePlayer(userId);

    res.status(200).json({
      success: true,
      message: 'Player kicked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error kicking player',
      error: error.message
    });
  }
};

// @desc    Start game (host only)
// @route   POST /api/rooms/:roomCode/start
// @access  Private
exports.startGame = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if user is host
    if (room.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only host can start the game'
      });
    }

    if (!room.category) {
      return res.status(400).json({
        success: false,
        message: 'Please select a category first'
      });
    }

    room.status = 'in-progress';
    room.startedAt = Date.now();
    await room.save();

    res.status(200).json({
      success: true,
      message: 'Game started successfully',
      data: { room }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting game',
      error: error.message
    });
  }
};

// @desc    Add chat message
// @route   POST /api/rooms/:roomCode/chat
// @access  Private
exports.addChatMessage = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { message } = req.body;

    const room = await Room.findOne({ roomCode });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    await room.addChatMessage(req.user.id, req.user.name, message);

    res.status(200).json({
      success: true,
      message: 'Message sent',
      data: {
        chatMessages: room.chatMessages.slice(-50) // Return last 50 messages
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};