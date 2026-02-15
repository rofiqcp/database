const sql = require('mssql');

const config = {
  server: process.env.MSSQL_SERVER || 'localhost',
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  user: process.env.MSSQL_USER || 'sa',
  password: process.env.MSSQL_PASSWORD || 'YourStrong@Passw0rd',
  database: process.env.MSSQL_DATABASE || 'learning_db',
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000
  }
};

let pool;

async function initializeDatabase() {
  try {
    pool = await sql.connect(config);
    console.log('✓ Connected to SQL Server');
    
    // Create table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'items')
      CREATE TABLE items (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        category NVARCHAR(100),
        price DECIMAL(10,2),
        quantity INT DEFAULT 0,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
      )
    `);
    
    // Create indexes
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_items_category')
      CREATE INDEX idx_items_category ON items(category)
    `);
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'idx_items_name')
      CREATE INDEX idx_items_name ON items(name)
    `);
    
    console.log('✓ Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

function getPool() {
  return pool;
}

initializeDatabase();

module.exports = { getPool, sql };
