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

// Asosiy yo'l uchun handler
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>WebRTC Signaling Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          .status { background: #e7f3fe; padding: 15px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>WebRTC Signaling Server</h1>
        <div class="status">
          <p>✅ Server is running!</p>
          <p>Bu Socket.IO signaling server WebRTC uchun ishlayapti.</p>
          <p>Bu server URL manzilini Vercel'dagi frontend kodiga qo'shing.</p>
        </div>
      </body>
    </html>
  `);
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