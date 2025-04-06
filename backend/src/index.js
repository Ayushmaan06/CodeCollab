import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './db/index.js';
import { app } from './app.js';
import { initSocketServer } from './socket/index.js'; // << new import
import express from 'express';
import geminiRoute from './routes/gemini.js';

dotenv.config({ path: "./.env" });

app.use(express.json());
app.use('/api/gemini', geminiRoute);

connectDB()
  .then(() => {
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:5173",
        credentials: true,
      },
    });

    // Delegate to clean socket file
    initSocketServer(io);

    server.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.log(" MONGO DB connection failed", error);
  });
