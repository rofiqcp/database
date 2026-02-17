require('dotenv').config();
const neo4j = require('neo4j-driver');

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD;

if (!password) {
  console.error('❌ NEO4J_PASSWORD environment variable is required');
  process.exit(1);
}

// Create driver instance
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
  maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
  maxConnectionPoolSize: 50,
  connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
});

// Verify connectivity
async function verifyConnectivity() {
  const session = driver.session();
  try {
    await session.run('RETURN 1');
    console.log('✓ Connected to Neo4j database');
  } catch (error) {
    console.error('❌ Failed to connect to Neo4j:', error.message);
    throw error;
  } finally {
    await session.close();
  }
}

// Initialize database schema (indexes and constraints)
async function initializeDatabase() {
  const session = driver.session();
  try {
    // Create constraints for unique IDs
    await session.run(`
      CREATE CONSTRAINT item_id_unique IF NOT EXISTS
      FOR (i:Item) REQUIRE i.id IS UNIQUE
    `);
    
    await session.run(`
      CREATE CONSTRAINT category_id_unique IF NOT EXISTS
      FOR (c:Category) REQUIRE c.id IS UNIQUE
    `);
    
    await session.run(`
      CREATE CONSTRAINT tag_id_unique IF NOT EXISTS
      FOR (t:Tag) REQUIRE t.id IS UNIQUE
    `);
    
    // Create indexes for better query performance
    await session.run(`
      CREATE INDEX item_name_index IF NOT EXISTS
      FOR (i:Item) ON (i.name)
    `);
    
    await session.run(`
      CREATE INDEX category_name_index IF NOT EXISTS
      FOR (c:Category) ON (c.name)
    `);
    
    await session.run(`
      CREATE INDEX tag_name_index IF NOT EXISTS
      FOR (t:Tag) ON (t.name)
    `);
    
    console.log('✓ Database schema initialized (constraints and indexes created)');
  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  } finally {
    await session.close();
  }
}

// Initialize on startup
(async () => {
  try {
    await verifyConnectivity();
    await initializeDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();

// Helper function to execute a query
async function executeQuery(cypher, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result;
  } finally {
    await session.close();
  }
}

// Helper to convert Neo4j integers to JavaScript numbers
function toNativeTypes(obj) {
  if (obj === null || obj === undefined) return obj;
  
  if (neo4j.isInt(obj)) {
    return obj.toNumber();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(toNativeTypes);
  }
  
  if (typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = toNativeTypes(obj[key]);
    }
    return newObj;
  }
  
  return obj;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nClosing Neo4j driver...');
  await driver.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nClosing Neo4j driver...');
  await driver.close();
  process.exit(0);
});

module.exports = {
  driver,
  executeQuery,
  toNativeTypes
};
