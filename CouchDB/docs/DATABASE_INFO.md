# CouchDB Database Information

## What is CouchDB?

Apache CouchDB is an open-source NoSQL document database that uses JSON to store data, JavaScript as its query language (MapReduce), and HTTP for its API. CouchDB embraces the web with a unique approach to data storage and access.

### Key Features

- **Document-Oriented**: Stores data as JSON documents
- **HTTP API**: Built-in RESTful HTTP API for all operations
- **MVCC (Multi-Version Concurrency Control)**: Handles concurrent updates with revisions
- **MapReduce Views**: JavaScript-based views for indexing and querying
- **Mango Queries**: MongoDB-like query syntax for easier querying
- **Master-Master Replication**: Bi-directional replication between databases
- **Offline-First**: Designed for applications that need to work offline
- **Fauxton Web UI**: Built-in web administration interface
- **ACID Semantics**: Per-document ACID properties
- **Open Source**: Apache License 2.0

## CouchDB in This Module

### Database Driver

This module uses **nano** - the official Apache CouchDB client for Node.js.

**Why nano?**
- Official CouchDB driver for Node.js
- Simple, minimalistic API
- Full CouchDB API coverage
- Promise-based interface
- Active maintenance and community support
- Lightweight with minimal dependencies

### Connection Configuration

```javascript
const nano = require('nano');

const couch = nano('http://admin:password@localhost:5984');
const db = couch.use('learning_db');
```

### Document Structure

CouchDB stores data as JSON documents. Each document has:

```json
{
  "_id": "auto-generated-uuid",
  "_rev": "1-abc123def456",
  "type": "item",
  "name": "Laptop",
  "description": "Gaming laptop",
  "category": "Electronics",
  "price": 1299.99,
  "quantity": 5,
  "created_at": "2024-01-01T10:00:00.000Z",
  "updated_at": "2024-01-01T10:00:00.000Z"
}
```

## CouchDB Core Concepts

### Documents

Documents are the primary unit of data in CouchDB. They are self-contained JSON objects.

```javascript
// Create a document
const doc = {
  type: 'item',
  name: 'Laptop',
  price: 1299.99
};
const result = await db.insert(doc);
// result: { ok: true, id: 'auto-uuid', rev: '1-abc123' }
```

### Document IDs (`_id`)

Every document has a unique `_id` field. CouchDB auto-generates UUIDs, or you can provide custom IDs.

```javascript
// Auto-generated ID
await db.insert({ name: 'Item' });

// Custom ID
await db.insert({ _id: 'my-custom-id', name: 'Item' });
```

### Revisions (`_rev`)

CouchDB uses Multi-Version Concurrency Control (MVCC). Every document update creates a new revision.

```javascript
// Get document with its revision
const doc = await db.get('document-id');
// doc._rev = '1-abc123'

// Update requires the current revision
doc.name = 'Updated Name';
await db.insert(doc);
// New revision: '2-def456'
```

### Design Documents and Views

Design documents contain MapReduce views for querying data:

```javascript
const designDoc = {
  _id: '_design/items',
  views: {
    by_category: {
      map: "function(doc) { if (doc.type === 'item') { emit(doc.category, doc); } }"
    },
    by_name: {
      map: "function(doc) { if (doc.type === 'item') { emit(doc.name, doc); } }"
    }
  }
};
await db.insert(designDoc);
```

### Mango Queries

CouchDB supports MongoDB-style queries via the `_find` endpoint:

```javascript
// Find all items in Electronics category
const result = await db.find({
  selector: {
    type: 'item',
    category: 'Electronics'
  },
  sort: [{ created_at: 'desc' }],
  limit: 100
});
```

## CouchDB Data Types

### JSON Native Types

CouchDB stores JSON natively, supporting all JSON types:

- **String**: `"name": "Laptop"`
- **Number**: `"price": 1299.99`
- **Boolean**: `"active": true`
- **Null**: `"description": null`
- **Array**: `"tags": ["electronics", "portable"]`
- **Object**: `"specs": {"ram": "16GB", "storage": "512GB"}`

### Special Fields

- **`_id`**: Document identifier (string, auto-generated UUID)
- **`_rev`**: Revision identifier (string, auto-managed)
- **`_deleted`**: Deletion marker (boolean)
- **`_attachments`**: Binary attachments (object)

## Query Syntax

### Mango Query Operators

```javascript
// Equality
{ selector: { category: 'Electronics' } }

// Comparison operators
{ selector: { price: { $gt: 100 } } }     // Greater than
{ selector: { price: { $gte: 100 } } }    // Greater than or equal
{ selector: { price: { $lt: 500 } } }     // Less than
{ selector: { price: { $lte: 500 } } }    // Less than or equal
{ selector: { price: { $ne: 0 } } }       // Not equal

// Logical operators
{ selector: { $and: [{ category: 'Electronics' }, { price: { $gt: 100 } }] } }
{ selector: { $or: [{ category: 'Electronics' }, { category: 'Books' }] } }
{ selector: { category: { $not: { $eq: 'Electronics' } } } }

// Existence
{ selector: { description: { $exists: true } } }

// Array operators
{ selector: { tags: { $in: ['electronics', 'portable'] } } }
{ selector: { tags: { $nin: ['deprecated'] } } }

// Regex
{ selector: { name: { $regex: "(?i)laptop" } } }
```

### MapReduce Views

