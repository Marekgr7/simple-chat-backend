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
});

server.listen(3003, () => {
  console.log("listening on 3003");
});

const newSocketConnectionEventHandler = (socketId) => {
  addOnlineUser(socketId);
  logOnlineUsers();
};

const addOnlineUser = (socketId) => {
  onlineUsers[socketId] = {
    nick: null,
  };
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
