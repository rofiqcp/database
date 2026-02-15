# Redis Database Information

## What is Redis?

Redis (Remote Dictionary Server) is an open-source, in-memory data structure store used as a database, cache, message broker, and streaming engine. Redis provides data structures such as strings, hashes, lists, sets, sorted sets with range queries, bitmaps, hyperloglogs, geospatial indexes, and streams.

### Key Features

- **In-Memory Storage**: All data stored in RAM for ultra-fast access
- **Data Structures**: Rich set of data types (strings, hashes, lists, sets, sorted sets)
- **Persistence**: Optional disk persistence (RDB snapshots, AOF logs)
- **Atomic Operations**: All operations are atomic
- **Replication**: Master-slave replication
- **Pub/Sub**: Message broker with publish/subscribe
- **Lua Scripting**: Server-side scripting for complex operations
- **Transactions**: Multi-command transactions with MULTI/EXEC
- **TTL Support**: Automatic key expiration
- **High Performance**: 100,000+ operations per second
- **Simple**: Easy to learn and use

## Redis in This Module

### Database Driver

This module uses **redis v4+** - the official Node.js client for Redis with modern async/await support.

**Why redis v4?**
- Native Promise/async-await support
- TypeScript support
- Connection pooling
- Clustering support
- Active development
- Excellent performance

### Connection Configuration

```javascript
const client = redis.createClient({
  socket: {
    host: 'localhost',
    port: 6379,
  },
  password: undefined,  // Set if authentication enabled
  database: 0,          // Select database (0-15)
});

await client.connect();
```

### Data Model

Unlike SQL databases, Redis uses key-value storage with various data structures.

**Items Storage Pattern:**
```
items:next_id          -> String: "5"           # Auto-increment counter
items:ids              -> Set: {1, 2, 3, 4}     # All item IDs
items:1                -> Hash: {name, price, ...}  # Item data
items:2                -> Hash: {name, price, ...}
```

## Redis Data Types Used

### 1. Strings
Simple key-value pairs. Most basic data type.

```javascript
await client.set('key', 'value');
const value = await client.get('key');

// With expiration
await client.setEx('session:123', 3600, 'active');

// Increment counter
await client.incr('items:next_id');
```

### 2. Hashes
Maps between string fields and string values. Perfect for objects.

```javascript
// Store item as hash (used in this module)
await client.hSet('items:1', {
  name: 'Laptop',
  price: 999.99,
  category: 'Electronics',
  quantity: 10
});

// Get all fields
const item = await client.hGetAll('items:1');

// Get specific field
const name = await client.hGet('items:1', 'name');

// Increment numeric field
await client.hIncrBy('items:1', 'quantity', 5);
```

### 3. Sets
Unordered collection of unique strings.

```javascript
// Add item IDs to set (used in this module)
await client.sAdd('items:ids', ['1', '2', '3']);

// Get all members
const ids = await client.sMembers('items:ids');

// Check membership
const exists = await client.sIsMember('items:ids', '1');

// Remove member
await client.sRem('items:ids', '2');
```

### 4. Lists
Ordered collection of strings. Can be used as queues or stacks.

```javascript
// Push to list
await client.lPush('queue:tasks', 'task1');
await client.rPush('queue:tasks', 'task2');

// Pop from list
const task = await client.lPop('queue:tasks');

// Get range
const tasks = await client.lRange('queue:tasks', 0, -1);
```

### 5. Sorted Sets
Like sets but each member has a score for ordering.

```javascript
// Add members with scores
await client.zAdd('leaderboard', [
  { score: 100, value: 'player1' },
  { score: 95, value: 'player2' }
]);

// Get top 10
const top = await client.zRevRange('leaderboard', 0, 9);

// Get with scores
const topScores = await client.zRevRangeWithScores('leaderboard', 0, 9);

// Increment score
await client.zIncrBy('leaderboard', 5, 'player1');
```

## Key Naming Conventions

Redis doesn't have schemas or tables. Use naming patterns for organization:

```
# Recommended patterns
user:1:name              # User field
user:1:profile           # User object as hash
users:ids                # Set of all user IDs
session:abc123           # Session data
cache:user:1             # Cached user data
category:Electronics     # Category-related data

# This module's patterns
items:next_id            # Auto-increment counter
items:ids                # Set of all item IDs
items:1                  # Item hash with all fields
```

