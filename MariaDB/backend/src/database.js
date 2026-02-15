const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'learning_db',
  connectionLimit: 20,
  acquireTimeout: 20000,
});

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('✓ Connected to MariaDB database');
    conn.release();
  })
  .catch(err => {
    console.error('Error connecting to MariaDB database:', err);
  });

// Initialize database schema
async function initializeDatabase() {
  let conn;
  try {
    conn = await pool.getConnection();
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        price DECIMAL(10, 2),
        quantity INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    await conn.query(createTableSQL);
    
    // Create indexes
    await conn.query('CREATE INDEX IF NOT EXISTS idx_items_category ON items(category)').catch(() => {});
    await conn.query('CREATE INDEX IF NOT EXISTS idx_items_name ON items(name)').catch(() => {});
    
    console.log('✓ Database initialized successfully');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    if (conn) conn.release();
  }
}

initializeDatabase();

module.exports = pool;
