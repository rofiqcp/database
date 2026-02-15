# Troubleshooting Guide

Common issues and solutions for the MongoDB Learning Module.

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

### MongoDB driver installation fails

**Symptoms:**
- Cannot find module 'mongodb'
- Driver compatibility issues

**Solutions:**
```bash
# Ensure Node.js 18+ is installed
node --version

# Reinstall mongodb driver
npm install mongodb@^6.3.0

# Clear and reinstall all
rm -rf node_modules package-lock.json
npm install
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

# Check MongoDB is running
mongosh --eval "db.runCommand({ ping: 1 })"

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

### MongoDB connection failed

**Symptoms:**
- "MongoServerError" or "MongoNetworkError"
- "ECONNREFUSED" on port 27017
- Cannot connect to database

**Solutions:**
```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand({ ping: 1 })"

# Start MongoDB (Linux systemd)
sudo systemctl start mongod
sudo systemctl status mongod

# Start MongoDB (macOS Homebrew)
brew services start mongodb-community

# Start MongoDB (Docker)
docker start mongodb
# Or create new container
docker run -d --name mongodb -p 27017:27017 mongo:7

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Verify connection string in .env
cat backend/.env | grep MONGODB_URI
```

### Database not created

**Symptoms:**
- Empty database
- No collections
- No data

**Solutions:**
```bash
# MongoDB creates database/collection on first write
# Simply insert data through the API or frontend

# Verify database exists
mongosh --eval "show dbs"

# Verify collection exists
mongosh learning_db --eval "show collections"

# Check connection string
cat backend/.env
```

### Data not persisting

**Symptoms:**
- Data disappears after restart
- Items created but not saved
- Empty database after reload

**Solutions:**
```bash
# Verify MongoDB data directory
ls -la /var/lib/mongodb/  # Linux
ls -la /usr/local/var/mongodb/  # macOS

# Check MongoDB is running as service (not in-memory)
mongosh --eval "db.serverStatus().storageEngine"

# Verify write operations succeed
# Check backend console for errors

# Ensure MongoDB has write permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
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

### API returns 400 (Invalid ID)

**Symptoms:**
- "Invalid ID format" error
- Cannot fetch/update/delete items
- ID validation fails

**Solutions:**
```bash
# MongoDB uses 24-character hex ObjectId strings
# Valid:   65a1b2c3d4e5f6a7b8c9d0e1
# Invalid: 1, abc, not-an-id

# Get valid IDs by listing all items
curl http://localhost:3000/api/data

# Use the _id field from the response
curl http://localhost:3000/api/data/65a1b2c3d4e5f6a7b8c9d0e1
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

# Verify MongoDB is accessible
mongosh learning_db --eval "db.items.find().limit(1)"

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
```javascript
// Verify indexes exist
// In mongosh:
db.items.getIndexes()

// Create indexes if missing
db.items.createIndex({ category: 1 })
db.items.createIndex({ name: 1 })

// Check query performance
db.items.find({ category: "Electronics" }).explain("executionStats")
```

```bash
# Check MongoDB server stats
mongosh --eval "db.serverStatus()"

# Check collection stats
mongosh learning_db --eval "db.items.stats()"

# Check for many documents
mongosh learning_db --eval "db.items.countDocuments()"
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

# MongoDB not running
sudo systemctl start mongod

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

### "MongoServerSelectionError"
```bash
# MongoDB is not running or not reachable
# Start MongoDB service
sudo systemctl start mongod

# Check if port 27017 is accessible
lsof -i :27017

# Verify connection string
cat backend/.env | grep MONGODB_URI
```

## Getting Help

If issues persist:

1. **Check Console Logs**
   - Backend: Terminal running backend
   - Frontend: Browser DevTools Console

2. **Verify Prerequisites**
   - Node.js 18+
   - MongoDB running
   - All dependencies installed
   - .env files created

3. **Review Documentation**
   - SETUP.md
   - API_DOCS.md
   - DATABASE_INFO.md

4. **Test Individually**
   - Test backend with curl
   - Test frontend independently
   - Check database with mongosh

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
7. **Ensure MongoDB is running** - Check before starting backend

## Still Having Issues?

- Double-check SETUP.md steps
- Verify all prerequisites
- Check file permissions
- Try on different port
- Restart computer (fixes strange issues)
- Check antivirus/firewall settings
- Verify MongoDB is accepting connections

Remember: Most issues are configuration-related, missing dependencies, or MongoDB not running!
