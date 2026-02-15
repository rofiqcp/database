# MongoDB Database Information

## What is MongoDB?

MongoDB is a source-available cross-platform document-oriented database program. Classified as a NoSQL database, MongoDB uses JSON-like documents with optional schemas (BSON format). It is one of the most popular NoSQL databases in the world.

### Key Features

- **Document-Oriented**: Stores data as flexible JSON-like BSON documents
- **Schema-Less**: No rigid schema required, documents can vary in structure
- **Scalable**: Built-in horizontal scaling with sharding
- **High Performance**: Optimized for read/write operations
- **Rich Query Language**: Powerful query syntax with aggregation framework
- **Replication**: Built-in replica sets for high availability
- **Indexing**: Support for various index types

## MongoDB in This Module

### Database Driver

This module uses the **official MongoDB Node.js driver** (mongodb ^6.3.0) - the officially supported driver maintained by MongoDB Inc.

**Why the official driver?**
- Maintained by MongoDB team
- Full feature support
- Excellent performance
- Async/await support
- Type-safe operations

### Database Connection

```
mongodb://localhost:27017
```

The module connects to a local MongoDB instance by default. The database and collection are automatically created on first use.

### Database & Collection

- **Database**: `learning_db`
- **Collection**: `items`

### Document Structure

```javascript
{
  _id: ObjectId("65a1b2c3d4e5f6a7b8c9d0e1"),  // Auto-generated
  name: "Item Name",                              // Required
  description: "Description text",                // Optional
  category: "Category",                           // Optional
  price: 99.99,                                   // Default: 0
  quantity: 10,                                    // Default: 0
  created_at: "2024-01-01T10:00:00.000Z",         // Auto-set
  updated_at: "2024-01-01T10:00:00.000Z"          // Auto-updated
}
```

### Indexes

```javascript
// Created automatically on connection
db.collection('items').createIndex({ category: 1 });
db.collection('items').createIndex({ name: 1 });
```

These indexes improve query performance for filtering and searching operations.

## MongoDB Data Types (BSON)

| BSON Type | Description | Example |
|-----------|-------------|---------|
| String | UTF-8 string | "Hello World" |
| Int32 | 32-bit integer | 42 |
| Int64 | 64-bit integer | 9007199254740993 |
| Double | 64-bit floating point | 3.14 |
| Boolean | true/false | true |
| Date | UTC datetime | ISODate("2024-01-01") |
| ObjectId | 12-byte unique ID | ObjectId("507f1f77bcf86cd799439011") |
| Array | Ordered list | [1, 2, 3] |
| Object | Embedded document | { key: "value" } |
| Null | Null value | null |
| Binary | Binary data | BinData(0, "...") |

## Key MongoDB Concepts

### Documents
MongoDB stores data as **documents** (similar to JSON objects). Each document is a BSON record with field-value pairs.

### Collections
A **collection** is a group of documents, analogous to a table in relational databases. Collections do not enforce a schema.

### ObjectId
Every document has a unique `_id` field. If not provided, MongoDB generates an **ObjectId** - a 12-byte value consisting of:
- 4-byte timestamp
- 5-byte random value
- 3-byte incrementing counter

### BSON
**BSON** (Binary JSON) is the binary representation MongoDB uses to store documents. It extends JSON with additional data types like ObjectId, Date, and Binary.

## Advantages of MongoDB

### 1. **Flexibility**
- Schema-less documents
- Easy to evolve data models
- No ALTER TABLE needed
- Mixed data types in collections

### 2. **Performance**
- Optimized for read/write operations
- In-memory processing
- Efficient indexing
- Horizontal scaling with sharding

### 3. **Developer Experience**
- JSON-like documents (natural for JavaScript)
- Rich query language
- Aggregation framework
- Easy to get started

### 4. **Scalability**
- Horizontal scaling (sharding)
- Replica sets for high availability
- Auto-failover
- Geographic distribution

### 5. **Perfect for Learning**
- No schema definition needed
- Quick setup
- Natural JSON format
- Flexible data modeling

## Limitations

### 1. **Transactions**
- Multi-document transactions supported but with overhead
- Single-document operations are atomic
- Not ideal for complex transactional workloads

### 2. **Joins**
- No native JOIN support (use $lookup aggregation)
- Denormalization preferred over normalization
- Embedded documents favored over references

### 3. **Storage**
- Can use more storage due to field name repetition
- BSON overhead for small documents
- No built-in compression by default (WiredTiger compresses)

### 4. **Use Cases**
Best for:
- Content management systems
- Real-time analytics
- IoT data
- Mobile applications
- Catalog and inventory
- User profiles
- Logging and event data

Not ideal for:
- Complex transactional systems (banking)
- Highly relational data
- Applications requiring strict ACID across multiple documents

## MongoDB vs Other Databases

