# Redis Database Information

## What is Redis?

Redis (Remote Dictionary Server) is an open-source, in-memory data structure store used as a database, cache, message broker, and streaming engine. It supports various data structures such as strings, hashes, lists, sets, sorted sets, bitmaps, hyperloglogs, geospatial indexes, and streams.

### Key Features

- **In-Memory**: All data stored in RAM for ultra-fast access
- **Data Structures**: Supports strings, lists, sets, hashes, sorted sets, and more
- **Persistence**: Optional disk persistence with RDB snapshots and AOF logs
- **Pub/Sub**: Built-in publish/subscribe messaging
- **Atomic Operations**: All operations are atomic
- **Replication**: Master-replica replication support
- **Clustering**: Redis Cluster for horizontal scaling
- **Lua Scripting**: Server-side scripting support
- **TTL**: Built-in key expiration (Time-To-Live)

## Redis in This Module

### Database Driver

This module uses **node-redis** (v4.x) - the official Redis client for Node.js.

**Why node-redis?**
- Official Redis client
- Promise-based API
- TypeScript support
- Lua scripting support
- Cluster and Sentinel support
- Auto-reconnection

### Connection

```
redis://localhost:6379
```

The Redis server must be running before starting the backend.

### Data Storage Pattern

Since Redis is a key-value store, structured data is stored using this pattern:

```
item:{id}      →  JSON string (the item data)
item:counter   →  Integer (auto-incrementing ID counter)
items:index    →  Set (collection of all item IDs)
```

**Example:**
```
item:1         →  '{"id":1,"name":"Laptop","description":"Gaming laptop","category":"Electronics","price":1299.99,"quantity":5,"created_at":"2024-01-01T10:00:00.000Z","updated_at":"2024-01-01T10:00:00.000Z"}'
item:2         →  '{"id":2,"name":"Mouse","description":"Wireless mouse","category":"Electronics","price":29.99,"quantity":50,"created_at":"2024-01-01T10:05:00.000Z","updated_at":"2024-01-01T10:05:00.000Z"}'
item:counter   →  2
items:index    →  {1, 2}
```

### Data Model

```javascript
{
  id: Integer (auto-increment via INCR),
  name: String (required),
  description: String (optional),
  category: String (optional),
  price: Number (default: 0),
  quantity: Integer (default: 0),
  created_at: ISO 8601 Timestamp (auto),
  updated_at: ISO 8601 Timestamp (auto)
}
```

## Redis Data Types

| Redis Type | Description | Example Commands |
|-----------|-------------|-----------------|
| String | Binary-safe string, up to 512MB | SET, GET, INCR, APPEND |
| List | Linked list of strings | LPUSH, RPUSH, LPOP, LRANGE |
| Set | Unordered collection of unique strings | SADD, SMEMBERS, SREM, SCARD |
| Sorted Set | Set with score for ordering | ZADD, ZRANGE, ZRANGEBYSCORE |
| Hash | Map of field-value pairs | HSET, HGET, HGETALL, HMSET |
| Stream | Append-only log data structure | XADD, XREAD, XRANGE |
| Bitmap | Bit-level operations on strings | SETBIT, GETBIT, BITCOUNT |
| HyperLogLog | Probabilistic cardinality estimation | PFADD, PFCOUNT, PFMERGE |
| Geospatial | Longitude/latitude storage | GEOADD, GEODIST, GEORADIUS |

## Advantages of Redis

### 1. **Performance**
- Sub-millisecond latency
- Can handle millions of requests per second
- All operations are in-memory
- Single-threaded event loop (no context switching)

### 2. **Flexibility**
- Rich data structure support
- Not limited to key-value pairs
- Pub/Sub messaging
- Lua scripting for complex operations

### 3. **Simplicity**
- Simple command-based API
- Easy to learn and use
- Minimal configuration needed
- Human-readable protocol

### 4. **Persistence Options**
- **RDB (Redis Database)**: Point-in-time snapshots
- **AOF (Append Only File)**: Logs every write operation
- **RDB + AOF**: Combination for best durability
- **No persistence**: Pure in-memory mode

### 5. **Scalability**
- Master-replica replication
- Redis Cluster for sharding
- Redis Sentinel for high availability
- Horizontal scaling support

## Limitations

### 1. **Memory Bound**
- Dataset must fit in RAM
- More expensive than disk-based storage
- Need to plan memory carefully
- Memory fragmentation possible

