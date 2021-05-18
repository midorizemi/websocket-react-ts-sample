import { createServer } from "http";
import { Server, Socket } from "socket.io";

const server = createServer();

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = 4000;
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
const ALL_CHAT_MESSAGE_EVENT = "greeting";

const messages: { body: string; senderId: string; postedAt: string }[] = [];

io.on("connection", (socket: Socket) => {
  // Join a conversation
  const { roomId } = socket.handshake.query;
  socket.join(roomId);

  // 初回
  console.log("greeting");
  io.in(roomId).emit(ALL_CHAT_MESSAGE_EVENT, messages);

  // Listen for new messages
  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    console.log("new message", JSON.stringify(data));
    messages.push(data);
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    console.log("disconnect");
    if (typeof roomId === "string") socket.leave(roomId);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

// console.log("test");
