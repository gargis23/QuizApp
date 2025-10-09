import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? (import.meta.env.VITE_API_URL || 'https://brainbattle-backend.onrender.com')
  : 'http://localhost:5000';

console.log('Socket URL:', SOCKET_URL);
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL env var:', import.meta.env.VITE_API_URL);

class SocketClient {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(userId, token) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Attempting to connect socket to:', SOCKET_URL);
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully:', this.socket.id);
      this.connected = true;
      
      // Authenticate after connection
      this.socket.emit('authenticate', { userId, token });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      console.error('Error details:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Room events
  joinRoom(roomCode, userId, userName) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('join_room', { roomCode, userId, userName });
  }

  leaveRoom(roomCode, userId, userName) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('leave_room', { roomCode, userId, userName });
  }

  selectCategory(roomCode, category, userId) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('select_category', { roomCode, category, userId });
  }

  closeEntry(roomCode, userId) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('close_entry', { roomCode, userId });
  }

  kickPlayer(roomCode, targetUserId, userId) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('kick_player', { roomCode, targetUserId, userId });
  }

  sendMessage(roomCode, userId, userName, message) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('send_message', { roomCode, userId, userName, message });
  }

  startGame(roomCode, userId, category) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('start_game', { roomCode, userId, category });
  }

  // Event listeners
  onRoomState(callback) {
    if (this.socket) {
      this.socket.on('room_state', callback);
    }
  }

  onPlayerJoined(callback) {
    if (this.socket) {
      this.socket.on('player_joined', callback);
    }
  }

  onPlayerLeft(callback) {
    if (this.socket) {
      this.socket.on('player_left', callback);
    }
  }

  onPlayerKicked(callback) {
    if (this.socket) {
      this.socket.on('player_kicked', callback);
    }
  }

  onKickedFromRoom(callback) {
    if (this.socket) {
      this.socket.on('kicked_from_room', callback);
    }
  }

  onCategorySelected(callback) {
    if (this.socket) {
      this.socket.on('category_selected', callback);
    }
  }

  onEntryClosed(callback) {
    if (this.socket) {
      this.socket.on('entry_closed', callback);
    }
  }

  onChatMessage(callback) {
    if (this.socket) {
      this.socket.on('chat_message', callback);
    }
  }

  onGameStarting(callback) {
    if (this.socket) {
      this.socket.on('game_starting', callback);
    }
  }

  onHostLeft(callback) {
    if (this.socket) {
      this.socket.on('host_left', callback);
    }
  }

  onPlayerQuit(callback) {
    if (this.socket) {
      this.socket.on('player_quit', callback);
    }
  }

  onGameEnded(callback) {
    if (this.socket) {
      this.socket.on('game_ended', callback);
    }
  }

  quitGame(roomCode, userId, userName) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('quit_game', { roomCode, userId, userName });
  }

  endGame(roomCode, userId) {
    if (!this.socket?.connected) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit('end_game', { roomCode, userId });
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Remove event listeners
  off(eventName) {
    if (this.socket) {
      this.socket.off(eventName);
    }
  }

  offAll() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient;