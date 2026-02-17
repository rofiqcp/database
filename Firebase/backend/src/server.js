require('dotenv').config();
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const http = require('http');
const dataRoutes = require('./routes');
const database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: 'Firebase Firestore',
    timestamp: new Date().toISOString() 
  });
});

// API routes
app.use('/api', dataRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found' 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('✓ New WebSocket client connected');
  
  // Send connection success message
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to Firebase real-time updates',
    timestamp: new Date().toISOString()
  }));
  
  // Set up Firestore real-time listener
  const unsubscribe = database.setupRealtimeListener((change) => {
    // Send change to connected WebSocket client
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'data_change',
        changeType: change.type, // 'added', 'modified', 'removed'
        data: change.item,
        timestamp: new Date().toISOString()
      }));
    }
  });
  
  // Handle client messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received WebSocket message:', data);
      
      // Echo back for testing
      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log('✗ WebSocket client disconnected');
    // Unsubscribe from Firestore listener
    if (unsubscribe) {
      unsubscribe();
    }
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast to all connected WebSocket clients
wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Firebase Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: Firebase Firestore`);
  console.log(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`🔌 WebSocket server listening on ws://localhost:${PORT}/ws`);
});

module.exports = app;
