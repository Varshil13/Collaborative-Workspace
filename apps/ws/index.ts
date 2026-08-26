import { useBeforeUnload, useLocation } from "react-router";
import { WebSocketServer } from "ws";

// Create WebSocket server on port 3002
const server = new WebSocketServer({ port: 3002 });
if (server) {
  console.log("ws backend is working");
}

interface Issues {
  sectionId: string;
  title: string;
  description: string;
}

// Store rooms and their users
const ROOMS: any = {};

let ISSUES: Issues[] = [
  {
    sectionId: "Backlog",
    title: "Add user authentication",
    description: "Implement signup, login and logout functionality",
  },
  {
    sectionId: "Backlog",
    title: "Create user profile",
    description:
      "Create a profile page where users can view and edit their information",
  },
  {
    sectionId: "Working",
    title: "Build dashboard UI",
    description:
      "Create the main dashboard layout and display project statistics",
  },
  {
    sectionId: "Working",
    title: "Implement issue management",
    description: "Allow users to create, edit and delete issues",
  },
  {
    sectionId: "Done",
    title: "Set up React project",
    description: "Initialize React with TypeScript and configure the project",
  },
  {
    sectionId: "Done",
    title: "Set up database",
    description: "Connect the application to the database",
  },
];

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
      const newuserId = Math.round(Math.random() * 1000);

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
          issues: ISSUES,
        }),
      );
    }

    if (parsedData.type === "addIssue") {
      const { boardId, sectionId, title } = parsedData;
      ISSUES = [
        ...ISSUES,
        {
          sectionId: sectionId,
          title: title,
          description: "VAGUE DESCRIPTION",
        },
      ];

      ROOMS[boardId].forEach((user) => {
        user.socket.send(
          JSON.stringify({
            type: "addedIssue",
            issues: ISSUES,
          }),
        );
      });
    }
    if(parsedData.type ==="deleteissue"){
      const {boardId, issue,sectionId} = parsedData;
    
      
      ISSUES = ISSUES.filter((x) => x.title != issue.title ||  x.sectionId !=sectionId)

      ROOMS[boardId].forEach((user) => user.socket.send(JSON.stringify({
        type:"deletedIssue",
        issues:ISSUES
      })))

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
