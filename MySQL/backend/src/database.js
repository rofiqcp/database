const mysql = require('mysql2/promise');

// MySQL connection pool configuration
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'learning_db',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});

// Test database connection
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✓ Connected to MySQL database');
  })
  .catch((err) => {
    console.error('Error connecting to MySQL database:', err);
  });

// Initialize database schema
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();

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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await connection.query(createTableSQL);

    // Create indexes for better query performance
    await connection.query('CREATE INDEX idx_items_category ON items(category)').catch(() => {});
    await connection.query('CREATE INDEX idx_items_name ON items(name)').catch(() => {});

    console.log('✓ Database initialized successfully');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    if (connection) connection.release();
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