## Operations in This Module

### Create Item
```javascript
// 1. Get next ID
const id = await client.incr('items:next_id');

// 2. Store item data
await client.hSet(`items:${id}`, {
  name: 'Laptop',
  price: 999.99,
  category: 'Electronics',
  quantity: 10,
  created_at: new Date().toISOString()
});

// 3. Add ID to set
await client.sAdd('items:ids', id.toString());
```

### Read Item
```javascript
// Get single item
const item = await client.hGetAll('items:1');

// Get all items
const ids = await client.sMembers('items:ids');
const items = [];
for (const id of ids) {
  const item = await client.hGetAll(`items:${id}`);
  items.push({ id, ...item });
}
```

### Update Item
```javascript
await client.hSet('items:1', {
  price: 899.99,
  updated_at: new Date().toISOString()
});
```

### Delete Item
```javascript
// 1. Delete hash
await client.del('items:1');

// 2. Remove from set
await client.sRem('items:ids', '1');
```

## Redis Features

### 1. Expiration (TTL)

```javascript
// Set key with expiration
await client.setEx('session:123', 3600, 'data');  // 1 hour

// Set expiration on existing key
await client.expire('items:1', 3600);

// Check TTL
const ttl = await client.ttl('items:1');

// Remove expiration
await client.persist('items:1');
```

### 2. Transactions

```javascript
// Execute multiple commands atomically
const multi = client.multi();
multi.incr('counter');
multi.hSet('items:1', 'quantity', 10);
multi.sAdd('items:ids', '1');
await multi.exec();
```

### 3. Pub/Sub

```javascript
// Subscriber
const subscriber = client.duplicate();
await subscriber.connect();
await subscriber.subscribe('notifications', (message) => {
  console.log('Received:', message);
});

// Publisher
await client.publish('notifications', 'New item added');
```

### 4. Pipelines

```javascript
// Batch multiple commands
const pipeline = client.pipeline();
pipeline.set('key1', 'value1');
pipeline.set('key2', 'value2');
pipeline.get('key1');
const results = await pipeline.exec();
```

### 5. Lua Scripts

```javascript
// Atomic operations with Lua
const script = `
  local count = redis.call('incr', KEYS[1])
  redis.call('hset', KEYS[2], 'count', count)
  return count
`;

const result = await client.eval(script, {
  keys: ['counter', 'stats'],
});
```

## Common Use Cases

### 1. Caching
```javascript
// Cache database query result
const cacheKey = 'user:1:profile';
let user = await client.get(cacheKey);

if (!user) {
  // Fetch from database
  user = await db.query('SELECT * FROM users WHERE id = 1');
  // Cache for 1 hour
  await client.setEx(cacheKey, 3600, JSON.stringify(user));
}
```

### 2. Session Storage
```javascript
// Store session
await client.setEx(
  `session:${sessionId}`,
  86400,  // 24 hours
  JSON.stringify({ userId: 1, role: 'admin' })
);

// Get session
const session = await client.get(`session:${sessionId}`);
```

### 3. Rate Limiting
```javascript
// Simple rate limiter
const key = `ratelimit:${userId}:${date}`;
const requests = await client.incr(key);
await client.expire(key, 86400);  // 24 hours

if (requests > 1000) {
  throw new Error('Rate limit exceeded');
}
```

### 4. Leaderboard
```javascript
// Add player score
await client.zAdd('leaderboard', { score: 100, value: 'player1' });

// Get top 10
const top10 = await client.zRevRangeWithScores('leaderboard', 0, 9);

// Get player rank
const rank = await client.zRevRank('leaderboard', 'player1');
```

### 5. Real-time Analytics
```javascript
// Count page views
await client.incr('page:views');
await client.incr(`page:views:${date}`);

// Track unique visitors (using sets)
await client.sAdd(`visitors:${date}`, userId);
const uniqueVisitors = await client.sCard(`visitors:${date}`);
```

## Persistence Options

### RDB (Redis Database Backup)
Point-in-time snapshots at specified intervals.

```conf
# redis.conf
save 900 1      # Save after 900 sec if 1 key changed
save 300 10     # Save after 300 sec if 10 keys changed
save 60 10000   # Save after 60 sec if 10000 keys changed
```

### AOF (Append Only File)
Logs every write operation for durability.