```javascript
// Query a view
const result = await db.view('items', 'by_category', {
  key: 'Electronics',
  include_docs: true
});

// View with range
const result = await db.view('items', 'by_created', {
  startkey: '2024-01-01',
  endkey: '2024-12-31',
  include_docs: true
});

// Reduce example
const designDoc = {
  _id: '_design/stats',
  views: {
    count_by_category: {
      map: "function(doc) { if (doc.type === 'item') { emit(doc.category, 1); } }",
      reduce: "_count"
    },
    total_price: {
      map: "function(doc) { if (doc.type === 'item') { emit(doc.category, doc.price); } }",
      reduce: "_sum"
    }
  }
};
```

## Replication

CouchDB's killer feature is master-master replication:

```javascript
// Replicate from one database to another
await couch.db.replicate('source_db', 'target_db');

// Continuous replication
await couch.db.replicate('source_db', 'http://remote:5984/target_db', {
  continuous: true
});

// Filtered replication
await couch.db.replicate('source_db', 'target_db', {
  filter: 'mydesign/myfilter'
});
```

### Use Cases for Replication
- **Backup**: Replicate to a backup server
- **Load Balancing**: Distribute reads across replicas
- **Offline-First Apps**: Sync data between local and remote databases
- **Geographic Distribution**: Keep data close to users
- **Mobile Apps**: Sync with PouchDB on the client side

## Conflict Resolution

CouchDB handles conflicts automatically during replication:

```javascript
// Check for conflicts
const doc = await db.get('document-id', { conflicts: true });
if (doc._conflicts) {
  // Handle conflicts
  for (const rev of doc._conflicts) {
    const conflictDoc = await db.get('document-id', { rev });
    // Resolve conflict...
    await db.destroy('document-id', rev);
  }
}
```

## Attachments

Store binary data as document attachments:

```javascript
// Add attachment
await db.attachment.insert('document-id', 'photo.jpg', 
  imageBuffer, 'image/jpeg', { rev: doc._rev });

// Get attachment
const attachment = await db.attachment.get('document-id', 'photo.jpg');

// Delete attachment
await db.attachment.destroy('document-id', 'photo.jpg', { rev: doc._rev });
```

## CouchDB vs Other Databases

### vs PostgreSQL
- ✅ Schema-free (flexible data structure)
- ✅ Built-in HTTP API
- ✅ Master-master replication
- ✅ Offline-first design
- ❌ No joins or complex relational queries
- ❌ No SQL support

### vs MongoDB
- ✅ Built-in HTTP API (no separate driver needed)
- ✅ True master-master replication
- ✅ Better conflict resolution
- ✅ Simpler architecture
- ❌ Less query flexibility
- ❌ Smaller ecosystem

### vs SQLite
- ✅ Multi-user/concurrent access
- ✅ Built-in replication
- ✅ HTTP API
- ❌ Requires server setup
- ❌ More complex deployment

## Performance Tips

### Mango Indexes

Create indexes for frequently queried fields:

```javascript
// Create index
await db.createIndex({
  index: {
    fields: ['type', 'category', 'created_at']
  },
  name: 'idx-type-category-created'
});

// Create index for sorting
await db.createIndex({
  index: {
    fields: ['type', 'price']
  },
  name: 'idx-type-price'
});
```

### View Optimization

```javascript
// Use include_docs sparingly
const result = await db.view('items', 'all_items', {
  include_docs: true,  // Adds overhead
  limit: 100,
  skip: 0
});

// Emit values in the view instead
// map: function(doc) { emit(doc.created_at, { name: doc.name, price: doc.price }); }
```

### Compaction

```bash
# Compact database (remove old revisions)
curl -X POST http://admin:password@localhost:5984/learning_db/_compact

# Compact views
curl -X POST http://admin:password@localhost:5984/learning_db/_compact/items
```

## Best Practices

1. **Use a `type` field** to distinguish document types in the same database
2. **Design views carefully** - they are computed incrementally
3. **Use Mango queries** for simple queries, MapReduce for complex aggregations
4. **Create indexes** for frequently queried fields
5. **Handle conflicts** in replication scenarios
6. **Compact regularly** to reclaim disk space
7. **Use bulk operations** for inserting/updating many documents
8. **Don't store large binary files** inline - use attachments

## Resources

- [CouchDB Official Docs](https://docs.couchdb.org/)
- [nano Documentation](https://github.com/apache/couchdb-nano)
- [CouchDB Guide](https://guide.couchdb.org/)
- [PouchDB](https://pouchdb.com/) - CouchDB for the browser
- [Fauxton](https://couchdb.apache.org/fauxton-visual-guide/) - CouchDB Web UI

## Security Notes

- Always set admin credentials (don't run in Admin Party mode)
- Use HTTPS for remote connections
- Limit database access with CouchDB's built-in authentication
- Validate documents with validate_doc_update functions
- Keep CouchDB updated
- Regular backups via replication

## Backup and Restore

```bash
# Backup via replication
curl -X POST http://admin:password@localhost:5984/_replicate \
  -H "Content-Type: application/json" \
  -d '{"source": "learning_db", "target": "learning_db_backup"}'

# Backup to file (using couchbackup)
npm install -g @cloudant/couchbackup
couchbackup --url http://admin:password@localhost:5984 --db learning_db > backup.txt

# Restore from file
cat backup.txt | couchrestore --url http://admin:password@localhost:5984 --db learning_db_restored
```
