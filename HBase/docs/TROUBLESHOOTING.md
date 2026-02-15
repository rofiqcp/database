# Troubleshooting Guide

Common issues and solutions for the HBase Learning Module.

## HBase Connection Issues

### HBase REST Server Not Running

**Symptoms:**
- "ECONNREFUSED" error
- Cannot connect to HBase
- Backend starts but can't access data

**Solutions:**
```bash
# Check if HBase is running
ps aux | grep hbase

# Start HBase
$HBASE_HOME/bin/start-hbase.sh

# Start REST server
$HBASE_HOME/bin/hbase rest start -p 8080

# Verify REST API
curl http://localhost:8080/status/cluster

# If using Docker
docker ps | grep hbase
docker start hbase
```

### REST API Connection Failed

**Symptoms:**
- "Error connecting to HBase" in console
- Timeout errors
- Connection refused

**Solutions:**
```bash
# Check if REST server is listening on correct port
curl http://localhost:8080/status/cluster

# Check .env file
cat backend/.env | grep HBASE

# Verify host and port
HBASE_HOST=localhost
HBASE_PORT=8080

# Try different host
HBASE_HOST=127.0.0.1

# Check firewall
sudo ufw status
```

### Table Not Found

**Symptoms:**
- "TableNotFoundException" error
- Cannot create or read items
- 500 errors on API calls

**Solutions:**
```bash
# Check if table exists
hbase shell
list

# Create table manually if needed
create 'items', 'data'

# Verify table
describe 'items'
scan 'items'

# Or restart backend (auto-creates table)
cd backend
npm run dev
```

### ZooKeeper Connection Issues

**Symptoms:**
- "KeeperErrorCode = ConnectionLoss"
- HBase won't start
- Region servers offline

**Solutions:**
```bash
# Check ZooKeeper
echo ruok | nc localhost 2181

# Restart ZooKeeper
$HBASE_HOME/bin/hbase-daemon.sh stop zookeeper
$HBASE_HOME/bin/hbase-daemon.sh start zookeeper

# Clean ZooKeeper data (caution!)
rm -rf /tmp/hbase-zookeeper

# Restart HBase completely
$HBASE_HOME/bin/stop-hbase.sh
$HBASE_HOME/bin/start-hbase.sh
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

### Java Not Found

**Symptoms:**
- HBase won't start
- "JAVA_HOME is not set" error

**Solutions:**
```bash
# Check Java installation
java -version

# Set JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home)  # macOS
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64  # Ubuntu

# Add to hbase-env.sh
echo "export JAVA_HOME=$JAVA_HOME" >> $HBASE_HOME/conf/hbase-env.sh
```

### HBase Installation Issues

**Symptoms:**
- Cannot find hbase command
- Permission errors
- Configuration issues

**Solutions:**
```bash
# Set HBASE_HOME
export HBASE_HOME=/path/to/hbase
export PATH=$PATH:$HBASE_HOME/bin

# Check configuration
cat $HBASE_HOME/conf/hbase-site.xml

# Fix permissions
chmod +x $HBASE_HOME/bin/*

# Verify installation
hbase version
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

# Check HBase REST API
curl http://localhost:8080/status/cluster
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

### Row Key Issues

**Symptoms:**
- "Invalid ID format" error
- Cannot find items by ID
- UUID validation fails

**Solutions:**
```bash
# Verify UUID format
# Valid: 550e8400-e29b-41d4-a716-446655440000
# Invalid: 1, abc, random-string

# Check items in HBase shell
hbase shell
scan 'items'

# Use returned id directly in requests
curl http://localhost:3000/api/data
# Copy the id from response and use it
```

### Data Not Persisting

**Symptoms:**
- Data disappears after restart
- Items created but not saved
- Empty table after reload

**Solutions:**
```bash
# Check HBase is actually running
hbase shell
list
scan 'items'

# Check if table exists
describe 'items'

# Verify data directory
ls -la /tmp/hbase-*/

# Check HBase logs
tail -f $HBASE_HOME/logs/hbase-*.log

# Check REST server is running
curl http://localhost:8080/status/cluster
```

### Data Type Issues

**Symptoms:**
- Price showing as string
- Quantity not numeric
- Incorrect values

**Solutions:**
```bash
# HBase stores everything as bytes/strings
# The application handles type conversion
# Check database.js for proper parsing

# Verify data in HBase shell
get 'items', 'your-row-key'

# All values are stored as strings in HBase
# Application converts:
# - price -> parseFloat()
# - quantity -> parseInt()
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
- Routes not working

**Solutions:**
```bash
# Check backend is running
curl http://localhost:3000/health

# Verify base URL in frontend
cat frontend/.env

# Check API route prefix
# Should be: /api/data, /api/search

# Verify routes are loaded
# Check backend/src/server.js
# Look for: app.use('/api', dataRoutes)
```

### API Returns 500 Errors

**Symptoms:**
- Internal server errors
- Unexpected crashes
- Database errors in response