| Feature | MongoDB | PostgreSQL | MySQL | SQLite |
|---------|---------|------------|-------|--------|
| Type | NoSQL (Document) | SQL (Relational) | SQL (Relational) | SQL (Embedded) |
| Schema | Flexible | Fixed | Fixed | Fixed |
| Scaling | Horizontal | Vertical | Vertical | None |
| Joins | $lookup | Native JOIN | Native JOIN | Native JOIN |
| Transactions | Multi-doc | Full ACID | Full ACID | Full ACID |
| Query Language | MongoDB Query | SQL | SQL | SQL |
| Best For | Flexible data | Complex queries | Web apps | Local/embedded |

## MongoDB Configuration

### Connection String Format
```
mongodb://[username:password@]host[:port]/[database][?options]
```

### Common Connection Options
```javascript
const client = new MongoClient(uri, {
  maxPoolSize: 10,           // Maximum connection pool size
  minPoolSize: 5,            // Minimum connection pool size
  connectTimeoutMS: 10000,   // Connection timeout
  socketTimeoutMS: 45000,    // Socket timeout
  retryWrites: true,         // Retry failed writes
  w: 'majority'              // Write concern
});
```

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=learning_db
```

## Backup and Maintenance

### Backup Database
```bash
# Export entire database
mongodump --db learning_db --out ./backup/

# Export specific collection
mongodump --db learning_db --collection items --out ./backup/

# Export to JSON
mongoexport --db learning_db --collection items --out items.json --jsonArray
```

### Restore Database
```bash
# Restore entire database
mongorestore --db learning_db ./backup/learning_db/

# Restore specific collection
mongorestore --db learning_db --collection items ./backup/learning_db/items.bson

# Import from JSON
mongoimport --db learning_db --collection items --file items.json --jsonArray
```

### Compact Collection
```javascript
db.runCommand({ compact: 'items' });
```

### Check Collection Stats
```javascript
db.items.stats();
```

## MongoDB Tools

### 1. **mongosh (MongoDB Shell)**
Interactive JavaScript shell for MongoDB.

```bash
# Connect to local MongoDB
mongosh

# Common commands
show dbs             # List databases
use learning_db      # Switch database
show collections     # List collections
db.items.find()      # Query all items
db.items.countDocuments()  # Count documents
```

### 2. **MongoDB Compass**
Free GUI tool for MongoDB.
- Visual data exploration
- Query builder
- Schema analysis
- Index management
- Performance insights

Download: https://www.mongodb.com/products/compass

### 3. **MongoDB for VS Code**
VS Code extension for MongoDB.
- Browse databases and collections
- Run queries
- View documents
- Playgrounds for testing

## Performance Tips

### 1. **Use Appropriate Indexes**
```javascript
// Single field index
db.items.createIndex({ category: 1 });

// Compound index
db.items.createIndex({ category: 1, price: -1 });

// Text index for search
db.items.createIndex({ name: "text", description: "text" });
```

### 2. **Use Projections**
```javascript
// Only return needed fields
db.items.find({}, { name: 1, price: 1, _id: 0 });
```

### 3. **Use Aggregation Pipeline for Complex Queries**
```javascript
db.items.aggregate([
  { $match: { category: "Electronics" } },
  { $group: { _id: "$category", avgPrice: { $avg: "$price" } } },
  { $sort: { avgPrice: -1 } }
]);
```

### 4. **Batch Operations**
```javascript
// Use bulkWrite for multiple operations
db.items.bulkWrite([
  { insertOne: { document: { name: "Item 1", price: 10 } } },
  { updateOne: { filter: { name: "Item 2" }, update: { $set: { price: 20 } } } }
]);
```

## Security Considerations

### 1. **NoSQL Injection Prevention**
Always validate and sanitize user input:

```javascript
// Safe - using driver methods
const item = await db.collection('items').findOne({ _id: new ObjectId(id) });

// UNSAFE - directly using user input in queries
const item = await db.collection('items').findOne(JSON.parse(userInput));
```

### 2. **Authentication**
Enable authentication in production:
```
mongodb://username:password@localhost:27017/learning_db
```

### 3. **Network Security**
- Bind to localhost in development
- Use TLS/SSL in production
- Configure firewall rules

### 4. **Input Validation**
Validate all user input before database operations (done in routes.js using validator library).

## Resources

- **Official MongoDB Website**: https://www.mongodb.com/
- **MongoDB Documentation**: https://www.mongodb.com/docs/
- **MongoDB Node.js Driver**: https://www.mongodb.com/docs/drivers/node/current/
- **MongoDB University**: https://university.mongodb.com/
- **MongoDB Compass**: https://www.mongodb.com/products/compass

## Conclusion

MongoDB is an excellent choice for learning NoSQL database concepts because:
- No schema definition needed
- Natural JSON format for JavaScript developers
- Rich query language
- Great for flexible, evolving data models
- Excellent tooling and community

For applications requiring strict relational integrity or complex transactions, consider PostgreSQL or MySQL.
