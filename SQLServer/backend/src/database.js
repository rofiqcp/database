const sql = require('mssql');

// SQL Server connection configuration from environment or defaults
const config = {
  user: process.env.MSSQL_USER || 'sa',
  password: process.env.MSSQL_PASSWORD || 'YourStrong!Password',
  server: process.env.MSSQL_SERVER || 'localhost',
  database: process.env.MSSQL_DATABASE || 'learning_db',
  port: parseInt(process.env.MSSQL_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  pool: {
    max: 20,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool;

// Connect to SQL Server
async function connectDatabase() {
  try {
    pool = await sql.connect(config);

    console.log('✓ Connected to SQL Server database');

    // Initialize database (create table and indexes)
    await initializeDatabase();
  } catch (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
}

// Initialize database schema and indexes
async function initializeDatabase() {
  try {
    const request = pool.request();

    // Create items table if not exists
    await request.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='items' AND xtype='U')
      CREATE TABLE items (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        category NVARCHAR(100),
        price DECIMAL(10,2) DEFAULT 0,
        quantity INT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
      )
    `);

    // Create indexes for better query performance
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_items_category' AND object_id = OBJECT_ID('items'))
      CREATE INDEX idx_items_category ON items(category)
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_items_name' AND object_id = OBJECT_ID('items'))
      CREATE INDEX idx_items_name ON items(name)
    `);

    console.log('✓ Database table and indexes created successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

// Get connection pool
function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return pool;
}

// Close database connection
async function closeDatabase() {
  if (pool) {
    await pool.close();
    console.log('✓ Database connection closed');
  }
}

module.exports = {
  connectDatabase,
  getPool,
  closeDatabase,
  sql
};
