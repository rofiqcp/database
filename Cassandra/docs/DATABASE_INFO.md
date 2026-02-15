# Cassandra Database Information

## What is Apache Cassandra?

Apache Cassandra is a free and open-source, distributed, wide-column store, NoSQL database management system designed to handle large amounts of data across many commodity servers, providing high availability with no single point of failure.

### Key Features

- **Distributed Architecture**: Data distributed across multiple nodes
- **Fault-Tolerant**: No single point of failure
- **Linearly Scalable**: Add nodes to increase capacity
- **High Performance**: Optimized for write-heavy workloads
- **AP System**: Availability and Partition tolerance (CAP theorem)
- **Open Source**: Free and open-source under Apache License

## Cassandra in This Module

### Database Driver

This module uses **cassandra-driver** - the official DataStax Node.js driver for Apache Cassandra.

**Why cassandra-driver?**
- Official DataStax driver
- Prepared statements support
- Automatic node discovery
- Connection pooling
- Load balancing policies
- Retry policies

### Database Connection

```javascript
// Connection Configuration
const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
  keyspace: 'learning_db'
});
```

The Cassandra server must be running before starting the application.

### Schema (Tables)

```cql
-- Items Table Structure
CREATE TABLE items (
  id uuid PRIMARY KEY,
  name text,
  description text,
  category text,
  price decimal,
  quantity int,
  created_at timestamp,
  updated_at timestamp
);

-- Secondary Index
CREATE INDEX idx_items_category ON items (category);
```

### Indexes

```cql
-- Secondary index on category for filtering
CREATE INDEX IF NOT EXISTS idx_items_category ON items (category);
```

Secondary indexes allow querying by non-primary key columns.

## Cassandra Data Types

| CQL Type | Description | Example |
|----------|-------------|---------|
| uuid | Universally unique identifier | 550e8400-e29b-41d4-a716-446655440000 |
| text | UTF-8 encoded string | 'Hello', 'Description' |
| int | 32-bit signed integer | 42, 100 |
| decimal | Variable-precision decimal | 3.14, 1299.99 |
| boolean | True or false | true, false |
| timestamp | Date and time | '2024-01-01T10:00:00Z' |
| blob | Binary large object | Binary data |
| list | Ordered collection | ['item1', 'item2'] |
| set | Unordered unique collection | {'tag1', 'tag2'} |
| map | Key-value pairs | {'key': 'value'} |

## Advantages of Cassandra

### 1. **Distributed & Decentralized**
- No single point of failure
- Every node is identical (peer-to-peer)
- Data replicated across multiple nodes
- Seamless multi-datacenter replication

### 2. **Linear Scalability**
- Add nodes to increase throughput linearly
- No downtime for scaling
- Handles petabytes of data
- Millions of operations per second

### 3. **High Availability**
- Tunable consistency levels
- Automatic data replication
- Survives node failures gracefully
- 99.999% uptime achievable

### 4. **Write Performance**
- Optimized for write-heavy workloads
- Append-only storage engine (LSM trees)
- No read-before-write overhead
- Excellent for time-series data

### 5. **Flexible Data Model**
- Wide-column store
- Dynamic columns per row
- Collections (lists, sets, maps)
- User-defined types

## Cassandra vs MongoDB

| Feature | Cassandra | MongoDB |
|---------|-----------|---------|
| Data Model | Wide-column | Document |
| Query Language | CQL | MQL |
| Consistency | Tunable | Strong/Eventual |
| CAP Theorem | AP | CP |
| Write Performance | Excellent | Good |
| Read Performance | Good | Excellent |
| Scalability | Linear | Horizontal |
| Schema | Table-based | Schema-less |
| Best For | Write-heavy, time-series | Read-heavy, flexible schema |

## CQL (Cassandra Query Language)

CQL is similar to SQL but designed for Cassandra's distributed architecture:

```cql
-- Create Keyspace
CREATE KEYSPACE IF NOT EXISTS my_keyspace
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 3};

-- Use Keyspace
USE my_keyspace;

-- Create Table
CREATE TABLE users (
  id uuid PRIMARY KEY,
  name text,
  email text,
  created_at timestamp
);

-- Insert Data
INSERT INTO users (id, name, email, created_at)
VALUES (uuid(), 'John Doe', 'john@example.com', toTimestamp(now()));

-- Select Data
SELECT * FROM users WHERE id = 550e8400-e29b-41d4-a716-446655440000;

-- Update Data
UPDATE users SET name = 'Jane Doe' WHERE id = 550e8400-e29b-41d4-a716-446655440000;

-- Delete Data
DELETE FROM users WHERE id = 550e8400-e29b-41d4-a716-446655440000;
```

## Partition Keys and Clustering Keys

