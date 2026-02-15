# Troubleshooting Guide

Common issues and solutions for the Cassandra Learning Module.

## Cassandra Connection Issues

### Cassandra Server Not Running

**Symptoms:**
- "NoHostAvailableError" in console
- "All host(s) tried for query failed"
- Cannot connect to database

**Solutions:**
```bash
# Check if Cassandra is running
nodetool status

# Start Cassandra (macOS with Homebrew)
brew services start cassandra

# Start Cassandra (Ubuntu/Debian)
sudo systemctl start cassandra

# Start Cassandra (Docker)
docker start cassandra

# Verify connection
cqlsh localhost 9042
```

### Invalid Contact Points

**Symptoms:**
- Connection timeout errors
- "Could not connect to any host"

**Solutions:**
```bash
# Check contact points in .env
cat backend/.env | grep CASSANDRA_CONTACT_POINTS

# Local Cassandra (correct)
CASSANDRA_CONTACT_POINTS=localhost

# Multiple nodes (correct)
CASSANDRA_CONTACT_POINTS=node1,node2,node3

# Verify Cassandra is listening
netstat -tlnp | grep 9042
ss -tlnp | grep 9042
```

### Wrong Data Center Name

**Symptoms:**
- "AllNodesFailedError"
- "localDataCenter was configured as 'datacenter1', but only found hosts in data centers: [dc1]"

**Solutions:**
```bash
# Check data center name
nodetool status
# Look for "Datacenter:" line

# Or in cqlsh
SELECT data_center FROM system.local;

# Update .env with correct datacenter name
CASSANDRA_LOCAL_DATACENTER=datacenter1
# or
CASSANDRA_LOCAL_DATACENTER=dc1
```

### Authentication Failed

**Symptoms:**
- "AuthenticationError"
- "Provided username and/or password are incorrect"

**Solutions:**
```bash
# Default Cassandra credentials
# Username: cassandra
# Password: cassandra

# Test connection with credentials
cqlsh -u cassandra -p cassandra localhost 9042

# Update connection configuration if using auth
```

## Installation Issues

### npm install fails

**Symptoms:**
- Package installation errors
- Dependency conflicts
- Network timeouts

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall with legacy peer deps if needed
npm install --legacy-peer-deps

# Try using different registry
npm install --registry=https://registry.npmjs.org/
```

### cassandra-driver Installation Issues

**Symptoms:**
- Cannot find module 'cassandra-driver'
- Native module compilation errors

**Solutions:**
```bash
# Ensure cassandra-driver is installed
npm install cassandra-driver

# Check installed version
npm list cassandra-driver

# Reinstall specific version
npm install cassandra-driver@4.7.2

# Clear npm cache
npm cache clean --force
npm install
```

## Server Issues

### Port Already in Use

**Symptoms:**
- "EADDRINUSE" error
- Server won't start
- Port 3000 or 5173 occupied

**Solutions:**
```bash
# Find process using port 3000 (Backend)
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
# Backend: PORT=3001
# Frontend: Use --port flag
npm run dev -- --port 5174
```

### Backend Won't Start

**Symptoms:**
- Server crashes on startup
- Database connection errors
- Module not found

**Solutions:**
```bash
# Check Node.js version
node --version  # Should be 18+

# Verify all dependencies installed
cd backend
npm install

# Check .env file exists
ls -la .env

# Create .env if missing
cp .env.example .env

# Check for syntax errors
node --check src/server.js

# Run with verbose logging
NODE_ENV=development npm run dev

# Check database connection
cqlsh localhost 9042
```

### Frontend Won't Start

**Symptoms:**
- Vite fails to start
- Build errors
- Module resolution errors

**Solutions:**
```bash
# Verify dependencies
cd frontend
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Check .env file
ls -la .env
cp .env.example .env

# Try different port
npm run dev -- --port 5174

# Clear all caches
rm -rf node_modules dist .vite
npm install
```

## Database Issues

### Keyspace Creation Fails

**Symptoms:**
- "Cannot create keyspace" error
- "Keyspace does not exist"

**Solutions:**
```bash
# Create keyspace manually in cqlsh
cqlsh

CREATE KEYSPACE IF NOT EXISTS learning_db
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

# Verify keyspace
DESCRIBE KEYSPACES;

# Check permissions
# User needs CREATE permission on keyspace
```

### Table Creation Fails

**Symptoms:**
- "Cannot add table" error
- Schema mismatch

**Solutions:**
```bash
# Create table manually in cqlsh
USE learning_db;

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY,
  name text,
  description text,
  category text,
  price decimal,
  quantity int,
  created_at timestamp,
  updated_at timestamp
);

# Verify table
DESCRIBE TABLE items;
```

### UUID Validation Errors

**Symptoms:**
- "Invalid ID format" error
- 400 errors on valid-looking IDs

**Solutions:**
```bash
# Verify UUID format (8-4-4-4-12 hex characters)
# Valid: 550e8400-e29b-41d4-a716-446655440000
# Invalid: 1, abc, 507f1f77bcf86cd799439011

# Check backend is providing UUIDs
curl http://localhost:3000/api/data

# Use returned id directly in requests
curl http://localhost:3000/api/data/550e8400-e29b-41d4-a716-446655440000
```

### Data Not Persisting

**Symptoms:**
- Data disappears after restart
- Items created but not saved

**Solutions:**
```bash
# Check Cassandra is actually running
cqlsh localhost 9042

# Verify keyspace exists
DESCRIBE KEYSPACES;

# Check table has data
USE learning_db;
SELECT COUNT(*) FROM items;
SELECT * FROM items;

