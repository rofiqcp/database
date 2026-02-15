# HBase Database Information

## What is HBase?

Apache HBase is an open-source, distributed, versioned, non-relational database modeled after Google's Bigtable. It is a column-oriented NoSQL database that runs on top of the Hadoop Distributed File System (HDFS) and provides real-time read/write access to large datasets.

### Key Features

- **Distributed**: Scales horizontally across clusters of commodity hardware
- **Column-Oriented**: Data stored by column families, not rows
- **Versioned**: Every cell can have multiple versions with timestamps
- **Strongly Consistent**: Provides strong consistency for reads and writes
- **Auto-Sharding**: Tables automatically split across regions
- **Hadoop Integration**: Built on top of HDFS and works with MapReduce

## HBase Architecture

### Core Components

#### 1. HMaster
- Manages RegionServers
- Handles schema changes (create/delete tables)
- Load balancing across RegionServers
- Monitors cluster health

#### 2. RegionServer
- Hosts and manages regions (partitions of tables)
- Handles read/write requests
- Manages MemStore and HFiles
- Performs compactions

#### 3. ZooKeeper
- Provides coordination service
- Stores HBase cluster state
- Handles leader election for HMaster
- Monitors RegionServer health

#### 4. HDFS
- Provides persistent storage
- Stores HFiles (data files)
- Provides replication for fault tolerance

### Data Model

```
Table
├── Row Key: "user_001"
│   ├── Column Family: "info"
│   │   ├── info:name = "John" (timestamp: 1704067200000)
│   │   ├── info:email = "john@example.com" (timestamp: 1704067200000)
│   │   └── info:age = "30" (timestamp: 1704067200000)
│   └── Column Family: "meta"
│       ├── meta:created = "2024-01-01" (timestamp: 1704067200000)
│       └── meta:status = "active" (timestamp: 1704067200000)
├── Row Key: "user_002"
│   ├── Column Family: "info"
│   │   ├── info:name = "Jane"
│   │   └── info:email = "jane@example.com"
│   └── Column Family: "meta"
│       └── meta:created = "2024-01-02"
```

## HBase in This Module

### Learning Emulator

This module uses an in-memory HBase emulator that faithfully replicates the column-family storage model. In production, you would connect to HBase via:

1. **HBase REST API (Stargate)** - HTTP-based access
2. **HBase Thrift API** - Cross-language RPC access
3. **Java API** - Native Java client

### Column Families

```
Table: items
├── Column Family: info
│   ├── info:name        (item name)
│   ├── info:description (item description)
│   └── info:category    (item category)
└── Column Family: meta
    ├── meta:price       (item price)
    ├── meta:quantity    (stock quantity)
    ├── meta:created_at  (creation timestamp)
    └── meta:updated_at  (update timestamp)
```

### Row Key Design

Row keys use UUID v4 in this learning module. In production HBase:

```
# Good row key designs:
user_20240101_uuid          # Composite key
reverse_timestamp_category  # For time-series queries
md5(user_id)               # For even distribution

# Bad row key designs:
sequential_id              # Causes hot-spotting
timestamp                  # Monotonically increasing = hot region
```

## HBase Data Types

HBase stores all data as byte arrays. Data type interpretation is the client's responsibility.

| Concept | Description | Example |
|---------|-------------|---------|
| Row Key | Unique row identifier | "user_001", UUID |
| Column Family | Group of related columns | "info", "meta" |
| Column Qualifier | Specific column within family | "name", "email" |
| Cell | Intersection of row, family, qualifier | "John" |
| Timestamp | Version identifier | 1704067200000 |

## Advantages of HBase

### 1. **Scalability**
- Scales to billions of rows and millions of columns
- Horizontal scaling by adding more RegionServers
- Automatic region splitting as data grows

### 2. **Performance**
- Optimized for random read/write access
- Write-optimized with LSM-tree architecture
- Sub-millisecond reads for known row keys
- Excellent for sparse data

### 3. **Flexibility**
- Schema-free within column families
- Dynamic column creation
- No need to pre-define all columns
- Columns can vary per row

### 4. **Reliability**
- Built on HDFS with data replication
- Automatic failover
- Write-Ahead Log (WAL) for durability
- Consistent reads and writes

### 5. **Hadoop Ecosystem**
- Native MapReduce integration
- Works with Apache Spark
- Compatible with Apache Phoenix (SQL layer)
- Integrates with Apache Hive

## Limitations

### 1. **Complexity**
- Requires Hadoop/HDFS infrastructure
- Complex setup and administration
- ZooKeeper dependency
- Steep learning curve

### 2. **Query Limitations**
- No native SQL support (use Apache Phoenix)
- Limited secondary indexes
- No joins or complex queries
- Row key-based access pattern

### 3. **Resource Requirements**
- High memory requirements
- Minimum 2GB RAM (development)
- Recommended 16-64GB RAM (production)
- Requires multiple nodes for production

### 4. **Use Cases**

Best for:
- Big data applications (billions of rows)
- Real-time analytics
- Time-series data
- IoT sensor data
- Log aggregation
- Social media feeds
- Messaging platforms

