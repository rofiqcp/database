const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DATABASE || 'learning_db';

let db;
let client;

async function connectDatabase() {
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);

    // Create indexes
    await db.collection('items').createIndex({ category: 1 });
    await db.collection('items').createIndex({ name: 1 });

    console.log('✓ Connected to MongoDB database');
    return db;
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
}

function getDb() {
  return db;
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  if (client) await client.close();
  process.exit(0);
});

module.exports = { connectDatabase, getDb };
