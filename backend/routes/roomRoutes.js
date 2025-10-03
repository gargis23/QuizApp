const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  createRoom,
  joinRoom,
  leaveRoom,
  getRoom,
  updateRoomSettings,
  kickPlayer,
  startGame,
  addChatMessage,
  quitGame,
  endGame
} = require('../controllers/roomController');
const { protect } = require('../middleware/auth');
const { validateRoomCode } = require('../middleware/validation');

// All room routes require authentication
router.get('/', getAllRooms);  // Get all rooms (public)
router.post('/create', protect, createRoom);  // Create room requires auth
router.post('/join/:roomCode', protect, validateRoomCode, joinRoom);
router.post('/leave/:roomCode', protect, validateRoomCode, leaveRoom);
router.get('/:roomCode', validateRoomCode, getRoom);  // Get room details
router.put('/:roomCode/settings', protect, validateRoomCode, updateRoomSettings);
router.post('/:roomCode/kick/:userId', protect, validateRoomCode, kickPlayer);
router.post('/:roomCode/start', protect, validateRoomCode, startGame);
router.post('/:roomCode/chat', protect, validateRoomCode, addChatMessage);
router.post('/:roomCode/quit', protect, validateRoomCode, quitGame);
router.post('/:roomCode/end', protect, validateRoomCode, endGame);

module.exports = router;