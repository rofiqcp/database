# Troubleshooting Guide

Common issues and solutions for the Cassandra Learning Module.

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

### cassandra-driver installation fails

**Symptoms:**
- Native module compilation errors
- Build tools not found

**Solutions:**
```bash
# Install build tools (macOS)
xcode-select --install

# Install build tools (Ubuntu/Debian)
sudo apt-get install build-essential python3

# Install build tools (Windows)
npm install --global windows-build-tools

# Reinstall
npm install
```

## Cassandra Server Issues

### Cassandra not starting

**Symptoms:**
- Connection refused errors
- Service fails to start
- Java errors

**Solutions:**
```bash
# Check if Java is installed (Cassandra requires Java 11+)
java -version

# Check Cassandra status
nodetool status

# Check Cassandra logs
tail -f /var/log/cassandra/system.log

# If using Docker
docker ps
docker logs cassandra

# Restart Cassandra
sudo systemctl restart cassandra
# Or with Docker
docker restart cassandra
```

### Connection refused (port 9042)

**Symptoms:**
- "Connection refused" error
- Backend can't connect to Cassandra
- Timeout errors

**Solutions:**
```bash
# Verify Cassandra is listening on 9042
ss -tlnp | grep 9042
# Or
netstat -tlnp | grep 9042

# Check Cassandra is fully started (can take 30-60 seconds)
nodetool status

# Verify contact points in .env
cat backend/.env | grep CASSANDRA

# If using Docker, ensure port is mapped
docker run --name cassandra -d -p 9042:9042 cassandra:4.1
```

### Out of memory errors

**Symptoms:**
- Cassandra crashes with OOM
- Java heap space errors
- System becomes unresponsive

**Solutions:**
```bash
# Reduce Cassandra heap size for development
# Edit cassandra-env.sh
MAX_HEAP_SIZE="512M"
HEAP_NEWSIZE="128M"

# Or use Docker with memory limits
docker run --name cassandra -d -p 9042:9042 \
  -e MAX_HEAP_SIZE=512M \
  -e HEAP_NEWSIZE=128M \
  cassandra:4.1
```

## Server Issues

### Port already in use

**Symptoms:**
- "EADDRINUSE" error
- Server won't start
- Port 3000 or 5173 occupied

**Solutions:**
```bash
# Find process using port 3000 (Backend)
lsof -i :3000
# Or on Windows
netstat -ano | findstr :3000

# Kill the process
kill -9 <PID>
# Or on Windows
taskkill /PID <PID> /F

# Or change port in .env
# Backend: PORT=3001
# Frontend: Use --port flag
npm run dev -- --port 5174
```

### Backend won't start

**Symptoms:**
- Server crashes on startup
- Database errors
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

# Verify Cassandra is running
cqlsh localhost 9042
```

### Frontend won't start

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

### Keyspace not created

**Symptoms:**
- "Keyspace learning_db does not exist" error
- Database initialization fails
- Schema errors

**Solutions:**
```bash
# Connect to Cassandra and create manually
cqlsh localhost 9042

# In cqlsh:
CREATE KEYSPACE IF NOT EXISTS learning_db
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE learning_db;

CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  category TEXT,
  price DECIMAL,
  quantity INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
```

### Data not persisting

**Symptoms:**
- Data disappears after restart
- Items created but not saved
- Empty database after reload

**Solutions:**
```bash
# Check Cassandra data directory
ls -la /var/lib/cassandra/data/

# Verify keyspace exists
cqlsh -e "DESCRIBE KEYSPACES;"

# Check table data
cqlsh -e "SELECT * FROM learning_db.items;"

# If using Docker, ensure data volume is mounted
docker run --name cassandra -d -p 9042:9042 \
  -v cassandra_data:/var/lib/cassandra \
  cassandra:4.1
```

### Invalid UUID errors

**Symptoms:**
- "Invalid ID format" error
- UUID parsing fails
- 400 Bad Request on GET/PUT/DELETE

**Solutions:**
```bash
# Ensure UUID format is correct
# Valid: 550e8400-e29b-41d4-a716-446655440000
# Invalid: 123, abc, not-a-uuid

# Check UUID in API call
curl http://localhost:3000/api/data/550e8400-e29b-41d4-a716-446655440000

# List all items to see valid UUIDs
curl http://localhost:3000/api/data
```

## API Issues

### CORS errors

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

// Check CORS middleware in backend/src/server.js
```

