# MongoDB Database Information

## What is MongoDB?

MongoDB is a popular, document-oriented NoSQL database that stores data in flexible, JSON-like documents. It is designed for scalability, flexibility, and modern application development.

### Key Features

- **Document-Based**: Stores data as JSON-like documents (BSON)
- **Flexible Schema**: No predefined schema required
- **Scalability**: Built-in horizontal scaling with sharding
- **High Performance**: Optimized for read and write operations
- **ACID Compliant**: Atomic transactions for reliable data consistency
- **Open Source**: Free and open-source for any use

## MongoDB in This Module

### Database Driver

This module uses **mongoose** - a popular MongoDB object modeling library for Node.js.

**Why Mongoose?**
- Elegant MongoDB object modeling
- Schema validation and casting
- Middleware (hooks) support
- Query builder with chainable API
- Comprehensive error handling

### Database Connection

```javascript
// Connection String Format
mongodb://username:password@host:port/database
// or for MongoDB Atlas (Cloud)
mongodb+srv://username:password@cluster.mongodb.net/database
```

The MongoDB server must be running before starting the application.

### Schema (Collections)

```javascript
// Items Collection Document Structure
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: String,           // Required
  description: String,    // Optional
  category: String,       // Optional
  price: Number,          // Default: 0
  quantity: Number,       // Default: 0
  created_at: Date,       // Auto-generated
  updated_at: Date        // Auto-updated
}
```

### Indexes

```javascript
// Single Field Indexes
db.items.createIndex({ category: 1 });
db.items.createIndex({ name: 1 });

// Compound Index
db.items.createIndex({ category: 1, price: -1 });

// Text Index for full-text search
db.items.createIndex({ name: "text", description: "text" });
```

These indexes improve query performance for filtering, searching, and sorting operations.

## MongoDB Data Types

| BSON Type | Description | Example |
|-----------|-------------|---------|
| ObjectId | Unique identifier | ObjectId("507f1f77bcf86cd799439011") |
| String | Text string | "Hello", "Description" |
| Number | Integer or Double | 42, 3.14, 1299.99 |
| Boolean | True or false | true, false |
| Date | Date and time | new Date("2024-01-01T10:00:00Z") |
| Array | Ordered list | ["item1", "item2"] |
| Null | Null value | null |
| Object | Nested document | { key: "value" } |
| Binary | Binary data | Binary data, image files |

## Advantages of MongoDB

### 1. **Flexibility**
- Flexible schema allows dynamic fields
- No migration needed for schema changes
- Documents can have different structures
- Ideal for evolving applications

### 2. **Scalability**
- Built-in horizontal scaling with sharding
- Handles large datasets efficiently
- Excellent for big data applications
- Distributed architecture

### 3. **Performance**
- Fast read and write operations
- Optimized indexing strategies
- Aggregation pipeline for complex queries
- Efficient for document-heavy workloads

### 4. **Developer-Friendly**
- JSON-like document format (BSON)
- Natural fit for JavaScript/Node.js
- Intuitive query language
- Rich documentation and community

### 5. **High Concurrency**
- Excellent for concurrent reads and writes
- Multi-document transactions
- Suitable for high-traffic applications
- Built-in replication for reliability

## Advantages over SQLite

| Feature | SQLite | MongoDB |
|---------|--------|---------|
| Server Required | No | Yes |
| Network Access | No | Yes |
| Concurrent Writes | Limited | Excellent |
| Scalability | Limited | Excellent |
| Max DB Size | ~281 TB | Unlimited |
| Schema Flexibility | Fixed | Flexible |
| Replication | No | Built-in |
| Sharding | No | Built-in |
| Best For | Small, local apps | Scalable, cloud apps |

## MongoDB Query Operators

MongoDB supports powerful query operators for flexible filtering:

```javascript
// Comparison Operators
{ price: { $gte: 100 } }        // Greater than or equal
{ price: { $lte: 500 } }        // Less than or equal
{ quantity: { $gt: 10 } }       // Greater than
{ price: { $lt: 50 } }          // Less than
{ name: { $eq: "Laptop" } }     // Equal
{ category: { $ne: "Books" } }  // Not equal

// Logical Operators
{ $and: [{ price: { $gte: 100 } }, { category: "Electronics" }] }
{ $or: [{ category: "Books" }, { category: "Electronics" }] }

// String Operators
{ name: { $regex: "lap" } }     // Pattern matching
{ description: /gaming/i }      // Case-insensitive regex

// Array Operators
{ tags: { $in: ["new", "sale"] } }        // In array
{ tags: { $all: ["new", "sale"] } }       // Contains all
{ $size: { $eq: 3 } }                     // Array size
```

## Aggregation Pipeline

MongoDB's aggregation pipeline enables complex data processing:

