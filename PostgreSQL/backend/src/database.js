const { Pool } = require('pg');

// PostgreSQL connection configuration
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'learning_db',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err);
  } else {
    console.log('✓ Connected to PostgreSQL database');
  }
});

// Initialize database schema
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        price NUMERIC(10, 2),
        quantity INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await client.query(createTableSQL);
    
    // Create indexes for better query performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_items_category ON items(category)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_items_name ON items(name)');
    
    console.log('✓ Database initialized successfully');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    client.release();
  }
}

// Initialize the database
initializeDatabase();

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
