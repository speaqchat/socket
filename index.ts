import { User } from "./types";
import { Socket } from "socket.io";

const io = require("socket.io")(process.env.PORT, {
  cors: {
    origin: ["https://app.speaq.site"],
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
