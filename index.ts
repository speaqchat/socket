import { createServer } from "http";
import { Server, Socket } from "socket.io";

import { User } from "./types";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

let users: User[] = [];

const addUser = (userId: number, socketId: string) => {
  if (!users.some((user) => user.userId === userId)) {
    users.push({ userId, socketId });
    console.log(`Added user: ${userId} -> ${socketId}`);
  }
};

const removeUser = (socketId: string) => {
  users = users.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket: Socket) => {
  console.log(`${socket.id} connected!`);

  socket.emit("yourID", socket.id);

  io.sockets.emit("allUsers", users);

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("hey", {
      signal: data.signalData,
      from: data.from,
    });
  });

  socket.on("acceptCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });

  socket.on("addUser", (userId: number) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text, conversationId }) => {
    const user = users.find((user) => user.userId === receiverId);

    if (!user) return;

    console.log(
      `Sent message to: ${user?.userId} -> "${text}" in ${conversationId}`
    );

    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
      conversationId,
    });
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected!`);
    removeUser(socket.id);
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log(`Socket server started on port ${process.env.PORT}`);
});
