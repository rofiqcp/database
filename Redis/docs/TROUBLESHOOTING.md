# Troubleshooting Guide

Common issues and solutions for the Redis Learning Module.

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

### Redis installation fails

**Symptoms:**
- Redis not found
- Cannot connect to Redis
- Redis won't start

**Solutions:**
```bash
# macOS - Install with Homebrew
brew install redis
brew services start redis

# Ubuntu/Debian - Install from apt
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server

# Using Docker (any platform)
docker run -d -p 6379:6379 --name redis redis:latest

# Verify installation
redis-cli ping   # Should return PONG
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
- Redis connection errors
- Module not found

**Solutions:**
```bash
# Check Node.js version
node --version  # Should be 18+

# Verify Redis is running
redis-cli ping  # Should return PONG

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

## Database Issues

### Redis connection refused

**Symptoms:**
- "ECONNREFUSED" error
- "Redis Client Error: connect ECONNREFUSED"
- Backend crashes with connection error

**Solutions:**
```bash
# Check if Redis is running
redis-cli ping

# Start Redis (Linux)
sudo systemctl start redis-server
sudo systemctl status redis-server

# Start Redis (macOS)
brew services start redis

# Start Redis (Docker)
docker start redis
# Or create new container
docker run -d -p 6379:6379 --name redis redis

# Check Redis port
redis-cli -h 127.0.0.1 -p 6379 ping

# Verify REDIS_URL in .env
cat backend/.env | grep REDIS_URL
# Should be: REDIS_URL=redis://localhost:6379
```

### Redis authentication error

**Symptoms:**
- "NOAUTH Authentication required"
- "ERR invalid password"

**Solutions:**
```bash
# If Redis requires password, update .env
REDIS_URL=redis://:yourpassword@localhost:6379

# Or disable auth in redis.conf (dev only)
# Comment out: requirepass

# Restart Redis after config change
sudo systemctl restart redis-server
```

### Data not persisting

**Symptoms:**
- Data disappears after Redis restart
- Items created but not saved
- Empty database after reload

**Solutions:**
```bash
# Check Redis persistence config
redis-cli CONFIG GET save
redis-cli CONFIG GET appendonly

# Enable RDB persistence
redis-cli CONFIG SET save "900 1 300 10 60 10000"

# Enable AOF persistence
redis-cli CONFIG SET appendonly yes

# Check data exists
redis-cli SMEMBERS items:index
redis-cli GET item:counter

# Verify Redis is saving
redis-cli LASTSAVE
```

### Memory issues

**Symptoms:**
- Redis "OOM" (Out of Memory) error
- Writes failing
- Slow performance

**Solutions:**
```bash
# Check memory usage
redis-cli INFO memory

# Set memory limit
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Flush unnecessary data (CAUTION: deletes all data)
redis-cli FLUSHDB

# Check key count
redis-cli DBSIZE
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
- Redis errors

**Solutions:**
```bash
# Check backend console for errors
# Look for stack traces

# Verify Redis is accessible
redis-cli ping

# Check all keys
redis-cli KEYS "item:*"

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
# Check Redis latency
redis-cli --latency

# Check Redis slow log
redis-cli SLOWLOG GET 10

# Monitor commands in real-time
redis-cli MONITOR

# Check memory usage
redis-cli INFO memory

# Check key count
redis-cli DBSIZE
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
# Redis not running
redis-cli ping
# If not running, start Redis

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

### "Redis Client Error"
```bash
# Check Redis connection
redis-cli ping

# Verify REDIS_URL
cat backend/.env

# Check Redis logs
# Linux: /var/log/redis/redis-server.log
# macOS: /usr/local/var/log/redis.log

# Restart Redis
sudo systemctl restart redis-server
```

## Getting Help

If issues persist:

1. **Check Console Logs**
   - Backend: Terminal running backend
   - Frontend: Browser DevTools Console
   - Redis: Redis log files

2. **Verify Prerequisites**
   - Node.js 18+
   - Redis server running
   - All dependencies installed
   - .env files created

3. **Review Documentation**
   - SETUP.md
   - API_DOCS.md
   - DATABASE_INFO.md

4. **Test Individually**
   - Test Redis with redis-cli
   - Test backend with curl
   - Test frontend independently

5. **Start Fresh**
   ```bash
   # Stop everything
   # Stop Redis, backend, frontend

   # Clean everything
   rm -rf backend/node_modules
   rm -rf frontend/node_modules frontend/dist

   # Flush Redis data (optional)
   redis-cli FLUSHDB

   # Reinstall
   cd backend && npm install
   cd ../frontend && npm install

   # Start again
   redis-server &
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
7. **Verify Redis is running** - Always check before starting backend

## Still Having Issues?

- Double-check SETUP.md steps
- Verify all prerequisites (including Redis)
- Check file permissions
- Try on different port
- Restart computer (fixes strange issues)
- Check antivirus/firewall settings

Remember: Most issues are configuration-related, missing dependencies, or Redis not running!
