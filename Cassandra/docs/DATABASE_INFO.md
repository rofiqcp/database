# Cassandra Database Information

## What is Apache Cassandra?

Apache Cassandra is a free and open-source, distributed, wide-column store, NoSQL database management system designed to handle large amounts of data across many commodity servers, providing high availability with no single point of failure.

### Key Features

- **Distributed**: Data is automatically distributed across multiple nodes
- **Decentralized**: No single point of failure, every node is identical
- **Scalable**: Linear scalability by adding more nodes
- **Fault Tolerant**: Data is replicated across multiple nodes
- **High Performance**: Optimized for high-throughput write operations
- **Tunable Consistency**: Choose between consistency and availability per query

## Cassandra in This Module

### Database Driver

This module uses **cassandra-driver** - the official DataStax Node.js driver for Apache Cassandra.

**Why cassandra-driver?**
- Official DataStax driver with full CQL support
- Connection pooling and load balancing
- Prepared statements for performance
- Automatic node discovery and failover
- Support for all Cassandra data types

### Connection Configuration

```javascript
const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'learning_db'
});
```

### Schema

```cql
CREATE KEYSPACE IF NOT EXISTS learning_db
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

CREATE TABLE items (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  category TEXT,
  price DECIMAL,
  quantity INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Indexes

```cql
CREATE INDEX idx_items_category ON items(category);
```

Secondary indexes enable querying by non-primary-key columns. For production, consider materialized views or Solr integration.

## Cassandra Data Types

| CQL Type | Description | Example |
|----------|-------------|---------|
| UUID | Universally unique identifier | 550e8400-e29b-41d4-a716-446655440000 |
| TEXT | UTF-8 string | 'Hello World' |
| INT | 32-bit signed integer | 42, -100 |
| BIGINT | 64-bit signed integer | 9223372036854775807 |
| DECIMAL | Variable-precision decimal | 1299.99 |
| FLOAT | 32-bit IEEE-754 floating point | 3.14 |
| DOUBLE | 64-bit IEEE-754 floating point | 3.14159265358979 |
| BOOLEAN | True or false | true, false |
| TIMESTAMP | Date and time | '2024-01-01 10:00:00' |
| BLOB | Arbitrary bytes | 0x0012345 |
| LIST | Ordered collection | ['a', 'b', 'c'] |
| SET | Unordered unique collection | {'a', 'b', 'c'} |
| MAP | Key-value pairs | {'key': 'value'} |

## Wide-Column Store Concepts

### What is a Wide-Column Store?

A wide-column store organizes data into rows and dynamic columns. Unlike relational databases with fixed schemas, each row can have different columns. Data is stored in column families (tables).

### Partition Key

The partition key determines which node stores the data. In this module, `id UUID` is the partition key.

```cql
-- id is the partition key
CREATE TABLE items (
  id UUID PRIMARY KEY,
  ...
);
```

### Clustering Columns

Clustering columns define the sort order within a partition. This module uses a simple primary key (partition key only).

```cql
-- Example with clustering column (not used in this module)
CREATE TABLE events (
  sensor_id UUID,
  event_time TIMESTAMP,
  value DOUBLE,
  PRIMARY KEY (sensor_id, event_time)
) WITH CLUSTERING ORDER BY (event_time DESC);
```

### Replication

Data is replicated across nodes for fault tolerance:

```cql
-- SimpleStrategy: Single datacenter
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 3}

