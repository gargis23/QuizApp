const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    length: 6
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isReady: {
      type: Boolean,
      default: false
    }
  }],
  category: {
    type: String,
    enum: ['Movies', 'Music', 'Current Affairs', 'History', 'Food', null],
    default: null
  },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed', 'closed'],
    default: 'waiting'
  },
  isEntryClosed: {
    type: Boolean,
    default: false
  },
  maxPlayers: {
    type: Number,
    default: 10
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  chatMessages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    senderName: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
roomSchema.index({ roomCode: 1 });
roomSchema.index({ host: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ createdAt: -1 });

// Method to add player to room
roomSchema.methods.addPlayer = function(userId) {
  if (this.players.length >= this.maxPlayers) {
    throw new Error('Room is full');
  }
  
  if (this.isEntryClosed) {
    throw new Error('Room entry is closed');
  }
  
  const playerExists = this.players.some(p => p.user.toString() === userId.toString());
  if (playerExists) {
    throw new Error('Player already in room');
  }
  
  this.players.push({ user: userId });
  return this.save();
};

// Method to remove player from room
roomSchema.methods.removePlayer = function(userId) {
  this.players = this.players.filter(p => p.user.toString() !== userId.toString());
  return this.save();
};

// Method to add chat message
roomSchema.methods.addChatMessage = function(senderId, senderName, message) {
  this.chatMessages.push({
    sender: senderId,
    senderName,
    message
  });
  
  // Keep only last 100 messages
  if (this.chatMessages.length > 100) {
    this.chatMessages = this.chatMessages.slice(-100);
  }
  
  return this.save();
};

// Auto-delete rooms older than 24 hours that are completed or closed
roomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;