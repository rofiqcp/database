const cassandra = require('cassandra-driver');

const contactPoints = (process.env.CASSANDRA_CONTACT_POINTS || '127.0.0.1').split(',');
const localDataCenter = process.env.CASSANDRA_DATACENTER || 'datacenter1';
const keyspace = process.env.CASSANDRA_KEYSPACE || 'learning_db';

const client = new cassandra.Client({
  contactPoints,
  localDataCenter,
  keyspace: undefined // Connect without keyspace first
});

async function initializeDatabase() {
  try {
    await client.connect();
    console.log('✓ Connected to Cassandra');

    // Create keyspace
    await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS ${keyspace}
      WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
    `);

    client.keyspace = keyspace;

    // Create table
    await client.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id UUID PRIMARY KEY,
        name TEXT,
        description TEXT,
        category TEXT,
        price DECIMAL,
        quantity INT,
        created_at TIMESTAMP,
        updated_at TIMESTAMP
      )
    `);

    // Create secondary index for category
    await client.execute('CREATE INDEX IF NOT EXISTS idx_items_category ON items(category)');

    console.log('✓ Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initializeDatabase();

module.exports = client;
