import { Server, WebSocketServer } from "ws";

// Create WebSocket server on port 3002
const server = new WebSocketServer({ port: 3002 });
if(server){
  console.log("ws backend is working");
  
}

// Store rooms and their users
const ROOMS: any = {};

// Send an event to a user
function broadcast(type, user, userId) {
  user.socket.send(
    JSON.stringify({
      type: type,
      userId: userId,
    }),
  );
}

// Runs when a client connects
server.on("connection", (socket) => {
  // Listen for messages from the client
  socket.on("message", (data) => {
    const parsedData = JSON.parse(data);
    

    // User wants to join a board
    if (parsedData.type === "join") {
      const boardId = parsedData.boardId;

      // Create room if it doesn't exist
      if (!ROOMS[boardId]) {
        ROOMS[boardId] = [];
      }

      // Generate ID for the new user
      const newuserId = Math.round((Math.random()*1000));

      // Tell existing users that a new user joined
      ROOMS[boardId].forEach((user) => broadcast("join", user, newuserId));
 
      // Add new user to the room
      const user = {
        userId: newuserId,
        socket: socket,
      };

      ROOMS[boardId].push(user);

      // Send existing users to the newly joined user
      
      socket.send(
        JSON.stringify({
          type: "initial_state",
          users: ROOMS[boardId]
            .filter((user) => user.socket !== socket)
            .map((user) => user.userId),
        }),
      );
    }
  });

  // Runs when user disconnects
  socket.on("close", () => {
    // Check every room to find this user
    Object.entries(ROOMS).forEach(([boardId, users]: [string, any]) => {
      const userExists = users.find((user) => user.socket == socket);

      if (userExists) {
        // Remove disconnected user
        ROOMS[boardId] = users.filter((user) => user.socket !== socket);
        // Tell remaining users that they left
        ROOMS[boardId].forEach((user) =>
          broadcast("leave", user, userExists.userId),
        );
      }
    });
  });

});
