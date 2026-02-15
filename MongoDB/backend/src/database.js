const { MongoClient } = require('mongodb');

// MongoDB connection string from environment or default to localhost
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB || 'learning_db';

let client;
let db;

// Connect to MongoDB
async function connectDatabase() {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    
    console.log('✓ Connected to MongoDB database');
    
    // Initialize database (create indexes)
    await initializeDatabase();
  } catch (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
}

// Initialize database schema and indexes
async function initializeDatabase() {
  try {
    const collection = db.collection('items');
    
    // Create indexes for better query performance
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ name: 1 });
    await collection.createIndex({ created_at: -1 });
    
    // Create text index for full-text search
    await collection.createIndex({ name: 'text', description: 'text' });
    
    console.log('✓ Database indexes created successfully');
  } catch (err) {
    console.error('Error creating indexes:', err);
  }
}

// Get database instance
function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
}

// Get collection
function getCollection(name) {
  return getDb().collection(name);
}

// Close database connection
async function closeDatabase() {
  if (client) {
    await client.close();
    console.log('✓ Database connection closed');
  }
}

module.exports = {
  connectDatabase,
  getDb,
  getCollection,
  closeDatabase
};
