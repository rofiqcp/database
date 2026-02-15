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
- Package not found
- Version conflicts

**Solutions:**
```bash
# Install specific version
npm install @elastic/elasticsearch@8.11.0

# Check installed version
npm list @elastic/elasticsearch

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Elasticsearch Issues

### Elasticsearch not running

**Symptoms:**
- "ECONNREFUSED" when connecting
- Backend fails to start
- "connect ECONNREFUSED 127.0.0.1:9200"

**Solutions:**
```bash
# Check if Elasticsearch is running
curl http://localhost:9200

# Docker: check container
docker ps | grep elasticsearch

# Docker: start container
docker start elasticsearch

# Docker: run new container
docker run -d --name elasticsearch \
  -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0

# Check Elasticsearch logs
docker logs elasticsearch
```

### Elasticsearch cluster health yellow/red

**Symptoms:**
- Cluster health not green
- Unassigned shards
- Performance degradation

**Solutions:**
```bash
# Check cluster health
curl http://localhost:9200/_cluster/health?pretty

# For single-node, set replicas to 0
curl -X PUT http://localhost:9200/items/_settings \
  -H "Content-Type: application/json" \
  -d '{"index": {"number_of_replicas": 0}}'

# Check unassigned shards
curl http://localhost:9200/_cat/shards?v&h=index,shard,state
```

### Index creation fails

**Symptoms:**
- "resource_already_exists_exception"
- Mapping conflicts
- Index not created

**Solutions:**
```bash
# Delete existing index and recreate
curl -X DELETE http://localhost:9200/items
# Restart backend to auto-create

# Check existing indices
curl http://localhost:9200/_cat/indices?v

# Manually create index with mappings
curl -X PUT http://localhost:9200/items \
  -H "Content-Type: application/json" \
  -d '{
    "mappings": {
      "properties": {
        "name": {"type": "text", "fields": {"keyword": {"type": "keyword"}}},
        "description": {"type": "text"},
        "category": {"type": "keyword"},
        "price": {"type": "float"},
        "quantity": {"type": "integer"},
        "created_at": {"type": "date"},
        "updated_at": {"type": "date"}
      }
    }
  }'
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
- Connection errors
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

# Verify Elasticsearch is accessible
curl http://localhost:9200

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
```

### API returns 500 errors

**Symptoms:**
- Internal server errors
- Elasticsearch connection errors
- Query parsing errors

**Solutions:**
```bash
# Check backend console for errors

# Verify Elasticsearch is accessible
curl http://localhost:9200

# Check index exists
curl http://localhost:9200/_cat/indices?v

# Check index mappings
curl http://localhost:9200/items/_mapping?pretty

# Verify all required fields in requests
# Name is required for create/update
```

### Search returns no results

**Symptoms:**
- Search always returns empty
- Filters don't work
- Items exist but not found

**Solutions:**
```bash
# Verify documents exist
curl http://localhost:9200/items/_search?pretty

# Check index refresh
curl -X POST http://localhost:9200/items/_refresh

# Test search directly
curl -X POST http://localhost:9200/items/_search \
  -H "Content-Type: application/json" \
  -d '{"query": {"match_all": {}}}'

# Check analyzer behavior
curl -X POST http://localhost:9200/items/_analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Gaming Laptop", "analyzer": "standard"}'
```

## Frontend Issues

### White screen / blank page

**Symptoms:**
- Frontend shows nothing
- Empty page
- No errors in console

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
// Check store.darkMode state in Vue DevTools

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
```bash
# Check browser console for errors

# Verify all required fields filled (Name is required)

# Check API endpoint URL (Network tab in DevTools)

# Verify CORS settings

# Test API directly with curl
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

# Verify all imports exist
# Check component paths
```

### Backend build errors

**Symptoms:**
- npm run build fails
- Module errors

**Solutions:**
```bash
# Backend doesn't need build step (Node.js runs directly)

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

### Slow search responses

**Symptoms:**
- Long search times
- Timeouts
- Laggy UI

**Solutions:**
```bash
# Check cluster health
curl http://localhost:9200/_cluster/health?pretty

# Check index size
curl http://localhost:9200/_cat/indices?v

# Optimize refresh interval
curl -X PUT http://localhost:9200/items/_settings \
  -H "Content-Type: application/json" \
  -d '{"index": {"refresh_interval": "5s"}}'

# Force merge segments
curl -X POST http://localhost:9200/items/_forcemerge?max_num_segments=1

# Check JVM heap usage
curl http://localhost:9200/_nodes/stats/jvm?pretty
```

## Common Error Messages

### "connect ECONNREFUSED 127.0.0.1:9200"
```bash
# Elasticsearch not running - start it
docker start elasticsearch
# Or install and run Elasticsearch
```

### "index_not_found_exception"
```bash
# Index doesn't exist - restart backend to auto-create
cd backend && npm run dev
```

### "Cannot find module"
```bash
npm install
```

### "Failed to fetch"
```bash
# Backend not running
# Check http://localhost:3000/health

# CORS issue
# Check backend CORS_ORIGIN
```

## Getting Help

If issues persist:

1. **Check Console Logs**
   - Backend: Terminal running backend
   - Frontend: Browser DevTools Console
   - Elasticsearch: `docker logs elasticsearch`

2. **Verify Prerequisites**
   - Node.js 18+
   - Elasticsearch 8.x running
   - All dependencies installed
   - .env files created

3. **Review Documentation**
   - SETUP.md
   - API_DOCS.md
   - DATABASE_INFO.md

4. **Test Individually**
   - Test Elasticsearch: `curl http://localhost:9200`
   - Test backend: `curl http://localhost:3000/health`
   - Test frontend independently

5. **Start Fresh**
   ```bash
   # Clean everything
   rm -rf backend/node_modules
   rm -rf frontend/node_modules frontend/dist
   curl -X DELETE http://localhost:9200/items
   
   # Reinstall
   cd backend && npm install
   cd ../frontend && npm install
   
   # Start again
   cd backend && npm run dev
   # New terminal
   cd frontend && npm run dev
   ```

## Still Having Issues?

- Double-check SETUP.md steps
- Verify Elasticsearch is running and accessible
- Check file permissions
- Try on different port
- Check Elasticsearch version compatibility
- Review Elasticsearch logs for errors

Remember: Most issues are Elasticsearch connection or configuration related!
