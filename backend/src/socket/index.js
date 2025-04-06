export const initSocketServer = (io) => {
    const roomUsers = {}; // roomId => [users]
  
    io.on("connection", (socket) => {
      console.log("🟢 New client connected:", socket.id);
  
      socket.on("join-room", ({ roomId, user }) => {
        socket.join(roomId);
        console.log(`👤 ${user.fullname} joined room: ${roomId}`);
  
        // Save user
        if (!roomUsers[roomId]) roomUsers[roomId] = [];
        roomUsers[roomId].push({ ...user, socketId: socket.id });
  
        // Notify others
        socket.to(roomId).emit("user-joined", {
          user,
          roomUsers: roomUsers[roomId],
        });
      });
  
      socket.on("code-change", ({ roomId, code }) => {
        console.log(`✏️ code-change from ${socket.id} in room ${roomId}: ${code.slice(0, 30)}...`);
        io.to(roomId).emit("code-update", { code }); // sends to everyone, including sender

      });
      
  
      socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
  
        // Clean up user from roomUsers
        for (const roomId in roomUsers) {
          roomUsers[roomId] = roomUsers[roomId].filter(
            (user) => user.socketId !== socket.id
          );
  
          // Notify others in the room
          socket.to(roomId).emit("user-left", {
            socketId: socket.id,
            roomUsers: roomUsers[roomId],
          });
  
          // Clean up empty room
          if (roomUsers[roomId].length === 0) delete roomUsers[roomId];
        }
      });
    });
  };
  