Not ideal for:
- Small datasets (<1M rows)
- Complex queries with joins
- ACID transactions across rows
- Applications needing SQL
- Simple CRUD applications

## HBase vs Other Databases

| Feature | HBase | PostgreSQL | MySQL | MongoDB | Cassandra |
|---------|-------|------------|-------|---------|-----------|
| Type | Wide-Column | Relational | Relational | Document | Wide-Column |
| Scalability | Excellent | Good | Good | Excellent | Excellent |
| Consistency | Strong | Strong | Strong | Tunable | Tunable |
| Query Language | Shell/API | SQL | SQL | MQL | CQL |
| Joins | No | Yes | Yes | Limited | No |
| Schema | Flexible | Fixed | Fixed | Flexible | Semi-fixed |
| Best For | Big Data | Web Apps | Web Apps | Documents | Time-Series |
| Infrastructure | Hadoop | Standalone | Standalone | Standalone | Standalone |

## HBase Shell Commands

### Table Operations
```bash
# Create table with column families
create 'items', 'info', 'meta'

# List tables
list

# Describe table
describe 'items'

# Disable and drop table
disable 'items'
drop 'items'
```

### Data Operations
```bash
# Put (insert/update) data
put 'items', 'row1', 'info:name', 'Laptop'
put 'items', 'row1', 'info:category', 'Electronics'
put 'items', 'row1', 'meta:price', '1299.99'

# Get a row
get 'items', 'row1'

# Get specific column
get 'items', 'row1', 'info:name'

# Scan all rows
scan 'items'

# Scan with limit
scan 'items', { LIMIT => 10 }

# Delete a cell
delete 'items', 'row1', 'info:category'

# Delete entire row
deleteall 'items', 'row1'
```

### Filtering
```bash
# Scan with filter
scan 'items', { FILTER => "SingleColumnValueFilter('info', 'category', =, 'binary:Electronics')" }

# Prefix filter on row key
scan 'items', { FILTER => "PrefixFilter('user_')" }

# Column prefix filter
scan 'items', { FILTER => "ColumnPrefixFilter('name')" }
```

## HBase REST API (Stargate)

In production, use the HBase REST API:

```bash
# Get cluster version
curl http://localhost:8080/version/cluster

# Get table schema
curl http://localhost:8080/items/schema

# Get a row (JSON format)
curl -H "Accept: application/json" http://localhost:8080/items/row1

# Put data
curl -X PUT http://localhost:8080/items/row1/info:name \
  -H "Content-Type: application/octet-stream" \
  -d "Laptop"

# Scan table
curl -H "Accept: application/json" http://localhost:8080/items/*

# Delete a row
curl -X DELETE http://localhost:8080/items/row1
```

## Performance Tips

### 1. **Row Key Design**
The most critical performance factor. Keys should:
- Distribute data evenly across regions
- Support your most common access patterns
- Avoid sequential/monotonic patterns

### 2. **Column Family Design**
```bash
# Good: Group related data that's accessed together
create 'users', 'profile', 'activity'

# Bad: Too many column families (max 2-3 recommended)
create 'users', 'name', 'email', 'age', 'phone'
```

### 3. **Batch Operations**
```java
// Use batch puts for bulk writes
List<Put> puts = new ArrayList<>();
puts.add(new Put(Bytes.toBytes("row1")).addColumn(...));
puts.add(new Put(Bytes.toBytes("row2")).addColumn(...));
table.put(puts);
```

### 4. **Caching and Bloom Filters**
```bash
# Enable bloom filters for faster lookups
create 'items', { NAME => 'info', BLOOMFILTER => 'ROW' }

# Set block cache
create 'items', { NAME => 'info', IN_MEMORY => 'true' }
```

## Security Considerations

### 1. **Authentication**
HBase supports Kerberos authentication for secure clusters.

### 2. **Authorization**
Use HBase ACLs (Access Control Lists) to manage permissions:
```bash
# Grant permissions
grant 'user1', 'RWXCA', 'items'

# Revoke permissions
revoke 'user1', 'items'
```

### 3. **Encryption**
- Enable encryption at rest for HDFS
- Use TLS/SSL for RPC encryption
- Configure WAL encryption

### 4. **Input Validation**
Always validate input before database operations (done in routes.js using validator library).

## Resources

- **Official HBase Website**: https://hbase.apache.org/
- **HBase Reference Guide**: https://hbase.apache.org/book.html
- **Apache Phoenix (SQL for HBase)**: https://phoenix.apache.org/
- **HBase Shell Tutorial**: https://hbase.apache.org/book.html#shell
- **Google Bigtable Paper**: https://research.google/pubs/bigtable-a-distributed-storage-system-for-structured-data/

## Conclusion

HBase is an excellent choice for learning about distributed wide-column databases because:
- Industry-standard for big data workloads
- Deep integration with Hadoop ecosystem
- Understanding column-family model is valuable
- Used by companies like Facebook, Twitter, and Yahoo

For smaller applications, consider simpler databases like PostgreSQL or MongoDB. For similar distributed column stores without Hadoop dependency, consider Apache Cassandra.
