const Room = require('../models/Room');
const User = require('../models/User');

module.exports = (io) => {
  // Store socket to user mapping
  const socketToUser = new Map();
  const userToSocket = new Map();

  // Helper function to broadcast room state to all players
  const broadcastRoomState = async (roomCode) => {
    try {
      const room = await Room.findOne({ roomCode })
        .populate('host', 'name picture email')
        .populate('players.user', 'name picture email');

      if (!room) return;

      const players = room.players.map(p => ({
        id: p.user._id.toString(),
        name: p.user.name,
        picture: p.user.picture,
        email: p.user.email,
        isHost: p.user._id.toString() === room.host._id.toString(),
        joinedAt: p.joinedAt
      }));

      const roomStateData = {
        roomCode,
        players,
        category: room.category,
        isEntryClosed: room.isEntryClosed,
        status: room.status,
        host: {
          id: room.host._id.toString(),
          name: room.host.name,
          picture: room.host.picture,
          email: room.host.email
        },
        chatMessages: room.chatMessages.slice(-50).map(msg => ({
          sender: msg.senderName,
          message: msg.message,
          time: msg.timestamp
        }))
      };

      // Broadcast to all users in the room
      io.to(roomCode).emit('room_state', roomStateData);
      console.log(`Broadcasted room state to room ${roomCode}:`, {
        playerCount: players.length,
        messageCount: roomStateData.chatMessages.length
      });

    } catch (error) {
      console.error('Error broadcasting room state:', error);
    }
  };

  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);

    // Handle user joining with authentication
    socket.on('authenticate', async ({ userId, token }) => {
      try {
        const user = await User.findById(userId);
        if (user) {
          socketToUser.set(socket.id, userId);
          userToSocket.set(userId, socket.id);
          console.log(`User ${user.name} authenticated with socket ${socket.id}`);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      }
    });

    // Handle joining a room
    socket.on('join_room', async ({ roomCode, userId, userName }) => {
      try {
        // Find room and populate all player details from database
        let room = await Room.findOne({ roomCode })
          .populate('host', 'name picture email')
          .populate('players.user', 'name picture email');

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user is already in the room
        const isAlreadyInRoom = room.players.some(p => 
          p.user._id.toString() === userId
        );

        // Add player to room if not already in
        if (!isAlreadyInRoom) {
          await room.addPlayer(userId);
          
          // Reload room with updated player list
          room = await Room.findOne({ roomCode })
            .populate('host', 'name picture email')
            .populate('players.user', 'name picture email');
        }

        // Join the socket room
        socket.join(roomCode);
        console.log(`${userName} joined room ${roomCode}`);

        // Broadcast updated room state to all players
        await broadcastRoomState(roomCode);

        // Only send join message if player was just added
        if (!isAlreadyInRoom) {
          // Send system message to chat and save to database
          const systemMessage = `${userName} joined the room`;
          await room.addChatMessage(null, 'System', systemMessage);
          
          io.to(roomCode).emit('chat_message', {
            sender: 'System',
            message: systemMessage,
            time: new Date()
          });
        }

      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: error.message || 'Failed to join room' });
      }
    });

    // Handle leaving a room
    socket.on('leave_room', async ({ roomCode, userId, userName }) => {
      try {
        const room = await Room.findOne({ roomCode }).populate('host', 'name');
        
        if (room) {
          const isHost = room.host._id.toString() === userId;

          // Remove player from database
          await room.removePlayer(userId);
          
          socket.leave(roomCode);
          console.log(`${userName} left room ${roomCode}`);

          if (isHost) {
            // HOST LEFT - Close the room and notify all players
            room.status = 'closed';
            await room.save();

            // Send system message
            const systemMessage = `Host (${userName}) has left the room. Room is closing...`;
            await room.addChatMessage(null, 'System', systemMessage);
            
            // Notify all remaining players that host left
            io.to(roomCode).emit('host_left', {
              message: systemMessage
            });
          } else {
            // Regular player left
            // Send system message
            const systemMessage = `${userName} left the room`;
            await room.addChatMessage(null, 'System', systemMessage);
            
            io.to(roomCode).emit('chat_message', {
              sender: 'System',
              message: systemMessage,
              time: new Date()
            });

            // Broadcast updated room state to remaining players
            await broadcastRoomState(roomCode);
          }
        }

      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // Handle category selection (host only)
    socket.on('select_category', async ({ roomCode, category, userId }) => {
      try {
        const room = await Room.findOne({ roomCode });

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Verify user is host
        if (room.host.toString() !== userId) {
          socket.emit('error', { message: 'Only host can select category' });
          return;
        }

        // Save category to database
        room.category = category;
        await room.save();

        // Broadcast to all users in room
        io.to(roomCode).emit('category_selected', { category });

        // Send system message and save to database
        const systemMessage = `Quiz category set to: ${category}`;
        await room.addChatMessage(null, 'System', systemMessage);
        
        io.to(roomCode).emit('chat_message', {
          sender: 'System',
          message: systemMessage,
          time: new Date()
        });

      } catch (error) {
        console.error('Error selecting category:', error);
        socket.emit('error', { message: 'Failed to select category' });
      }
    });

    // Handle closing room entry (host only)
    socket.on('close_entry', async ({ roomCode, userId }) => {
      try {
        const room = await Room.findOne({ roomCode });

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Verify user is host
        if (room.host.toString() !== userId) {
          socket.emit('error', { message: 'Only host can close entry' });
          return;
        }

        // Save to database
        room.isEntryClosed = true;
        await room.save();

        // Broadcast to all users in room
        io.to(roomCode).emit('entry_closed');

        // Send system message and save to database
        const systemMessage = 'Room entry is now closed. No new players can join.';
        await room.addChatMessage(null, 'System', systemMessage);
        
        io.to(roomCode).emit('chat_message', {
          sender: 'System',
          message: systemMessage,
          time: new Date()
        });

      } catch (error) {
        console.error('Error closing entry:', error);
        socket.emit('error', { message: 'Failed to close entry' });
      }
    });

    // Handle kicking a player (host only)
    socket.on('kick_player', async ({ roomCode, targetUserId, userId }) => {
      try {
        const room = await Room.findOne({ roomCode });

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Verify user is host
        if (room.host.toString() !== userId) {
          socket.emit('error', { message: 'Only host can kick players' });
          return;
        }

        // Remove player from database
        await room.removePlayer(targetUserId);

        const targetUser = await User.findById(targetUserId);
        const targetSocketId = userToSocket.get(targetUserId);

        // Notify the kicked player
        if (targetSocketId) {
          io.to(targetSocketId).emit('kicked_from_room', {
            message: 'You have been removed from the room by the host'
          });
        }

        // Notify other players
        socket.to(roomCode).emit('player_kicked', {
          userId: targetUserId,
          userName: targetUser?.name
        });

        // Send system message and save to database
        const systemMessage = `${targetUser?.name} was removed from the room`;
        await room.addChatMessage(null, 'System', systemMessage);
        
        io.to(roomCode).emit('chat_message', {
          sender: 'System',
          message: systemMessage,
          time: new Date()
        });

      } catch (error) {
        console.error('Error kicking player:', error);
        socket.emit('error', { message: 'Failed to kick player' });
      }
    });

    // Handle chat messages
    socket.on('send_message', async ({ roomCode, userId, userName, message }) => {
      try {
        const room = await Room.findOne({ roomCode });

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Save message to database
        await room.addChatMessage(userId, userName, message);

        // Broadcast to all users in room (including sender)
        io.to(roomCode).emit('chat_message', {
          sender: userName,
          message,
          time: new Date()
        });

        console.log(`Chat message from ${userName} in room ${roomCode}: ${message}`);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle starting the game (host only)
    // Handle game starting with synchronized questions
    socket.on('start_game', async ({ roomCode, userId, category }) => {
      try {
        const room = await Room.findOne({ roomCode })
          .populate('host', 'name')
          .populate('players.user', 'name');

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Verify user is host
        if (room.host._id.toString() !== userId) {
          socket.emit('error', { message: 'Only host can start the game' });
          return;
        }

        if (!room.category && !category) {
          socket.emit('error', { message: 'Please select a category first' });
          return;
        }

        if (room.players.length < 2) {
          socket.emit('error', { message: 'Need at least 2 players to start' });
          return;
        }

        // Update room status in database
        room.status = 'in-progress';
        room.startedAt = new Date();
        if (category) room.category = category;
        await room.save();

        console.log(`Game starting in room ${roomCode} with category ${room.category}`);

        // Send system message and save to database
        const systemMessage = 'Host is starting the game! Get ready...';
        await room.addChatMessage(null, 'System', systemMessage);
        
        io.to(roomCode).emit('chat_message', {
          sender: 'System',
          message: systemMessage,
          time: new Date()
        });

        // Broadcast game start to all users in room (including host)
        setTimeout(() => {
          const gameStartData = {
            category: room.category,
            message: 'Game is starting now!',
            gameStartTime: new Date().toISOString(),
            players: room.players.map(p => ({
              id: p.user._id.toString(),
              name: p.user.name
            }))
          };
          
          console.log(`Broadcasting game_starting to room ${roomCode}:`, gameStartData);
          console.log(`Sockets in room ${roomCode}:`, io.sockets.adapter.rooms.get(roomCode)?.size || 0);
          io.to(roomCode).emit('game_starting', gameStartData);

          // Start synchronized question timing (30 seconds per question + 2 seconds review)
          startQuestionTimer(roomCode, 0);
        }, 1000);

      } catch (error) {
        console.error('Error starting game:', error);
        socket.emit('error', { message: 'Failed to start game' });
      }
    });

    // Function to handle synchronized question timing
    const startQuestionTimer = (roomCode, questionIndex) => {
      const totalQuestions = 10; // Standard quiz length
      
      if (questionIndex >= totalQuestions) {
        // Game completed
        io.to(roomCode).emit('game_completed', {
          message: 'Quiz completed! Calculating results...'
        });
        return;
      }

      // Notify all players about new question
      io.to(roomCode).emit('question_started', {
        questionIndex,
        timeLimit: 30,
        startTime: new Date().toISOString()
      });

      // After 30 seconds, show answer and move to next question
      setTimeout(() => {
        io.to(roomCode).emit('question_ended', {
          questionIndex,
          showAnswer: true
        });

        // After 2 seconds of showing answer, start next question
        setTimeout(() => {
          startQuestionTimer(roomCode, questionIndex + 1);
        }, 2000);
      }, 30000);
    };

    // Handle player quitting game
    socket.on('quit_game', async ({ roomCode, userId, userName }) => {
      try {
        const room = await Room.findOne({ roomCode })
          .populate('host', 'name')
          .populate('players.user', 'name');

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        const isHost = room.host._id.toString() === userId;

        if (isHost) {
          // Host quits - deactivate room and notify all players
          room.status = 'completed';
          room.isActive = false;
          room.endedAt = new Date();
          await room.save();

          // Notify all players that host left
          io.to(roomCode).emit('host_left', {
            message: 'Host has left the game. The room has been closed.',
            hostName: userName
          });

          // Send system message
          const systemMessage = `Host ${userName} left the game. Room closed.`;
          await room.addChatMessage(null, 'System', systemMessage);
          
          io.to(roomCode).emit('chat_message', {
            sender: 'System',
            message: systemMessage,
            time: new Date()
          });

        } else {
          // Regular player quits
          room.players = room.players.filter(p => p.user._id.toString() !== userId);
          
          if (room.players.length === 0) {
            room.status = 'completed';
            room.isActive = false;
            room.endedAt = new Date();
          }
          
          await room.save();

          // Notify remaining players
          socket.to(roomCode).emit('player_quit', {
            playerId: userId,
            playerName: userName,
            message: `${userName} has quit the game.`,
            playersRemaining: room.players.length
          });

          // Send system message
          const systemMessage = `${userName} quit the game`;
          await room.addChatMessage(null, 'System', systemMessage);
          
          io.to(roomCode).emit('chat_message', {
            sender: 'System',
            message: systemMessage,
            time: new Date()
          });
        }

        // Remove player from socket room
        socket.leave(roomCode);

      } catch (error) {
        console.error('Error handling quit game:', error);
        socket.emit('error', { message: 'Failed to quit game' });
      }
    });

    // Handle game ending
    socket.on('end_game', async ({ roomCode, userId }) => {
      try {
        const room = await Room.findOne({ roomCode });

        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Verify user is host
        if (room.host.toString() !== userId) {
          socket.emit('error', { message: 'Only host can end the game' });
          return;
        }

        // Deactivate room
        room.status = 'completed';
        room.isActive = false;
        room.endedAt = new Date();
        await room.save();

        // Notify all players
        io.to(roomCode).emit('game_ended', {
          message: 'Game has ended. Thank you for playing!'
        });

        // Send system message
        const systemMessage = 'Game has ended!';
        await room.addChatMessage(null, 'System', systemMessage);
        
        io.to(roomCode).emit('chat_message', {
          sender: 'System',
          message: systemMessage,
          time: new Date()
        });

      } catch (error) {
        console.error('Error ending game:', error);
        socket.emit('error', { message: 'Failed to end game' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      const userId = socketToUser.get(socket.id);
      
      if (userId) {
        socketToUser.delete(socket.id);
        userToSocket.delete(userId);
        console.log(`User ${userId} disconnected`);
      }
      
      console.log('Socket disconnected:', socket.id);
    });
  });
};