const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Configuration
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-shared-with-host';

// Database Setup (PostgreSQL)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'chatty',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Initialize DB and Start Server
const init = async () => {
  let retries = 5;
  while (retries) {
    try {
      await pool.query(`DROP TABLE IF EXISTS messages`);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          project_id TEXT NOT NULL,
          username TEXT,
          avatar TEXT,
          content TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      // Add Index for project_id
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages (project_id)`);
      
      console.log('DB Initialized with project_id and Index');
      
// API: Generate Token (Simulating Host Logic)
app.post('/api/generate-token', (req, res) => {
  const { username, avatar, projectId } = req.body;
  if (!projectId) {
    return res.status(400).json({ error: 'projectId is required' });
  }
  // Include projectId in the token
  const token = jwt.sign({ username, avatar, projectId }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Socket.io Auth Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.user = decoded; // Contains { username, avatar, projectId }
    next();
  });
});
      
      server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
      break; // Success, exit loop

    } catch (err) {
      console.error(`Failed to initialize DB. Retries left: ${retries}`, err.message);
      retries -= 1;
      if (!retries) {
        console.error('Could not connect to DB after multiple attempts, exiting.');
        process.exit(1);
      }
      // Wait 5 seconds before retrying
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

init();
