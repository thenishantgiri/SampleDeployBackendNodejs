const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const SERVER_PORT = process.env.PORT || 3344;

const app = express();

const server = http.createServer(app);
const io = socketio(server);

let users = {
  thenishantgiri: "hola21",
};

let socketMap = {};

io.on("connection", (socket) => {
  console.log("connected with socket id = ", socket.id);

  function login(s, u) {
    s.join(u);
    s.emit("logged_in");
    socketMap[s.id] = u;
    console.log(socketMap);
  }

  socket.on("login", (data) => {
    if (users[data.username]) {
      if (users[data.username] == data.password) {
        login(socket, data.username);
      } else {
        socket.emit("login_failed");
      }
    } else {
      users[data.username] = data.password;
      login(socket, data.username);
    }
    console.log(users);
  });

  socket.on("msg_send", (data) => {
    data.from = socketMap[socket.id];
    if (data.to) {
      io.to(data.to).emit("msg_rcvd", data);
    } else {
      socket.broadcast.emit("msg_rcvd", data);
    }
  });
});

app.use("/", express.static(__dirname + "/public"));

server.listen(SERVER_PORT, () => {
  console.log("Server started on http://localhost:3344");
});
