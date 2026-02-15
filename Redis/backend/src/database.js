const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('connect', () => console.log('✓ Connected to Redis'));

async function connectDatabase() {
  await client.connect();
  return client;
}

function getClient() {
  return client;
}

module.exports = { connectDatabase, getClient };
