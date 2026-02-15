require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDatabase } = require('./database');
const dataRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

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
    database: 'Redis',
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

// Connect to Redis and start server
connectDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Redis Backend Server running on http://localhost:${PORT}`);
    console.log(`📊 Database: Redis`);
    console.log(`🔗 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  });
}).catch((err) => {
  console.error('Failed to connect to Redis:', err);
  process.exit(1);
});

module.exports = app;
