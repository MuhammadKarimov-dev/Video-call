// server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Mijoz ulandi:", socket.id);

  socket.on("offer", (data) => {
    console.log("Offer qabul qilindi va uzatilmoqda");
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", (data) => {
    console.log("Answer qabul qilindi va uzatilmoqda");
    socket.broadcast.emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    console.log("ICE nomzod qabul qilindi va uzatilmoqda");
    socket.broadcast.emit("ice-candidate", data);
  });

  socket.on("disconnect", () => {
    console.log("Mijoz uzildi:", socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Signal server http://localhost:${PORT} manzilida ishga tushdi`);
}); 