-- NetworkTopologyStrategy: Multi-datacenter
WITH replication = {'class': 'NetworkTopologyStrategy', 'dc1': 3, 'dc2': 2}
```

## CQL vs SQL Differences

| Feature | SQL (Relational) | CQL (Cassandra) |
|---------|-------------------|------------------|
| Joins | Supported | Not supported |
| Subqueries | Supported | Not supported |
| Aggregations | Full support | Limited (COUNT, SUM, AVG, MIN, MAX) |
| ORDER BY | Any column | Only clustering columns |
| WHERE clause | Any column | Primary key or indexed columns |
| GROUP BY | Any column | Only partition/clustering keys |
| ALTER TABLE | Add/drop columns | Add/drop columns (no rename) |
| Transactions | ACID | Lightweight transactions (IF) |
| NULL handling | IS NULL/IS NOT NULL | Limited NULL checks |
| LIKE queries | Supported | Not natively supported |

### Key CQL Limitations
1. **No JOINs**: Design data model to avoid joins (denormalization)
2. **No LIKE queries**: Use secondary indexes or external search (Solr/Elasticsearch)
3. **Limited WHERE**: Can only filter on primary key or indexed columns
4. **ALLOW FILTERING**: Required for non-indexed queries (expensive, avoid in production)

## Advantages of Cassandra

### 1. **Scalability**
- Linear scalability: double nodes = double throughput
- No downtime for scaling
- Automatic data distribution

### 2. **High Availability**
- No single point of failure
- Multi-datacenter replication
- Automatic failover

### 3. **Write Performance**
- Optimized for writes
- Append-only storage (LSM trees)
- Extremely high write throughput

### 4. **Flexibility**
- Schema-free within tables
- Tunable consistency levels
- Support for complex data types (lists, maps, sets)

### 5. **Operational Simplicity**
- All nodes are equal (peer-to-peer)
- No master/slave architecture
- Easy to add/remove nodes

## Limitations

### 1. **Read Performance**
- Reads can be slower than writes
- Full table scans are expensive
- No efficient ad-hoc queries

### 2. **Data Modeling**
- Requires query-driven design
- Denormalization is necessary
- No joins between tables

### 3. **Consistency**
- Eventually consistent by default
- Strong consistency requires quorum reads/writes
- No multi-partition transactions

### 4. **Use Cases**
Best for:
- Time-series data (IoT sensors, logs, metrics)
- High-write workloads (event tracking, messaging)
- Geographically distributed applications
- Real-time big data applications
- Content management systems

Not ideal for:
- Complex queries with joins
- Small datasets (< 1GB)
- Strong consistency requirements
- Frequent schema changes
- Ad-hoc analytics

## Cassandra vs Other Databases

| Feature | Cassandra | PostgreSQL | MongoDB | Redis |
|---------|-----------|------------|---------|-------|
| Type | Wide-Column | Relational | Document | Key-Value |
| Scalability | Excellent | Good | Good | Good |
| Write Speed | Excellent | Good | Good | Excellent |
| Read Speed | Good | Excellent | Good | Excellent |
| Joins | No | Yes | Limited | No |
| Consistency | Tunable | Strong | Tunable | Strong |
| Best For | Big data, IoT | General purpose | Documents | Caching |

## RAM Requirements

### Minimum
- **1 GB**: Bare minimum for development and learning
- Suitable for single-node development setup

### Recommended
- **8 GB**: Development and small production workloads
- Cassandra uses significant memory for:
  - Memtables (write buffers)
  - Key cache
  - Row cache
  - Bloom filters
  - JVM heap

### Production
- **16-32 GB**: Recommended for production workloads
- **Heap size**: Typically 8 GB (max recommended)
- **Off-heap**: Additional memory for bloom filters and compression

### Memory Configuration
```yaml
# cassandra-env.sh
MAX_HEAP_SIZE="8G"
HEAP_NEWSIZE="2G"
```

## Consistency Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| ONE | Response from one replica | Lowest latency, risk of stale data |
| QUORUM | Majority of replicas | Balance of consistency and performance |
| ALL | All replicas must respond | Highest consistency, lowest availability |
| LOCAL_ONE | One replica in local DC | Multi-DC, low latency |
| LOCAL_QUORUM | Quorum in local DC | Multi-DC, good consistency |

## Backup and Maintenance

### Snapshot Backup
```bash
# Create snapshot
nodetool snapshot learning_db

