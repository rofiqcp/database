const cassandra = require('cassandra-driver');

// Cassandra connection configuration from environment or defaults
const CONTACT_POINTS = (process.env.CASSANDRA_CONTACT_POINTS || 'localhost').split(',');
const LOCAL_DATACENTER = process.env.CASSANDRA_LOCAL_DATACENTER || 'datacenter1';
const KEYSPACE = process.env.CASSANDRA_KEYSPACE || 'learning_db';

let client;

// Connect to Cassandra
async function connectDatabase() {
  try {
    // First connect without keyspace to create it if needed
    const initClient = new cassandra.Client({
      contactPoints: CONTACT_POINTS,
      localDataCenter: LOCAL_DATACENTER
    });

    await initClient.connect();
    console.log('✓ Connected to Cassandra cluster');

    // Create keyspace if not exists
    await initClient.execute(`
      CREATE KEYSPACE IF NOT EXISTS ${KEYSPACE}
      WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
    `);
    console.log(`✓ Keyspace '${KEYSPACE}' ready`);

    await initClient.shutdown();

    // Connect with keyspace
    client = new cassandra.Client({
      contactPoints: CONTACT_POINTS,
      localDataCenter: LOCAL_DATACENTER,
      keyspace: KEYSPACE
    });

    await client.connect();
    console.log('✓ Connected to Cassandra database');

    // Initialize database (create tables and indexes)
    await initializeDatabase();
  } catch (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
}

// Initialize database schema and indexes
async function initializeDatabase() {
  try {
    // Create items table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id uuid PRIMARY KEY,
        name text,
        description text,
        category text,
        price decimal,
        quantity int,
        created_at timestamp,
        updated_at timestamp
      )
    `);

    // Create index on category for filtering
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_items_category ON items (category)
    `);

    console.log('✓ Database tables and indexes created successfully');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
}

// Get Cassandra client instance
function getClient() {
  if (!client) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return client;
}

// Close database connection
async function closeDatabase() {
  if (client) {
    await client.shutdown();
    console.log('✓ Database connection closed');
  }
}

module.exports = {
  connectDatabase,
  getClient,
  closeDatabase
};
