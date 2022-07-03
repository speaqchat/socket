import { createServer } from "http";
import { Server, Socket } from "socket.io";

import { User } from "./types";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "https://app.speaq.site/"],
  },
});

let users = [] as User[];

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

  socket.on("addUser", (userId: number) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = users.find((user) => {
      return user.userId === receiverId;
    });

    console.log(`Sent message to: ${user?.userId} -> ${text}`);

    if (!user) return;

    io.to(user?.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected!`);
    removeUser(socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log("Socket server started on port 3000");
});
