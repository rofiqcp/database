const oracledb = require('oracledb');

// Oracle Database connection configuration from environment
const ORACLE_USER = process.env.ORACLE_USER || 'system';
const ORACLE_PASSWORD = process.env.ORACLE_PASSWORD || 'oracle';
const ORACLE_CONNECT_STRING = process.env.ORACLE_CONNECT_STRING || 'localhost:1521/XEPDB1';

// Set output format to object (column names as keys)
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let pool;

// Connect to Oracle Database (create connection pool)
async function connectDatabase() {
  try {
    pool = await oracledb.createPool({
      user: ORACLE_USER,
      password: ORACLE_PASSWORD,
      connectString: ORACLE_CONNECT_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1
    });

    console.log('✓ Connected to Oracle Database');

    // Initialize database (create tables and indexes)
    await initializeDatabase();
  } catch (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
}

// Initialize database schema and indexes
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();

    // Create items table if not exists
    const tableExists = await connection.execute(
      `SELECT COUNT(*) AS cnt FROM user_tables WHERE table_name = 'ITEMS'`
    );

    if (tableExists.rows[0].CNT === 0) {
      await connection.execute(`
        CREATE TABLE items (
          id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          name VARCHAR2(255) NOT NULL,
          description CLOB,
          category VARCHAR2(100),
          price NUMBER(10,2) DEFAULT 0,
          quantity NUMBER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✓ Items table created');
    }

    // Create indexes (ignore errors if they already exist)
    try {
      await connection.execute('CREATE INDEX idx_items_category ON items(category)');
    } catch (e) {
      // Index may already exist
    }

    try {
      await connection.execute('CREATE INDEX idx_items_name ON items(name)');
    } catch (e) {
      // Index may already exist
    }

    console.log('✓ Database indexes created successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Get a connection from the pool
async function getConnection() {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return await pool.getConnection();
}

// Close database connection pool
async function closeDatabase() {
  if (pool) {
    await pool.close(0);
    console.log('✓ Database connection pool closed');
  }
}

module.exports = {
  connectDatabase,
  getConnection,
  closeDatabase
};