**Solutions:**
```bash
# Check backend console for errors
# Look for stack traces

# Verify HBase REST API is accessible
curl http://localhost:8080/status/cluster

# Check for syntax errors in routes
node --check backend/src/routes.js

# Verify all required fields in requests
# Name is required for create/update

# Test API directly with curl
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

### Validation Errors

**Symptoms:**
- "Name is required" errors
- Validation failures
- Type mismatch errors

**Solutions:**
```bash
# For POST requests, ensure:
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
- No errors in console

**Solutions:**
```bash
# Check browser console for errors
# Open DevTools (F12)

# Verify backend is running
curl http://localhost:3000/api/data

# Check API URL in frontend .env
cat frontend/.env

# Clear browser cache
# Hard refresh: Ctrl+Shift+R or Cmd+Shift+R

# Restart frontend
cd frontend
npm run dev
```

### Components Not Updating

**Symptoms:**
- UI doesn't reflect changes
- Data doesn't refresh
- Stale data displayed

**Solutions:**
```javascript
// Check if store is being used correctly
// Open browser Vue DevTools

// Verify Pinia store initialization
// Check frontend/src/main.js

// Force refresh data
// Call store.fetchItems() manually

// Check reactive references
// Ensure using computed() for store data
```

### Dark Mode Not Working

**Symptoms:**
- Toggle doesn't change theme
- Dark mode stuck
- Colors wrong

**Solutions:**
```javascript
// Check store.darkMode state
// Open Vue DevTools -> Pinia

// Verify class on root element
// Should have 'dark' class when enabled

// Check Tailwind config
// darkMode: 'class' in tailwind.config.js

// Clear browser storage
localStorage.clear()
```

### Forms Not Submitting

**Symptoms:**
- Create/Edit forms don't work
- No network request
- Validation fails

**Solutions:**
```javascript
// Check browser console for errors

// Verify all required fields filled
// Name is required

// Check API endpoint URL
// Open Network tab in DevTools

// Verify CORS settings
// Check backend CORS_ORIGIN

// Test API directly with curl
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
```

## Build Issues

### Frontend Build Fails

**Symptoms:**
- npm run build errors
- Compilation errors
- Missing dependencies

**Solutions:**
```bash
# Clean and rebuild
rm -rf node_modules dist package-lock.json
npm install
npm run build

# Check for syntax errors
# Look at error messages

# Verify all imports exist
# Check component paths

# Try building without optimization
npm run build -- --debug
```

## Performance Issues

### Slow API Responses

**Symptoms:**
- Long load times
- Timeouts
- Laggy UI

**Solutions:**
```bash
# Check HBase region server status
curl http://localhost:16010/status/cluster

# Monitor HBase performance
hbase shell
status 'detailed'

# Check number of rows
count 'items'

# Consider implementing pagination
# Add row key prefix scanning for filters
```

## Common Error Messages

### "ECONNREFUSED 127.0.0.1:8080"
```bash
# HBase REST server not running
$HBASE_HOME/bin/hbase rest start -p 8080
```

### "TableNotFoundException: items"
```bash
# Table doesn't exist
hbase shell
create 'items', 'data'
```

### "Invalid ID format"
```bash
# ID must be valid UUID format
# Example: 550e8400-e29b-41d4-a716-446655440000
```

### "Name is required"
```bash
# Missing required field in request
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name":"Item Name"}'
```

## Getting Help

If issues persist:

1. **Check Console Logs**
   - Backend: Terminal running backend
   - Frontend: Browser DevTools Console
   - HBase: $HBASE_HOME/logs/

2. **Verify Prerequisites**
   - Java JDK 8 or 11
   - Node.js 18+
   - HBase 2.4+
   - HBase REST server running
   - All dependencies installed
   - .env files created

3. **Review Documentation**
   - SETUP.md
   - API_DOCS.md
   - DATABASE_INFO.md

4. **Test Individually**
   - Test HBase REST API with curl
   - Test backend with curl
   - Test frontend independently
   - Check HBase shell

5. **Start Fresh**
   ```bash
   # Clean everything
   rm -rf backend/node_modules
   rm -rf frontend/node_modules frontend/dist
   
   # Reinstall
   cd backend && npm install
   cd ../frontend && npm install
   
   # Restart HBase
   $HBASE_HOME/bin/stop-hbase.sh
   $HBASE_HOME/bin/start-hbase.sh
   $HBASE_HOME/bin/hbase rest start -p 8080
   
   # Start again
   cd backend && npm run dev
   # New terminal
   cd frontend && npm run dev
   ```

## Prevention Tips

1. **Always start HBase first** - Before starting backend
2. **Start REST server** - Required for Node.js client
3. **Check logs first** - Error messages are helpful
4. **One thing at a time** - Test incrementally
5. **Keep dependencies updated** - Run `npm update` occasionally
6. **Use version control** - Commit working states
7. **Read error messages** - They usually tell you what's wrong

## Still Having Issues?

- Double-check SETUP.md steps
- Verify all prerequisites (especially Java and HBase)
- Check file permissions
- Try on different port
- Restart computer (fixes strange issues)
- Check antivirus/firewall settings
- Verify HBase REST API is accessible

Remember: Most issues are configuration-related or HBase REST server not running!
