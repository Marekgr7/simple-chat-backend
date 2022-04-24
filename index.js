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

io.on("connection", () => {
  console.log("new peer connected");
});

server.listen(3003, () => {
  console.log("listening on 3003");
});
