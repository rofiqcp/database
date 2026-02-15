const nano = require('nano');

const couchdbUrl = process.env.COUCHDB_URL || 'http://admin:password@localhost:5984';
const dbName = process.env.COUCHDB_DATABASE || 'learning_db';

const couch = nano(couchdbUrl);

let db;

async function initializeDatabase() {
  try {
    // Try to create the database (it's ok if it already exists)
    try {
      await couch.db.create(dbName);
      console.log('✓ Created CouchDB database:', dbName);
    } catch (err) {
      if (err.statusCode === 412) {
        console.log('✓ CouchDB database already exists:', dbName);
      } else {
        throw err;
      }
    }
    
    db = couch.use(dbName);
    
    // Create design document for views (indexes)
    const designDoc = {
      _id: '_design/items',
      views: {
        by_category: {
          map: "function(doc) { if (doc.type === 'item') { emit(doc.category, doc); } }"
        },
        by_name: {
          map: "function(doc) { if (doc.type === 'item') { emit(doc.name, doc); } }"
        },
        by_created: {
          map: "function(doc) { if (doc.type === 'item') { emit(doc.created_at, doc); } }"
        },
        all_items: {
          map: "function(doc) { if (doc.type === 'item') { emit(doc.created_at, null); } }"
        }
      }
    };
    
    try {
      const existing = await db.get('_design/items');
      designDoc._rev = existing._rev;
      await db.insert(designDoc);
    } catch (err) {
      if (err.statusCode === 404) {
        await db.insert(designDoc);
      }
    }
    
    console.log('✓ Database initialized successfully');
  } catch (err) {
    console.error('Error initializing CouchDB database:', err);
  }
}

initializeDatabase();

function getDb() {
  return db || couch.use(dbName);
}

module.exports = { getDb, couch };