```javascript
// Example aggregation
db.items.aggregate([
  { $match: { category: "Electronics" } },
  { $group: { _id: "$category", avgPrice: { $avg: "$price" } } },
  { $sort: { avgPrice: -1 } },
  { $limit: 10 }
])

// Common Stages
{ $match: { ... } }           // Filter documents
{ $group: { ... } }           // Group by field
{ $sort: { field: 1 } }       // Sort results
{ $limit: 10 }                // Limit results
{ $project: { ... } }         // Reshape documents
{ $lookup: { ... } }          // Join collections
```

## Connection Configuration

```javascript
// Local MongoDB Connection
const mongoURI = 'mongodb://localhost:27017/mydb';

// MongoDB Atlas (Cloud)
const mongoURI = 'mongodb+srv://user:password@cluster0.mongodb.net/dbname';

// Connection Options
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
});
```

## Backup and Maintenance

### Backup Database
```bash
# Using mongodump
mongodump --uri="mongodb://localhost:27017/mydb" --out=./backup

# Backup specific collection
mongodump --uri="mongodb://localhost:27017/mydb" -c items --out=./backup

# Using MongoDB Atlas automated backups
# Enabled by default in MongoDB Atlas
```

### Restore Database
```bash
# Using mongorestore
mongorestore --uri="mongodb://localhost:27017/mydb" ./backup

# Restore specific collection
mongorestore --uri="mongodb://localhost:27017/mydb" -c items ./backup
```

### Analyze Database Performance
```javascript
// Explain query execution
db.items.find({ category: "Electronics" }).explain("executionStats")

// Check index usage
db.items.find({ category: "Electronics" }).hint({ category: 1 })
```

## MongoDB Tools

### 1. **MongoDB Shell (mongosh)**
Official MongoDB shell for interactive queries.

```bash
# Connect to MongoDB
mongosh "mongodb://localhost:27017"

# Common commands
show databases          # List databases
show collections        # List collections in current database
db.items.find()        # Query documents
db.items.insertOne({}) # Insert document
db.items.deleteOne({}) # Delete document
db.items.updateOne({}, { $set: {} })  # Update document
```

### 2. **MongoDB Compass**
Official GUI tool for MongoDB.
- Visual database explorer
- Query builder with visual editor
- Data editing and export
- Performance analysis

Download: https://www.mongodb.com/products/compass

### 3. **VS Code MongoDB Extension**
MongoDB for VS Code - explore and work with MongoDB databases.

## Performance Tips

### 1. **Use Bulk Operations**
```javascript
// Better performance than individual operations
const operations = [
  { insertOne: { document: { name: "Item1" } } },
  { insertOne: { document: { name: "Item2" } } }
];
await Item.collection.bulkWrite(operations);
```

### 2. **Leverage Indexes**
```javascript
// Create indexes for frequently queried fields
itemSchema.index({ category: 1 });
itemSchema.index({ name: 'text', description: 'text' });
itemSchema.index({ category: 1, price: -1 });
```

### 3. **Use Projection to Limit Fields**
```javascript
// Retrieve only needed fields
const items = await Item.find(
  { category: "Electronics" },
  { name: 1, price: 1, _id: 0 }
);
```

### 4. **Implement Connection Pooling**
```javascript
// Mongoose handles connection pooling automatically
mongoose.connect(mongoURI, {
  maxPoolSize: 10,      // Maximum connections
  minPoolSize: 5        // Minimum connections
});
```

## Security Considerations

### 1. **Input Validation and Sanitization**
Always validate and sanitize user input before database operations:

```javascript
// Safe with Mongoose schema validation
const itemSchema = new Schema({
  name: { type: String, required: true, trim: true }
});

// Validate before query
const name = sanitizeInput(userInput);
```

### 2. **Authentication and Authorization**
Enable MongoDB authentication:

```javascript
// Connection with credentials
const uri = 'mongodb://username:password@host:27017/dbname';

// Set appropriate user roles and permissions
// Use MongoDB Atlas role-based access control (RBAC)
```

### 3. **Encryption**
Enable encryption at rest and in transit:

```javascript
// Connection with SSL/TLS
mongoose.connect(mongoURI, {
  tls: true,
  tlsCAFile: '/path/to/ca.pem'
});
```

### 4. **Principle of Least Privilege**
Create users with minimal required permissions:

```javascript
// Example: Read-only user for reports
db.createUser({
  user: "reportUser",
  pwd: "securePassword",
  roles: [{ role: "read", db: "mydb" }]
})
```

## Resources

- **Official MongoDB Website**: https://www.mongodb.com/
- **MongoDB Manual**: https://docs.mongodb.com/manual/
- **Mongoose Documentation**: https://mongoosejs.com/
- **MongoDB University**: https://university.mongodb.com/
- **MongoDB Compass**: https://www.mongodb.com/products/compass

## Conclusion

MongoDB is excellent for modern application development because:
- Flexible schema for evolving applications
- Natural JSON/BSON format for JavaScript
- Scalable architecture for growing data
- Rich query language and aggregation pipeline
- Built-in replication and sharding

Perfect for:
- Web and mobile applications
- Content management systems
- Real-time analytics
- Microservices architectures
- Cloud-native applications
