const express = require('express');
const router = express.Router();
const {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoom,
  updateRoomSettings,
  kickPlayer,
  startGame,
  addChatMessage
} = require('../controllers/roomController');
const { protect } = require('../middleware/auth');
const { validateRoomCode } = require('../middleware/validation');

// All room routes require authentication
router.post('/create', protect, createRoom);
router.post('/join/:roomCode', protect, validateRoomCode, joinRoom);
router.post('/leave/:roomCode', protect, validateRoomCode, leaveRoom);
router.get('/:roomCode', protect, validateRoomCode, getRoom);
router.put('/:roomCode/settings', protect, validateRoomCode, updateRoomSettings);
router.post('/:roomCode/kick/:userId', protect, validateRoomCode, kickPlayer);
router.post('/:roomCode/start', protect, validateRoomCode, startGame);
router.post('/:roomCode/chat', protect, validateRoomCode, addChatMessage);

module.exports = router;