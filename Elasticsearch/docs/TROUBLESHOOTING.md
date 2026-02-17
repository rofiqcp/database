# Troubleshooting Guide

Common issues and solutions for the Elasticsearch Learning Module.

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

### @elastic/elasticsearch installation fails

**Symptoms:**
- Package installation errors
- Version conflicts

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# If still failing, check Node.js version
node --version  # Should be 18+
```

## Elasticsearch Connection Issues

### Elasticsearch connection refused

**Symptoms:**
- "Connection refused" error
- "ECONNREFUSED" error
- Can't connect to Elasticsearch

**Solutions:**
```bash
# Check if Elasticsearch is running
curl http://localhost:9200

# Docker
docker ps | grep elasticsearch
docker start elasticsearch

# Linux (systemd)
sudo systemctl status elasticsearch
sudo systemctl start elasticsearch

# macOS (Homebrew)
brew services list
brew services start elastic/tap/elasticsearch-full

# Check cluster health
curl http://localhost:9200/_cluster/health?pretty
```

### Authentication errors

**Symptoms:**
- "security_exception" error
- 401 Unauthorized responses

**Solutions:**
```bash
# If X-Pack security is enabled, disable for development:
# In elasticsearch.yml:
# xpack.security.enabled: false

# Or provide credentials in the client:
# In database.js:
const client = new Client({
  node: 'http://localhost:9200',
  auth: {
    username: 'elastic',
    password: 'your_password'
  }
});

# Docker with security disabled:
docker run -d --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  elasticsearch:8.11.0
```

### Index does not exist

**Symptoms:**
- "index_not_found_exception" error
- 404 errors on search

**Solutions:**
```bash
# Check if index exists
curl http://localhost:9200/items

# The index is created automatically on startup
# Restart the backend server
cd backend
npm run dev

# Or create manually
curl -X PUT http://localhost:9200/items \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": {
      "properties": {
        "name": { "type": "text" },
        "description": { "type": "text" },
        "category": { "type": "keyword" },
        "price": { "type": "float" },
        "quantity": { "type": "integer" },
        "created_at": { "type": "date" },
        "updated_at": { "type": "date" }
      }
    }
  }'
```

### Cluster health yellow/red

**Symptoms:**
- Cluster health is yellow (missing replicas)
- Cluster health is red (missing primary shards)

**Solutions:**
```bash
# Check cluster health
curl http://localhost:9200/_cluster/health?pretty

# Yellow is normal for single-node (no replicas possible)
# Set replicas to 0 for single-node development
curl -X PUT http://localhost:9200/items/_settings \
  -H "Content-Type: application/json" \
  -d '{ "number_of_replicas": 0 }'

# Red - check unassigned shards
curl http://localhost:9200/_cluster/allocation/explain?pretty
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
- Elasticsearch errors
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

## Elasticsearch Issues

### Out of memory

**Symptoms:**
- Elasticsearch crashes
- "java.lang.OutOfMemoryError" in logs
- Slow responses

**Solutions:**
```bash
# Increase JVM heap size
# In jvm.options or ES_JAVA_OPTS:
# -Xms1g
# -Xmx1g

# Docker:
docker run -d --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \
  elasticsearch:8.11.0
```

### Slow searches

**Symptoms:**
- Search queries take too long
- Timeouts on large datasets

**Solutions:**
```bash
# Check index size
curl http://localhost:9200/items/_stats?pretty

# Optimize index
curl -X POST http://localhost:9200/items/_forcemerge?max_num_segments=1

# Check slow log
# In elasticsearch.yml:
# index.search.slowlog.threshold.query.warn: 10s
# index.search.slowlog.threshold.query.info: 5s
```

### Data not persisting

**Symptoms:**
- Data disappears after restart
- Items created but not saved

**Solutions:**
```bash
# Check Elasticsearch data directory
# Default: /usr/share/elasticsearch/data (Docker)

# Docker: ensure volume is mounted
docker run -d --name elasticsearch \
  -p 9200:9200 \
  -v es_data:/usr/share/elasticsearch/data \
  -e "discovery.type=single-node" \
  elasticsearch:8.11.0

# Check refresh settings
# Documents may not be immediately visible
# The API uses refresh: 'true' to ensure immediate visibility
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
- Elasticsearch errors

**Solutions:**
```bash
# Check backend console for errors
# Look for stack traces

# Verify Elasticsearch is accessible
curl http://localhost:9200/items/_search?pretty

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
# Check Elasticsearch cluster health
curl http://localhost:9200/_cluster/health?pretty

# Check index stats
curl http://localhost:9200/items/_stats?pretty

# Force merge for better read performance
curl -X POST http://localhost:9200/items/_forcemerge?max_num_segments=1

# Check document count
curl http://localhost:9200/items/_count?pretty
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
# Elasticsearch not running
curl http://localhost:9200

# Backend not running
cd backend && npm run dev

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

### "index_not_found_exception"
```bash
# Index not created
# Restart backend to auto-create

# Or create manually
curl -X PUT http://localhost:9200/items
```

## Getting Help

If issues persist:

1. **Check Console Logs**
   - Backend: Terminal running backend
   - Frontend: Browser DevTools Console

2. **Verify Prerequisites**
   - Node.js 18+
   - Elasticsearch running
   - All dependencies installed
   - .env files created

3. **Review Documentation**
   - SETUP.md
   - API_DOCS.md
   - DATABASE_INFO.md

4. **Test Individually**
   - Test Elasticsearch directly with curl
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

## Still Having Issues?

- Double-check SETUP.md steps
- Verify all prerequisites
- Check file permissions
- Try on different port
- Restart computer (fixes strange issues)
- Check antivirus/firewall settings

Remember: Most issues are configuration-related or missing dependencies!
