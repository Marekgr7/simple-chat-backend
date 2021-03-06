const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const server = http.createServer(app);
const { Server } = require("socket.io");

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Simple chat API");
});

let onlineUsers = {};

io.on("connection", (socket) => {
  newSocketConnectionEventHandler(socket.id);

  socket.on("chat-message", (data) => {
    chatMessageEventHandler(data, socket.id);
  });

  socket.on("chat-message-undo", (data) => {
    chatUndoMessageHandler(data, socket.id);
  });

  socket.on("nick-change", (data) => {
    nickChangeEventHandler(data, socket.id);
  });

  socket.on("countdown", (data) => {
    countdownHandler(data);
  });

  socket.on("disconnect", () => {
    disconnectEventHandler(socket.id);
  });
});

const PORT = process.env.PORT || 3003;

server.listen(PORT, () => {
  console.log(`listening on 3003`);
});

const newSocketConnectionEventHandler = (socketId) => {
  addOnlineUser(socketId);
  broadcastOnlineUsers();
  logOnlineUsers();
};

const disconnectEventHandler = (socketId) => {
  removeOnlineUser(socketId);
  broadcastOnlineUsers();
  broadcastDisconnectedUserDetails(socketId);
  logOnlineUsers();
};

const chatMessageEventHandler = (data, socketId) => {
  const { message, receiverSocketId } = data;
  if (onlineUsers[receiverSocketId]) {
    io.to(receiverSocketId).emit("chat-message", {
      senderSocketId: socketId,
      message,
    });
  }
};

const nickChangeEventHandler = (data, socketId) => {
  const { nick } = data;
  changeUserNick(nick, socketId);
  broadcastOnlineUsers();
  logOnlineUsers();
};

const chatUndoMessageHandler = (data, socketId) => {
  const { messageId, receiverSocketId } = data;
  if (onlineUsers[receiverSocketId]) {
    io.to(receiverSocketId).emit("chat-message-undo", {
      senderSocketId: socketId,
      messageId,
    });
  }
};

const countdownHandler = (data) => {
  const { receiverSocketId, countdownDetails } = data;
  if (onlineUsers[receiverSocketId]) {
    io.to(receiverSocketId).emit("countdown", countdownDetails);
  }
};

const addOnlineUser = (socketId) => {
  onlineUsers[socketId] = {
    nick: null,
  };
};

const removeOnlineUser = (socketId) => {
  if (onlineUsers[socketId]) {
    delete onlineUsers[socketId];
  }
};

const changeUserNick = (newNick, socketId) => {
  if (onlineUsers[socketId]) {
    onlineUsers = {
      ...onlineUsers,
      [socketId]: {
        ...onlineUsers[socketId],
        nick: newNick,
      },
    };
  }
};

const broadcastOnlineUsers = () => {
  io.emit("online-users", convertOnlineUsersToArray());
};

const broadcastDisconnectedUserDetails = (disconnectedUserSocketId = "") => {
  io.emit("disconnected-user", {
    disconnectedUserSocketId: disconnectedUserSocketId,
  });
};

const convertOnlineUsersToArray = () => {
  const onlineUsersArray = [];
  Object.entries(onlineUsers).forEach(([key, value]) => {
    onlineUsersArray.push({
      socketId: key,
      nick: value.nick,
    });
  });

  return onlineUsersArray;
};

const logOnlineUsers = () => {
  let size = 0;
  console.log("Online users: ");
  Object.entries(onlineUsers).forEach(([key, value]) => {
    size++;
    console.log(`${key}: ${value.nick}`);
  });

  console.log(`Amount of online users: ${size}`);
};
