# HBase Database Information

## What is HBase?

Apache HBase is a distributed, scalable, wide-column NoSQL database built on top of the Hadoop Distributed File System (HDFS). It is modeled after Google's Bigtable and provides random, real-time read/write access to big data.

### Key Features

- **Wide-Column Store**: Data organized by column families
- **Hadoop Integration**: Built on top of HDFS for distributed storage
- **Linear Scalability**: Scale horizontally by adding more nodes
- **Real-Time Access**: Random read/write access to petabytes of data
- **Strong Consistency**: Strongly consistent reads and writes
- **Automatic Sharding**: Data automatically split across regions

## HBase in This Module

### Database Client

This module uses the **hbase** npm package - a Node.js client for HBase REST/Thrift API.

**Why HBase REST API?**
- Language-agnostic interface
- HTTP-based communication
- Easy integration with Node.js
- No Java dependencies in application code
- Simple JSON/XML data exchange

### Database Connection

```javascript
// Connection via REST API
const hbase = require('hbase');

const client = hbase({
  host: 'localhost',
  port: 8080          // REST API port
});
```

The HBase REST server must be running before starting the application.

### Table Schema

```
Table: items
Column Family: data

Row Key: UUID v4

Column Qualifiers:
  data:name          String (required)
  data:description   String (optional)
  data:category      String (optional)
  data:price         Number (default: 0)
  data:quantity      Number (default: 0)
  data:created_at    ISO String (auto-generated)
  data:updated_at    ISO String (auto-updated)
```

### HBase Architecture

```
+-------------------+
|   Client (REST)   |
+-------------------+
        |
+-------------------+
|   REST Server     |  (Port 8080)
+-------------------+
        |
+-------------------+
|   HBase Master    |  (Port 16010)
+-------------------+
        |
+-------------------+
|  Region Servers   |  (Port 16020)
+-------------------+
        |
+-------------------+
|      HDFS         |
+-------------------+
        |
+-------------------+
|    ZooKeeper      |
+-------------------+
```

## HBase Data Types

HBase stores all data as byte arrays. The application layer handles type conversion.

| Type | Storage | Example |
|------|---------|---------|
| String | byte[] | "Hello", "Description" |
| Number | byte[] (as string) | "42", "3.14", "1299.99" |
| Boolean | byte[] (as string) | "true", "false" |
| Date | byte[] (ISO string) | "2024-01-01T10:00:00.000Z" |
| Binary | byte[] | Raw binary data |

## Advantages of HBase

### 1. **Massive Scalability**
- Handles petabytes of data
- Linear horizontal scaling
- Automatic region splitting
- No single point of failure

### 2. **Real-Time Performance**
- Fast random read/write access
- Consistent low-latency operations
- Optimized for sparse data
- Efficient column-family storage

### 3. **Hadoop Ecosystem**
- Built on HDFS for reliable storage
- MapReduce integration
- Works with Spark, Hive, Pig
- ZooKeeper for coordination

### 4. **Strong Consistency**
- Strongly consistent reads
- Row-level atomic operations
- No eventual consistency issues
- Reliable data guarantees

### 5. **Column-Family Design**
- Flexible schema within column families
- Efficient storage of sparse data
- Column qualifiers can be added dynamically
- Versioned data support

## Comparison with Other Databases

| Feature | HBase | MongoDB | MySQL |
|---------|-------|---------|-------|
| Type | Wide-Column | Document | Relational |
| Schema | Column Families | Flexible | Fixed |
| Scalability | Excellent | Good | Limited |
| Max Data Size | Petabytes | Unlimited | Limited |
| Query Language | REST/Scan | MQL | SQL |
| Joins | No | Limited | Yes |
| ACID | Row-level | Document-level | Full |
| Best For | Big Data | General | Structured |
| RAM Recommended | 16-64 GB | 4-16 GB | 2-8 GB |

## HBase Shell Commands

```bash
# Start HBase shell
hbase shell

# List all tables
list

# Create table with column family
create 'items', 'data'

# Describe table
describe 'items'

# Put data (insert/update)
put 'items', 'row1', 'data:name', 'Laptop'
put 'items', 'row1', 'data:price', '1299.99'
put 'items', 'row1', 'data:category', 'Electronics'

# Get a row
get 'items', 'row1'

# Get specific column
get 'items', 'row1', 'data:name'

# Scan all rows
scan 'items'

# Scan with filter
scan 'items', { FILTER => "SingleColumnValueFilter('data', 'category', =, 'binary:Electronics')" }

# Count rows
count 'items'

# Delete a column
delete 'items', 'row1', 'data:description'

# Delete entire row
deleteall 'items', 'row1'

# Disable and drop table
disable 'items'
drop 'items'

# Status
status
```