```conf
# redis.conf
appendonly yes
appendfsync everysec  # Options: always, everysec, no
```

## Memory Management

### Eviction Policies
When max memory is reached:

- **noeviction**: Return errors (default)
- **allkeys-lru**: Remove least recently used keys
- **allkeys-lfu**: Remove least frequently used keys
- **volatile-lru**: Remove LRU keys with expire set
- **volatile-ttl**: Remove keys with shortest TTL

```conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### Memory Optimization
```javascript
// Check memory usage
const info = await client.info('memory');

// Get memory usage of specific key
const usage = await client.memoryUsage('items:1');

// Use appropriate data types (hashes are memory efficient)
```

## Performance Best Practices

### 1. Use Pipelining
```javascript
// Bad: Multiple round trips
await client.set('key1', 'value1');
await client.set('key2', 'value2');
await client.set('key3', 'value3');

// Good: Single round trip
const pipeline = client.pipeline();
pipeline.set('key1', 'value1');
pipeline.set('key2', 'value2');
pipeline.set('key3', 'value3');
await pipeline.exec();
```

### 2. Use SCAN Instead of KEYS
```javascript
// Bad: Blocks server
const keys = await client.keys('items:*');

// Good: Non-blocking iteration
let cursor = 0;
const keys = [];
do {
  const result = await client.scan(cursor, { MATCH: 'items:*', COUNT: 100 });
  cursor = result.cursor;
  keys.push(...result.keys);
} while (cursor !== 0);
```

### 3. Set Appropriate TTL
```javascript
// Auto-expire temporary data
await client.setEx('temp:data', 300, value);  // 5 minutes
```

### 4. Use Hashes for Objects
```javascript
// Bad: Multiple keys
await client.set('user:1:name', 'John');
await client.set('user:1:email', 'john@example.com');
await client.set('user:1:age', '30');

// Good: Single hash
await client.hSet('user:1', { name: 'John', email: 'john@example.com', age: 30 });
```

## Security Best Practices

1. **Enable Authentication**: Set requirepass in redis.conf
2. **Disable Dangerous Commands**: Rename CONFIG, FLUSHALL, etc.
3. **Bind to Localhost**: Don't expose to public network
4. **Use SSL/TLS**: Encrypt connections
5. **Regular Updates**: Keep Redis updated
6. **Limit Connections**: Set maxclients
7. **Monitor Access**: Use Redis logs

## Comparison: Redis vs SQL Databases

| Feature | Redis | SQL Database |
|---------|-------|--------------|
| Storage | In-memory | Disk-based |
| Data Model | Key-value | Relational tables |
| Query Language | Commands | SQL |
| Schema | Schemaless | Fixed schema |
| Joins | No | Yes |
| Transactions | Yes (limited) | Yes (full ACID) |
| Speed | Very fast (microseconds) | Fast (milliseconds) |
| Durability | Optional | Always |
| Use Case | Cache, sessions, real-time | Primary database |
| Data Size | Limited by RAM | Limited by disk |

## When to Use Redis

✅ **Good for:**
- Caching
- Session storage
- Real-time analytics
- Leaderboards
- Pub/Sub messaging
- Rate limiting
- Temporary data
- High-speed operations

❌ **Not ideal for:**
- Primary data storage (use with backup)
- Complex queries with joins
- Large datasets (>available RAM)
- Strong consistency requirements
- Financial transactions (use SQL)

## Monitoring and Debugging

### INFO Command
```javascript
const info = await client.info();
const memory = await client.info('memory');
const stats = await client.info('stats');
```

### MONITOR Command
```bash
redis-cli MONITOR
# Shows all commands in real-time
```

### SLOWLOG
```javascript
// Get slow queries
const slowlog = await client.slowlog('get', 10);
```

## Resources

- **Redis Documentation**: https://redis.io/docs/
- **Redis Commands**: https://redis.io/commands/
- **redis Node.js Client**: https://github.com/redis/node-redis
- **Redis University**: https://university.redis.com/
- **Try Redis**: https://try.redis.io/

## Next Steps

1. Explore `examples/query_examples.txt` for 100+ Redis commands
2. Try different data structures (hashes, sets, sorted sets)
3. Experiment with pub/sub messaging
4. Practice caching patterns
5. Learn about Redis Cluster for scaling

Happy learning with Redis! ⚡