# Check connection configuration in .env
cat backend/.env | grep CASSANDRA
```

### Secondary Index Issues

**Symptoms:**
- "Cannot execute this query" on category filter
- Index not being used

**Solutions:**
```bash
# Verify index exists
cqlsh
USE learning_db;
DESCRIBE TABLE items;

# Create index manually if needed
CREATE INDEX IF NOT EXISTS idx_items_category ON items (category);

# Note: ALLOW FILTERING may be needed for complex queries
# But it's not recommended for production
```

## API Issues

### CORS Errors

**Symptoms:**
- "Access-Control-Allow-Origin" errors
- API calls fail from frontend
- Network errors in browser console

**Solutions:**
```javascript
// Backend .env
CORS_ORIGIN=http://localhost:5173

// Frontend .env
VITE_API_URL=http://localhost:3000/api

// Verify both servers running
// Backend: http://localhost:3000
// Frontend: http://localhost:5173
```

### API Returns 404

**Symptoms:**
- All API calls return 404
- Endpoints not found

**Solutions:**
```bash
# Check backend is running
curl http://localhost:3000/health

# Verify base URL in frontend
cat frontend/.env

# Check API route prefix
# Should be: /api/data, /api/search
```

### API Returns 500 Errors

**Symptoms:**
- Internal server errors
- Database errors in response

**Solutions:**
```bash
# Check backend console for errors

# Verify database is accessible
cqlsh localhost 9042

# Check for syntax errors in routes
node --check backend/src/routes.js

# Test API directly with curl
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

### Validation Errors

**Symptoms:**
- "Name is required" errors
- Type mismatch errors

**Solutions:**
```bash
# Ensure required fields are provided
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Item Name",
    "description": "Optional",
    "category": "Optional",
    "price": 99.99,
    "quantity": 10
  }'

# Check field types:
# name: String (required)
# price: Number (not string)
# quantity: Number (not string)
```

## Frontend Issues

### White Screen / Blank Page

**Symptoms:**
- Frontend shows nothing
- Empty page

**Solutions:**
```bash
# Check browser console for errors (F12)

# Verify backend is running
curl http://localhost:3000/api/data

# Check API URL in frontend .env
cat frontend/.env

# Clear browser cache (Ctrl+Shift+R)

# Restart frontend
cd frontend
npm run dev
```

### Components Not Updating

**Symptoms:**
- UI doesn't reflect changes
- Stale data displayed

**Solutions:**
```javascript
// Check if store is being used correctly
// Open browser Vue DevTools

// Verify Pinia store initialization
// Check frontend/src/main.js

// Force refresh data
// Call store.fetchItems() manually
```

### Dark Mode Not Working

**Symptoms:**
- Toggle doesn't change theme
- Colors wrong

**Solutions:**
```javascript
// Check store.darkMode state
// Open Vue DevTools -> Pinia

// Check Tailwind config
// darkMode: 'class' in tailwind.config.js

// Clear browser storage
localStorage.clear()
```

## Build Issues

### Frontend Build Fails

**Symptoms:**
- npm run build errors
- Compilation errors

**Solutions:**
```bash
# Clean and rebuild
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

## Performance Issues

### Slow API Responses

**Symptoms:**
- Long load times
- Timeouts

**Solutions:**
```bash
# Check Cassandra node health
nodetool status

# Check table statistics
nodetool tablestats learning_db.items

# Verify indexes exist
cqlsh -e "DESCRIBE TABLE learning_db.items;"

# Check compaction status
nodetool compactionstats
```

## Common Error Messages

### "NoHostAvailableError"
```bash
# Cassandra not running
brew services start cassandra  # macOS
sudo systemctl start cassandra # Linux
docker start cassandra         # Docker
```

### "All host(s) tried for query failed"
```bash
# Check Cassandra is accessible
cqlsh localhost 9042
# Check contact points in .env
```

### "Invalid ID format"
```bash
# UUID must be in format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# Example valid: 550e8400-e29b-41d4-a716-446655440000
```

### "Keyspace 'learning_db' does not exist"
```bash
# Create keyspace manually
cqlsh -e "CREATE KEYSPACE IF NOT EXISTS learning_db WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};"
```

## Getting Help

If issues persist:

1. **Check Console Logs**
   - Backend: Terminal running backend
   - Frontend: Browser DevTools Console

2. **Verify Prerequisites**
   - Node.js 18+
   - Apache Cassandra 4.0+
   - All dependencies installed
   - .env files created

3. **Review Documentation**
   - SETUP.md
   - API_DOCS.md
   - DATABASE_INFO.md

4. **Test Individually**
   - Test Cassandra connection with cqlsh
   - Test backend with curl
   - Test frontend independently

5. **Start Fresh**
   ```bash
   # Clean everything
   rm -rf backend/node_modules
   rm -rf frontend/node_modules frontend/dist
   
   # Reinstall
   cd backend && npm install
   cd ../frontend && npm install
   
   # Restart Cassandra
   brew services restart cassandra
   
   # Start again
   cd backend && npm run dev
   # New terminal
   cd frontend && npm run dev
   ```

## Prevention Tips

1. **Always use .env files** - Don't hardcode values
2. **Check logs first** - Error messages are helpful
3. **One thing at a time** - Test incrementally
4. **Keep dependencies updated** - Run `npm update` occasionally
5. **Use version control** - Commit working states
6. **Read error messages** - They usually tell you what's wrong
7. **Verify Cassandra is running** - Before starting backend

## Still Having Issues?

- Double-check SETUP.md steps
- Verify all prerequisites (especially Cassandra)
- Check file permissions
- Try on different port
- Restart computer (fixes strange issues)
- Check firewall settings (port 9042)
- Check Cassandra data center name matches config

Remember: Most issues are configuration-related or missing Cassandra connection!
