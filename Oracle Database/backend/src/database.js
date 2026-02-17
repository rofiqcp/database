const oracledb = require('oracledb');

// Oracle connection pool configuration
const dbConfig = {
  user: process.env.ORACLE_USER || 'system',
  password: process.env.ORACLE_PASSWORD || 'oracle',
  connectString: process.env.ORACLE_CONNECT_STRING || 'localhost:1521/XEPDB1',
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1
};

let pool;

async function initializeDatabase() {
  try {
    pool = await oracledb.createPool(dbConfig);
    console.log('✓ Connected to Oracle Database');
    
    const connection = await pool.getConnection();
    try {
      // Create sequence for auto-increment
      try {
        await connection.execute('CREATE SEQUENCE items_seq START WITH 1 INCREMENT BY 1');
      } catch (err) {
        // Sequence might already exist (ORA-00955)
        if (err.errorNum !== 955) throw err;
      }
      
      // Create table
      try {
        await connection.execute(`
          CREATE TABLE items (
            id NUMBER PRIMARY KEY,
            name VARCHAR2(255) NOT NULL,
            description CLOB,
            category VARCHAR2(100),
            price NUMBER(10,2),
            quantity NUMBER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } catch (err) {
        if (err.errorNum !== 955) throw err;
      }
      
      // Create trigger for auto-increment
      try {
        await connection.execute(`
          CREATE OR REPLACE TRIGGER items_bi
          BEFORE INSERT ON items
          FOR EACH ROW
          BEGIN
            IF :NEW.id IS NULL THEN
              SELECT items_seq.NEXTVAL INTO :NEW.id FROM DUAL;
            END IF;
          END;
        `);
      } catch (err) {
        // Trigger creation errors
      }
      
      // Create indexes
      try {
        await connection.execute('CREATE INDEX idx_items_category ON items(category)');
      } catch (err) {
        if (err.errorNum !== 1408) throw err; // Index already exists
      }
      
      try {
        await connection.execute('CREATE INDEX idx_items_name ON items(name)');
      } catch (err) {
        if (err.errorNum !== 1408) throw err;
      }
      
      await connection.commit();
      console.log('✓ Database initialized successfully');
    } finally {
      await connection.close();
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

async function getConnection() {
  return pool.getConnection();
}

initializeDatabase();

module.exports = { getConnection, pool: () => pool };
