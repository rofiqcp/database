const redis = require('redis');

// Redis client configuration
const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: process.env.REDIS_DB || 0,
});

// Error handling
client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('✓ Connecting to Redis server...');
});

client.on('ready', () => {
  console.log('✓ Redis client ready');
});

// Connect to Redis
(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Error connecting to Redis:', err);
    process.exit(1);
  }
})();

// Initialize Redis data structures
async function initializeRedis() {
  try {
    // Check if items:ids set exists, if not initialize it
    const exists = await client.exists('items:ids');
    if (!exists) {
      console.log('✓ Initializing Redis data structures');
      // Initialize empty set for item IDs
      await client.set('items:next_id', '1');
      console.log('✓ Redis initialized successfully');
    } else {
      console.log('✓ Redis data structures already exist');
    }
  } catch (err) {
    console.error('Error initializing Redis:', err);
  }
}

// Initialize Redis on startup
initializeRedis();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nGracefully shutting down...');
  await client.quit();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await client.quit();
  process.exit(0);
});

module.exports = client;