### 2. **No Complex Queries**
- No SQL or complex query language
- No JOINs or relationships
- Search/filter must be done in application code
- Limited aggregation capabilities

### 3. **Persistence Trade-offs**
- RDB: Possible data loss between snapshots
- AOF: Larger files, slower restart
- Performance decreases with persistence enabled

### 4. **Use Cases**
Best for:
- Caching
- Session storage
- Real-time analytics
- Leaderboards/counting
- Pub/Sub messaging
- Rate limiting
- Queue management
- Geospatial data

Not ideal for:
- Complex relational data
- Large datasets that exceed RAM
- Complex queries and reporting
- Long-term archival storage

## Redis vs Other Databases

| Feature | Redis | PostgreSQL | MySQL | MongoDB | SQLite |
|---------|-------|------------|-------|---------|--------|
| Storage | In-Memory | Disk | Disk | Disk | File |
| Speed | Ultra-fast | Fast | Fast | Fast | Moderate |
| Data Model | Key-Value | Relational | Relational | Document | Relational |
| Query Language | Commands | SQL | SQL | MQL | SQL |
| Persistence | Optional | Yes | Yes | Yes | Yes |
| Scalability | Cluster | Replication | Replication | Sharding | Single-file |
| Best For | Caching, RT | Web apps | Web apps | Documents | Embedded |

## Redis Persistence Modes

### RDB (Redis Database)

Point-in-time snapshots of the dataset at specified intervals.

```
# redis.conf
save 900 1      # Save after 900 seconds if at least 1 key changed
save 300 10     # Save after 300 seconds if at least 10 keys changed
save 60 10000   # Save after 60 seconds if at least 10000 keys changed
```

**Pros:**
- Compact single-file backup
- Perfect for backups
- Fast restart
- Good for disaster recovery

**Cons:**
- Data loss possible between snapshots
- Fork process can be slow for large datasets

### AOF (Append Only File)

Logs every write operation received by the server.

```
# redis.conf
appendonly yes
appendfsync everysec   # Sync every second (recommended)
# appendfsync always   # Sync on every write (slower, safest)
# appendfsync no       # Let OS handle syncing (fastest, least safe)
```

**Pros:**
- More durable (minimal data loss)
- Append-only (no seek operations)
- Auto-rewrite to compact file
- Human-readable log

**Cons:**
- Larger files than RDB
- Slower than RDB for restarts
- Can be slower for write-heavy workloads

### Recommended: RDB + AOF

```
# redis.conf
save 900 1
appendonly yes
appendfsync everysec
```

## TTL (Time-To-Live)

Redis supports automatic key expiration:

```bash
# Set a key with 60-second expiration
SET session:user123 "data" EX 60

# Set expiration on existing key
EXPIRE item:temp 3600   # Expires in 1 hour

# Check remaining TTL
TTL item:temp           # Returns seconds remaining

# Remove expiration
PERSIST item:temp       # Key no longer expires

# Set with millisecond precision
SET key "value" PX 5000  # Expires in 5000 milliseconds
```

## Pub/Sub (Publish/Subscribe)

Redis includes built-in messaging:

```bash
# Subscriber (Terminal 1)
SUBSCRIBE notifications

# Publisher (Terminal 2)
PUBLISH notifications "New item created!"

# Pattern subscribe
PSUBSCRIBE item:*
```

### Node.js Example

```javascript
const { createClient } = require('redis');

// Publisher
const publisher = createClient();
await publisher.connect();
await publisher.publish('notifications', 'Hello!');

// Subscriber
const subscriber = createClient();
await subscriber.connect();
await subscriber.subscribe('notifications', (message) => {
  console.log('Received:', message);
});
```

## Redis Configuration

### Key Configuration Options

```
# redis.conf

# Network
bind 127.0.0.1          # Listen address
port 6379               # Default port
timeout 0               # Client timeout (0 = no timeout)

# Memory
maxmemory 256mb         # Maximum memory limit
maxmemory-policy allkeys-lru  # Eviction policy

# Persistence
save 900 1
appendonly yes

# Security
requirepass yourpassword  # Password authentication

# Logging
loglevel notice
logfile /var/log/redis/redis.log
```

### Memory Eviction Policies