### API returns 404

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

### API returns 500 errors

**Symptoms:**
- Internal server errors
- Unexpected crashes
- Database errors

**Solutions:**
```bash
# Check backend console for errors
# Look for stack traces

# Verify Cassandra is accessible
cqlsh localhost 9042 -e "SELECT * FROM learning_db.items LIMIT 1;"

# Check for syntax errors in routes
node --check backend/src/routes.js

# Verify all required fields in requests
# Name is required for create/update
```

## Frontend Issues

### White screen / blank page

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

### Components not updating

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

### Dark mode not working

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

### Forms not submitting

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

### Frontend build fails

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

### Backend build errors

**Symptoms:**
- npm run build fails
- Module errors

**Solutions:**
```bash
# Backend doesn't need build step
# It's Node.js, runs directly

# Verify all files present
ls -la backend/src/

# Check for syntax errors
node --check backend/src/server.js
node --check backend/src/routes.js
node --check backend/src/database.js

# Install dependencies
cd backend
npm install
```

## Performance Issues

### Slow API responses

**Symptoms:**
- Long load times
- Timeouts
- Laggy UI

**Solutions:**
```bash
# Check Cassandra performance
nodetool tablestats learning_db.items

# Verify indexes exist
cqlsh -e "DESCRIBE INDEX learning_db.idx_items_category;"

# Check for ALLOW FILTERING queries
# These are slow and should be avoided in production

# Run repair if needed
nodetool repair learning_db
```

### Frontend slow/laggy

**Symptoms:**
- UI feels slow
- Long render times
- Janky animations

**Solutions:**
```bash
# Build in production mode
npm run build
npm run preview

# Check bundle size
npm run build -- --analyze

# Reduce data load
# Implement pagination

# Check browser console
# Look for performance warnings
```

## Development Issues

### Hot reload not working

**Symptoms:**
- Changes don't reflect
- Need to restart manually
- Vite HMR fails

**Solutions:**
```bash
# Backend (Nodemon)
# Check nodemon is installed
npm list nodemon

# Reinstall if needed
npm install --save-dev nodemon

# Frontend (Vite HMR)
# Restart dev server
npm run dev

# Clear cache
rm -rf node_modules/.vite
```

### Environment variables not loaded

**Symptoms:**
- Config values not working
- .env values ignored
- Default values used

**Solutions:**
```bash
# Verify .env file exists
ls -la .env

# Check file contents
cat .env

# No quotes needed for values
# PORT=3000 (not PORT="3000")

# Restart server after .env changes
# Changes require restart

# Frontend: VITE_ prefix required
# VITE_API_URL=http://localhost:3000/api
```

## Common Error Messages

### "Cannot find module"
```bash
# Module not installed
npm install

# Wrong import path
# Check import statements

# Case sensitivity
# Check file name casing
```

### "ECONNREFUSED"
```bash
# Backend not running
cd backend && npm run dev

# Cassandra not running
nodetool status

# Wrong port
# Check frontend VITE_API_URL

# Firewall blocking
# Check firewall settings
```

### "Failed to fetch"
```bash
# Backend not running
# Check http://localhost:3000/health

# CORS issue
# Check backend CORS_ORIGIN

# Network error
# Check browser console
```

### "All host(s) tried for query failed"
```bash
# Cassandra is not running
nodetool status

# Wrong contact points
# Check CASSANDRA_CONTACT_POINTS in .env

# Wrong datacenter name
# Check CASSANDRA_DATACENTER in .env
# Default datacenter in Cassandra is 'datacenter1'
```

## Getting Help

If issues persist:

1. **Check Console Logs**
   - Backend: Terminal running backend
   - Frontend: Browser DevTools Console

2. **Verify Prerequisites**
   - Node.js 18+
   - Apache Cassandra running
   - All dependencies installed
   - .env files created

3. **Review Documentation**
   - SETUP.md
   - API_DOCS.md
   - DATABASE_INFO.md

4. **Test Individually**
   - Test Cassandra with cqlsh
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
7. **Ensure Cassandra is running** - Check before starting backend

## Still Having Issues?

- Double-check SETUP.md steps
- Verify all prerequisites including Cassandra
- Check file permissions
- Try on different port
- Restart computer (fixes strange issues)
- Check antivirus/firewall settings

Remember: Most issues are configuration-related, missing dependencies, or Cassandra not running!
