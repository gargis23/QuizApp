const Room = require('../models/Room');
const User = require('../models/User');

// @desc    Get all available rooms
// @route   GET /api/rooms
// @access  Public
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ 
      status: { $in: ['waiting', 'in-progress'] },
      isEntryClosed: false,
      isActive: { $ne: false }  // Only show active rooms
    })
    .populate('host', 'name email')
    .populate('players.user', 'name email')
    .sort({ createdAt: -1 });
    
    const formattedRooms = rooms.map(room => ({
      roomCode: room.roomCode,
      host: room.host.name,
      hostEmail: room.host.email,
      players: room.players.length,
      maxPlayers: room.maxPlayers,
      category: room.category,
      status: room.status,
      createdAt: room.createdAt
    }));
    
    res.status(200).json({
      success: true,
      data: {
        rooms: formattedRooms,
        total: formattedRooms.length
      }
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms'
    });
  }
};

// @desc    Create a new room
// @route   POST /api/rooms/create
// @access  Private
exports.createRoom = async (req, res) => {
  try {
    // Generate a unique room code
    let roomCode;
    let isUnique = false;
    
    while (!isUnique) {
      roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingRoom = await Room.findOne({ roomCode });
      if (!existingRoom) {
        isUnique = true;
      }
    }
    
    // For now, create a mock user if no authentication
    let userId = req.user?.id;
    let hostUser;
    
    if (!userId) {
      // Create or find a test user
      let testUser = await User.findOne({ email: 'test@example.com' });
      if (!testUser) {
        testUser = new User({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          isActive: true
        });
        testUser = await testUser.save();
      }
      userId = testUser._id;
      hostUser = testUser;
    } else {
      hostUser = await User.findById(userId);
    }
    
    const room = new Room({
      roomCode,
      host: userId,
      players: [{ user: userId }],
      status: 'waiting'
    });
    
    await room.save();
    
    // Return room with populated host info
    const populatedRoom = await Room.findById(room._id).populate('host', 'name email');
    
    res.status(201).json({
      success: true,
      data: {
        room: {
          roomCode: populatedRoom.roomCode,
          host: populatedRoom.host,
          players: populatedRoom.players,
          status: populatedRoom.status,
          category: populatedRoom.category
        }
      }
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating room'
    });
  }
};

// @desc    Join a room
// @route   POST /api/rooms/join/:roomCode
// @access  Private
exports.joinRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const room = await Room.findOne({ roomCode })
      .populate('host', 'name email')
      .populate('players.user', 'name email');
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    if (room.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'Cannot join room - game already started'
      });
    }
    
    // Mock user ID for now
    const userId = req.user?.id || (await User.findOne({ email: 'test@example.com' }))?._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    try {
      await room.addPlayer(userId);
      await room.populate('players.user', 'name email');
      
      res.status(200).json({
        success: true,
        data: {
          room: {
            roomCode: room.roomCode,
            host: room.host,
            players: room.players,
            status: room.status,
            message: 'Successfully joined room'
          }
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining room'
    });
  }
};

// @desc    Leave a room
// @route   POST /api/rooms/leave/:roomCode
// @access  Private
exports.leaveRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    res.status(200).json({
      success: true,
      data: {
        roomCode,
        player: req.user.id,
        message: 'Successfully left room'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error leaving room'
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
      .populate('host', 'name email')
      .populate('players.user', 'name email');
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        room: {
          roomCode: room.roomCode,
          host: room.host,
          players: room.players,
          status: room.status,
          category: room.category,
          isEntryClosed: room.isEntryClosed,
          maxPlayers: room.maxPlayers,
          chatMessages: room.chatMessages.slice(-20) // Last 20 messages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room'
    });
  }
};

// @desc    Update room settings
// @route   PUT /api/rooms/:roomCode/settings
// @access  Private
exports.updateRoomSettings = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { category } = req.body;
    
    res.status(200).json({
      success: true,
      data: {
        roomCode,
        category,
        message: 'Room settings updated'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating room settings'
    });
  }
};

// @desc    Kick player from room
// @route   POST /api/rooms/:roomCode/kick/:userId
// @access  Private
exports.kickPlayer = async (req, res) => {
  try {
    const { roomCode, userId } = req.params;
    
    res.status(200).json({
      success: true,
      data: {
        roomCode,
        kickedPlayer: userId,
        message: 'Player kicked successfully'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error kicking player'
    });
  }
};

// @desc    Start game
// @route   POST /api/rooms/:roomCode/start
// @access  Private
exports.startGame = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { category } = req.body;
    
    const room = await Room.findOne({ roomCode })
      .populate('host', 'name email')
      .populate('players.user', 'name email');
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    // Check if user is the host
    const userId = req.user?.id || (await User.findOne({ email: 'test@example.com' }))?._id;
    if (room.host._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can start the game'
      });
    }
    
    if (room.players.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Need at least 2 players to start the game'
      });
    }
    
    // Update room status and category
    room.status = 'in-progress';
    room.category = category;
    room.gameStartedAt = new Date();
    await room.save();
    
    res.status(200).json({
      success: true,
      data: {
        roomCode,
        category,
        status: 'in-progress',
        message: 'Game started successfully'
      }
    });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting game'
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
    
    res.status(201).json({
      success: true,
      data: {
        roomCode,
        sender: req.user.id,
        message,
        timestamp: new Date(),
        message: 'Message sent successfully'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
};

// @desc    Quit game and deactivate room
// @route   POST /api/rooms/:roomCode/quit
// @access  Private
exports.quitGame = async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const room = await Room.findOne({ roomCode })
      .populate('host', 'name email')
      .populate('players.user', 'name email');
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    const userId = req.user?.id || (await User.findOne({ email: 'test@example.com' }))?._id;
    const isHost = room.host._id.toString() === userId.toString();
    
    // If host quits, deactivate the entire room
    if (isHost) {
      room.status = 'completed';
      room.isActive = false;
      room.endedAt = new Date();
      await room.save();
      
      return res.status(200).json({
        success: true,
        data: {
          roomCode,
          message: 'Host quit - room deactivated',
          hostLeft: true,
          roomDeactivated: true
        }
      });
    } else {
      // Regular player quits - remove from room
      room.players = room.players.filter(p => p.user._id.toString() !== userId.toString());
      
      // If no players left, deactivate room
      if (room.players.length === 0) {
        room.status = 'completed';
        room.isActive = false;
        room.endedAt = new Date();
      }
      
      await room.save();
      
      return res.status(200).json({
        success: true,
        data: {
          roomCode,
          message: 'Player quit successfully',
          hostLeft: false,
          playersRemaining: room.players.length
        }
      });
    }
  } catch (error) {
    console.error('Error quitting game:', error);
    res.status(500).json({
      success: false,
      message: 'Error quitting game'
    });
  }
};

// @desc    End game and deactivate room
// @route   POST /api/rooms/:roomCode/end
// @access  Private
exports.endGame = async (req, res) => {
  try {
    const { roomCode } = req.params;
    
    const room = await Room.findOne({ roomCode });
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    room.status = 'completed';
    room.isActive = false;
    room.endedAt = new Date();
    await room.save();
    
    res.status(200).json({
      success: true,
      data: {
        roomCode,
        message: 'Game ended successfully'
      }
    });
  } catch (error) {
    console.error('Error ending game:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending game'
    });
  }
};