Understanding Cassandra's primary key is essential:

```cql
-- Simple Primary Key
CREATE TABLE items (
  id uuid PRIMARY KEY,
  name text
);

-- Composite Primary Key
CREATE TABLE sensor_data (
  sensor_id uuid,
  reading_time timestamp,
  value double,
  PRIMARY KEY (sensor_id, reading_time)
);
-- sensor_id = partition key
-- reading_time = clustering key (determines sort order within partition)

-- Compound Partition Key
CREATE TABLE logs (
  year int,
  month int,
  day int,
  log_time timestamp,
  message text,
  PRIMARY KEY ((year, month), day, log_time)
);
-- (year, month) = compound partition key
-- day, log_time = clustering keys
```

## Connection Configuration

```javascript
// Local Cassandra Connection
const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
  keyspace: 'learning_db'
});

// Multi-node Connection
const client = new cassandra.Client({
  contactPoints: ['node1', 'node2', 'node3'],
  localDataCenter: 'dc1',
  keyspace: 'learning_db'
});

// With Authentication
const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
  keyspace: 'learning_db',
  credentials: { username: 'cassandra', password: 'cassandra' }
});
```

## Backup and Maintenance

### Backup Database
```bash
# Using nodetool snapshot
nodetool snapshot learning_db

# Find snapshots
find /var/lib/cassandra/data -name snapshots

# Using sstableloader for restore
sstableloader -d localhost /path/to/snapshot/
```

### Repair and Maintenance
```bash
# Run repair on a keyspace
nodetool repair learning_db

# Compact SSTables
nodetool compact learning_db items

# Check cluster status
nodetool status

# View table statistics
nodetool tablestats learning_db.items
```

## Cassandra Tools

### 1. **CQL Shell (cqlsh)**
Official Cassandra command-line interface.

```bash
# Connect to Cassandra
cqlsh localhost 9042

# Common commands
DESCRIBE KEYSPACES;           # List keyspaces
DESCRIBE TABLES;              # List tables
DESCRIBE TABLE items;         # Show table schema
SELECT * FROM items;          # Query data
```

### 2. **DataStax DevCenter**
GUI tool for Cassandra development.

### 3. **Apache Cassandra Stress**
Built-in stress testing tool.
```bash
cassandra-stress write n=1000000 -rate threads=50
```

## Performance Tips

### 1. **Design Tables Around Queries**
```cql
-- Design table for the query you need
-- Query: Get items by category sorted by price
CREATE TABLE items_by_category (
  category text,
  price decimal,
  id uuid,
  name text,
  PRIMARY KEY (category, price, id)
) WITH CLUSTERING ORDER BY (price DESC);
```

### 2. **Use Prepared Statements**
```javascript
// Always use prepared statements for better performance
const query = 'SELECT * FROM items WHERE id = ?';
const result = await client.execute(query, [id], { prepare: true });
```

### 3. **Batch Operations**
```javascript
// Use batches for atomic operations
const queries = [
  { query: 'INSERT INTO items (id, name) VALUES (?, ?)', params: [id1, 'Item1'] },
  { query: 'INSERT INTO items (id, name) VALUES (?, ?)', params: [id2, 'Item2'] }
];
await client.batch(queries, { prepare: true });
```

### 4. **Tune Consistency Levels**
```javascript
// Use appropriate consistency level
const result = await client.execute(query, params, {
  prepare: true,
  consistency: cassandra.types.consistencies.one // or quorum, all
});
```

## Security Considerations

### 1. **Authentication**
```yaml
# cassandra.yaml
authenticator: PasswordAuthenticator
```

### 2. **Authorization**
```cql
-- Grant permissions
GRANT SELECT ON KEYSPACE learning_db TO readonly_user;
GRANT MODIFY ON KEYSPACE learning_db TO app_user;
```

### 3. **Encryption**
```yaml
# Enable client-to-node encryption
client_encryption_options:
  enabled: true
  keystore: /path/to/keystore.jks
  keystore_password: password
```

## Resources

- **Official Apache Cassandra Website**: https://cassandra.apache.org/
- **Cassandra Documentation**: https://cassandra.apache.org/doc/latest/
- **DataStax Node.js Driver**: https://docs.datastax.com/en/developer/nodejs-driver/
- **DataStax Academy**: https://academy.datastax.com/
- **DataStax Astra**: https://astra.datastax.com/

## Conclusion

Apache Cassandra is excellent for:
- Time-series data and IoT applications
- High-write throughput applications
- Applications requiring linear scalability
- Multi-datacenter deployments
- Applications needing high availability (99.999%)

Perfect for:
- IoT sensor data
- Time-series analytics
- Messaging platforms
- Recommendation engines
- Large-scale web applications
- Fraud detection systems