## HBase REST API

```bash
# Check cluster status
curl http://localhost:8080/status/cluster

# List tables
curl http://localhost:8080/

# Get table schema
curl http://localhost:8080/items/schema

# Get a row
curl http://localhost:8080/items/row1

# Scan table
curl http://localhost:8080/items/*

# Put data (XML)
curl -X PUT http://localhost:8080/items/row1/data:name \
  -H "Content-Type: application/octet-stream" \
  -d "Laptop"

# Delete a row
curl -X DELETE http://localhost:8080/items/row1
```

## Connection Configuration

```javascript
// Local HBase REST API
const client = hbase({
  host: 'localhost',
  port: 8080
});

// Remote HBase
const client = hbase({
  host: 'hbase-server.example.com',
  port: 8080
});

// With Kerberos authentication
const client = hbase({
  host: 'localhost',
  port: 8080,
  krb5: {
    principal: 'user@REALM',
    keytab: '/path/to/keytab'
  }
});
```

## Backup and Maintenance

### Backup Table
```bash
# Using HBase snapshot
hbase shell
snapshot 'items', 'items_snapshot'

# Export snapshot to HDFS
hbase org.apache.hadoop.hbase.snapshot.ExportSnapshot \
  -snapshot items_snapshot \
  -copy-to hdfs://backup-cluster/hbase

# Using HBase export
hbase org.apache.hadoop.hbase.mapreduce.Export \
  items /backup/items
```

### Restore Table
```bash
# Restore from snapshot
hbase shell
disable 'items'
restore_snapshot 'items_snapshot'
enable 'items'

# Import from backup
hbase org.apache.hadoop.hbase.mapreduce.Import \
  items /backup/items
```

### Monitor Performance
```bash
# Check RegionServer status
curl http://localhost:16010/status/cluster

# Monitor with JMX
curl http://localhost:16010/jmx

# Check region distribution
hbase shell
status 'detailed'
```

## HBase Tools

### 1. **HBase Shell**
Interactive command-line tool for HBase operations.

### 2. **HBase Master Web UI**
Web interface at http://localhost:16010
- Cluster status
- Table information
- Region distribution
- Server metrics

### 3. **Apache Phoenix**
SQL layer on top of HBase:
```sql
-- Create table
CREATE TABLE items (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  price DECIMAL,
  category VARCHAR
);

-- Query data
SELECT * FROM items WHERE category = 'Electronics';
```

### 4. **HBase REST Server**
RESTful interface for language-agnostic access.

## Performance Tips

### 1. **Row Key Design**
```
# Good: Distribute writes evenly
# Use UUID or salted keys to avoid hotspots
# Bad: Sequential keys cause region hotspots
```

### 2. **Column Family Optimization**
```
# Keep related data in same column family
# Use few column families (1-3 recommended)
# Set appropriate block size and bloom filters
```

### 3. **Caching Configuration**
```xml
<!-- hbase-site.xml -->
<property>
  <name>hbase.regionserver.global.memstore.size</name>
  <value>0.4</value>
</property>
<property>
  <name>hfile.block.cache.size</name>
  <value>0.4</value>
</property>
```

### 4. **Compression**
```bash
# Enable compression on column family
hbase shell
alter 'items', {NAME => 'data', COMPRESSION => 'SNAPPY'}
```

## Security Considerations

### 1. **Authentication**
```xml
<!-- Enable Kerberos -->
<property>
  <name>hbase.security.authentication</name>
  <value>kerberos</value>
</property>
```

### 2. **Authorization**
```xml
<!-- Enable ACLs -->
<property>
  <name>hbase.security.authorization</name>
  <value>true</value>
</property>
```

### 3. **Encryption**
```xml
<!-- Enable encryption at rest -->
<property>
  <name>hbase.regionserver.wal.encryption</name>
  <value>true</value>
</property>
```

## Resources

- **Official HBase Website**: https://hbase.apache.org/
- **HBase Reference Guide**: https://hbase.apache.org/book.html
- **HBase REST API**: https://hbase.apache.org/book.html#_rest
- **Apache Phoenix**: https://phoenix.apache.org/
- **HBase npm Package**: https://www.npmjs.com/package/hbase

## Conclusion

HBase is excellent for big data applications because:
- Handles petabytes of structured data
- Linear horizontal scalability
- Real-time read/write access
- Strong consistency guarantees
- Deep Hadoop ecosystem integration

Perfect for:
- Big data analytics
- Real-time data serving
- IoT data storage
- Time-series data
- Log aggregation and analysis
- Content management at scale
