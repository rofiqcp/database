# Redis Learning Module - Setup Guide

Complete setup instructions for the Redis learning module.

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher
- **Redis**: Version 6.0 or higher
- **Text Editor**: VS Code, Sublime Text, or your preferred editor

### Check Prerequisites
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
redis-server --version  # Should be 6.x or higher
```

### Install Redis

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**Windows:**
Download from [redis.io](https://redis.io/download) or use WSL

### Verify Redis Installation
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Check Redis version
redis-cli --version
```

## Installation Steps

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

#### Backend Environment Variables (.env)
```env
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
CORS_ORIGIN=http://localhost:5173
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

#### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:3000
```

## Running the Application

**Terminal 1 - Redis Server** (if not running as service):
```bash
redis-server
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

## Verify Installation

### 1. Check Redis
```bash
redis-cli ping  # Should return PONG
redis-cli info server  # Server information
```

### 2. Check Backend
Open browser to `http://localhost:3000/health`

Should see:
```json
{
  "status": "OK",
  "database": "Redis",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 3. Check Frontend
Open browser to `http://localhost:5173`

### 4. Test Redis Connection

**Check data structures:**
```bash
redis-cli
127.0.0.1:6379> KEYS items:*
127.0.0.1:6379> GET items:next_id
127.0.0.1:6379> SMEMBERS items:ids
127.0.0.1:6379> HGETALL items:1
```

## Troubleshooting

### Redis Connection Issues

**Error: ECONNREFUSED**
```
Solution: Ensure Redis is running
- macOS: brew services start redis
- Linux: sudo systemctl start redis-server
- Manual: redis-server
```

**Error: Authentication required**
```
Solution: Add password to .env if Redis has authentication enabled
REDIS_PASSWORD=your_password
```

### Redis CLI Commands

**Connect to Redis:**
```bash
redis-cli
redis-cli -h localhost -p 6379
redis-cli -a password  # If password protected
```

**Useful commands:**
```bash
PING                    # Test connection
DBSIZE                  # Number of keys
KEYS *                  # List all keys (use carefully!)
FLUSHDB                 # Clear current database
INFO                    # Server information
MONITOR                 # Watch commands in real-time
```

### Clear All Data

```bash
redis-cli FLUSHDB  # Clear current database
redis-cli FLUSHALL # Clear all databases
```

## Development Tips

### Redis GUI Tools
- **RedisInsight**: Official GUI from Redis
- **Medis**: macOS Redis client
- **Redis Commander**: Web-based management
- **Another Redis Desktop Manager**: Cross-platform

### VS Code Extensions
- Redis by Dunn
- Redis Xplorer

### Redis Configuration

Edit `/etc/redis/redis.conf` (Linux) or `/usr/local/etc/redis.conf` (macOS):

```conf
# Set max memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Enable persistence
save 900 1
save 300 10
save 60 10000

# Enable AOF
appendonly yes
appendfsync everysec
```

## Production Deployment

### Security Checklist
- [ ] Set strong password
- [ ] Bind to specific IP
- [ ] Disable dangerous commands
- [ ] Use SSL/TLS
- [ ] Enable authentication
- [ ] Configure firewall
- [ ] Regular backups

### Redis Configuration for Production

```conf
# Bind to specific interface
bind 127.0.0.1 ::1

# Require password
requirepass your_strong_password

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""

# Max memory and eviction policy
maxmemory 2gb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000
appendonly yes
```

### Backup Strategy

**RDB Snapshots:**
```bash
# Manual snapshot
redis-cli BGSAVE

# Scheduled snapshots (in redis.conf)
save 900 1      # Save after 900 sec if 1 key changed
save 300 10     # Save after 300 sec if 10 keys changed
save 60 10000   # Save after 60 sec if 10000 keys changed
```

**AOF (Append Only File):**
```bash
# Enable AOF
appendonly yes
appendfsync everysec
```

**Backup files:**
```bash
# Backup RDB
cp /var/lib/redis/dump.rdb /backup/dump-$(date +%Y%m%d).rdb

# Backup AOF
cp /var/lib/redis/appendonly.aof /backup/appendonly-$(date +%Y%m%d).aof
```

## Next Steps

1. **Read Database Documentation**: See `docs/DATABASE_INFO.md`
2. **Explore API**: See `docs/API_DOCS.md`
3. **Try Commands**: See `examples/query_examples.txt` for 100+ Redis commands
4. **Learn Patterns**: Caching, sessions, leaderboards, pub/sub

## Additional Resources

- **Redis Documentation**: https://redis.io/docs/
- **Redis Commands**: https://redis.io/commands/
- **redis Node.js Client**: https://github.com/redis/node-redis
- **Redis University**: https://university.redis.com/

Happy learning with Redis! 🚀