# List snapshots
nodetool listsnapshots
```

### Repair
```bash
# Run repair (important for consistency)
nodetool repair learning_db
```

### Compaction
```bash
# Force compaction
nodetool compact learning_db items

# Check compaction stats
nodetool compactionstats
```

## Cassandra Tools

### 1. **cqlsh**
Command-line interface for CQL.

```bash
# Connect to Cassandra
cqlsh localhost 9042

# Common commands
DESCRIBE KEYSPACES;
USE learning_db;
DESCRIBE TABLES;
DESCRIBE TABLE items;
SELECT * FROM items;
```

### 2. **nodetool**
Administration tool for Cassandra.

```bash
nodetool status          # Cluster status
nodetool info            # Node info
nodetool tablestats learning_db.items  # Table statistics
nodetool flush           # Flush memtables to disk
```

### 3. **DataStax DevCenter**
GUI tool for CQL queries and database management.

### 4. **Apache Cassandra Reaper**
Automated repair tool for Cassandra clusters.

## Performance Tips

### 1. **Design for Queries**
```cql
-- Design table based on query patterns
CREATE TABLE items_by_category (
  category TEXT,
  created_at TIMESTAMP,
  id UUID,
  name TEXT,
  price DECIMAL,
  PRIMARY KEY (category, created_at)
) WITH CLUSTERING ORDER BY (created_at DESC);
```

### 2. **Use Prepared Statements**
```javascript
// Good - prepared statement (done automatically with { prepare: true })
await client.execute('SELECT * FROM items WHERE id = ?', [id], { prepare: true });

// Avoid - string interpolation (vulnerable to injection)
await client.execute(`SELECT * FROM items WHERE id = ${id}`);
```

### 3. **Avoid ALLOW FILTERING**
```cql
-- Bad: Full table scan
SELECT * FROM items WHERE price > 100 ALLOW FILTERING;

-- Good: Use secondary index or materialized view
CREATE MATERIALIZED VIEW items_by_price AS
  SELECT * FROM items
  WHERE price IS NOT NULL AND id IS NOT NULL
  PRIMARY KEY (price, id);
```

### 4. **Use Appropriate Consistency Levels**
```javascript
// For reads where eventual consistency is acceptable
await client.execute(query, params, {
  prepare: true,
  consistency: cassandra.types.consistencies.one
});

// For critical writes
await client.execute(query, params, {
  prepare: true,
  consistency: cassandra.types.consistencies.quorum
});
```

## Security Considerations

### 1. **CQL Injection Prevention**
Always use prepared statements (parameterized queries):

```javascript
// Safe - prepared statement
await client.execute('SELECT * FROM items WHERE id = ?', [id], { prepare: true });

// UNSAFE - vulnerable to CQL injection
await client.execute(`SELECT * FROM items WHERE id = ${userInput}`);
```

### 2. **Authentication**
Enable authentication in cassandra.yaml:
```yaml
authenticator: PasswordAuthenticator
```

### 3. **Authorization**
Enable role-based access control:
```yaml
authorizer: CassandraAuthorizer
```

### 4. **Encryption**
Enable client-to-node and node-to-node encryption for production.

### 5. **Input Validation**
Validate all user input before database operations (done in routes.js using validator library).

## Resources

- **Official Apache Cassandra**: https://cassandra.apache.org/
- **cassandra-driver Documentation**: https://docs.datastax.com/en/developer/nodejs-driver/
- **CQL Reference**: https://cassandra.apache.org/doc/latest/cql/
- **DataStax Academy**: https://academy.datastax.com/

## Conclusion

Apache Cassandra is an excellent choice for learning distributed database concepts because:
- Demonstrates NoSQL wide-column storage
- Teaches distributed systems principles
- Shows query-driven data modeling
- Perfect for understanding eventual consistency
- Great for high-write, time-series workloads

For simpler applications or applications requiring complex queries, consider PostgreSQL or MongoDB.