| Policy | Description |
|--------|-------------|
| noeviction | Return error when memory limit reached |
| allkeys-lru | Remove least recently used keys |
| allkeys-lfu | Remove least frequently used keys |
| allkeys-random | Remove random keys |
| volatile-lru | Remove LRU keys with TTL set |
| volatile-lfu | Remove LFU keys with TTL set |
| volatile-random | Remove random keys with TTL set |
| volatile-ttl | Remove keys with shortest TTL |

## Backup and Maintenance

### Backup Database

```bash
# Trigger RDB snapshot manually
redis-cli BGSAVE

# Copy RDB file
cp /var/lib/redis/dump.rdb /backup/redis-backup.rdb

# Using redis-cli to save synchronously
redis-cli SAVE   # Blocks server, use BGSAVE in production
```

### Monitor Redis

```bash
# Real-time command monitoring
redis-cli MONITOR

# Server statistics
redis-cli INFO

# Memory usage
redis-cli INFO memory

# Connected clients
redis-cli INFO clients

# Key count
redis-cli DBSIZE
```

### Flush Data

```bash
# Delete all keys in current database
redis-cli FLUSHDB

# Delete all keys in all databases
redis-cli FLUSHALL
```

## Redis Tools

### 1. **redis-cli**
Command-line interface for Redis.

```bash
# Connect to Redis
redis-cli

# Connect to remote Redis
redis-cli -h hostname -p 6379 -a password

# Common commands
PING              # Check connection
INFO              # Server information
DBSIZE            # Number of keys
KEYS *            # List all keys (use in dev only)
SCAN 0            # Iterate keys safely
```

### 2. **RedisInsight**
Official GUI tool for Redis.
- Visual data browser
- Command-line interface
- Performance monitoring
- Memory analysis

Download: https://redis.io/insight/

### 3. **Redis Commander**
Web-based Redis management tool.

```bash
npm install -g redis-commander
redis-commander
```

## Performance Tips

### 1. **Use Pipelining for Bulk Operations**
```javascript
const pipeline = client.multi();
for (const item of items) {
  pipeline.set(`item:${item.id}`, JSON.stringify(item));
  pipeline.sAdd('items:index', String(item.id));
}
await pipeline.exec();
```

### 2. **Use MGET Instead of Multiple GETs**
```javascript
// Good - single round trip
const values = await client.mGet(['item:1', 'item:2', 'item:3']);

// Avoid - multiple round trips
const v1 = await client.get('item:1');
const v2 = await client.get('item:2');
const v3 = await client.get('item:3');
```

### 3. **Use Appropriate Data Structures**
```javascript
// For simple values: Strings
await client.set('counter', '0');

// For objects: Hashes (alternative to JSON strings)
await client.hSet('user:1', { name: 'John', age: '30' });

// For ordered data: Sorted Sets
await client.zAdd('leaderboard', { score: 100, value: 'player1' });

// For unique collections: Sets
await client.sAdd('tags', 'redis', 'database', 'nosql');

// For queues: Lists
await client.lPush('queue', 'task1');
```

### 4. **Set Memory Limits**
```
maxmemory 256mb
maxmemory-policy allkeys-lru
```

## Security Considerations

### 1. **Authentication**
```
# redis.conf
requirepass your_secure_password
```

```javascript
const client = createClient({
  url: 'redis://:your_secure_password@localhost:6379'
});
```

### 2. **Network Security**
```
# Bind to specific interface
bind 127.0.0.1

# Disable dangerous commands
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command CONFIG ""
```

### 3. **Input Validation**
Validate all user input before storing in Redis (done in routes.js using validator library).

### 4. **TLS Encryption**
```javascript
const client = createClient({
  url: 'rediss://localhost:6379',  // Note: rediss:// for TLS
  socket: {
    tls: true,
    ca: fs.readFileSync('ca.crt')
  }
});
```

## Resources

- **Official Redis Website**: https://redis.io/
- **Redis Documentation**: https://redis.io/docs/
- **node-redis Documentation**: https://github.com/redis/node-redis
- **Redis University**: https://university.redis.com/
- **Try Redis Online**: https://try.redis.io/
- **RedisInsight**: https://redis.io/insight/

## Conclusion

Redis is an excellent choice for learning key-value database concepts because:
- Simple command-based interface
- Rich data structure support
- Ultra-fast performance
- Built-in features (TTL, Pub/Sub, transactions)
- Widely used in production systems

For applications requiring complex queries, relationships, or SQL, consider PostgreSQL or MySQL. For document storage, consider MongoDB. Redis excels as a cache, session store, and for real-time data processing.
