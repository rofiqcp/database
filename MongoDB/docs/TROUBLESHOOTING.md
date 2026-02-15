# Troubleshooting Guide

Common issues and solutions for the MongoDB Learning Module.

## MongoDB Connection Issues

### MongoDB Server Not Running

**Symptoms:**
- "connect ECONNREFUSED" error
- "MongoServerError" in console
- Cannot connect to database

**Solutions:**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Start MongoDB (Ubuntu/Debian)
sudo systemctl start mongod

# Start MongoDB (Windows)
# Check Services app or run:
mongod

# Verify connection
mongosh "mongodb://localhost:27017"
```

### Invalid Connection String

**Symptoms:**
- "MongoParseError" or "error parsing connection string"
- Wrong username/password error

**Solutions:**
```bash
# Check connection string format in .env
cat backend/.env | grep MONGODB_URI

# Local MongoDB format (correct)
MONGODB_URI=mongodb://localhost:27017/mydb

# MongoDB Atlas format (correct)
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/dbname

# Ensure no special characters in connection string
# If password has special chars, URL-encode them
# Example: pass@word -> pass%40word
```

### Authentication Failed

**Symptoms:**
- "authentication failed" error
- "Invalid username or password"

**Solutions:**
```bash
# For local MongoDB with authentication
# Verify username and password are correct
mongosh -u username -p password --authenticationDatabase admin

# For MongoDB Atlas
# Check IP whitelist allows your IP
# Verify username/password in connection string
# Use correct database name in connection string

# Reset MongoDB user (local)
mongosh
db.dropUser("username")
db.createUser({
  user: "username",
  pwd: "password",
  roles: ["readWrite"]
})
```

### Network Connection Issues

**Symptoms:**
- Timeout errors
- Connection hangs
- Slow connection

**Solutions:**
```bash
# Check if MongoDB port is accessible
telnet localhost 27017

# For MongoDB Atlas, check firewall/VPN
# Ensure IP whitelist is configured

# Increase connection timeout in .env
# Add to connection options:
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000
})
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

### Mongoose Installation Issues

**Symptoms:**
- Cannot find module 'mongoose'
- Mongoose version conflicts

**Solutions:**
```bash
# Ensure mongoose is installed
npm install mongoose

# Check installed version
npm list mongoose

# Reinstall specific version
npm install mongoose@latest

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
mongosh "mongodb://localhost:27017"
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

### Database Connection Pooling Issues

**Symptoms:**
- "connection pool was destroyed" error
- Too many connections
- Slow performance

**Solutions:**
```javascript
// Adjust connection pool in server.js
mongoose.connect(mongoURI, {
  maxPoolSize: 10,      // Reduce if too many
  minPoolSize: 5,       // Balance availability
  serverSelectionTimeoutMS: 5000
})
```

### ObjectId Validation Errors

**Symptoms:**
- "Cast to ObjectId failed for value..."
- Invalid ID format error
- 404 errors on valid IDs

**Solutions:**
```bash
# Verify ObjectId format (24 hex characters)
# Valid: 507f1f77bcf86cd799439011
# Invalid: 1, abc

# Check backend is providing ObjectIds
curl http://localhost:3000/api/data

# Use returned _id directly in requests
curl http://localhost:3000/api/data/507f1f77bcf86cd799439011

# Backend should have ObjectId validation
# Add to routes if not present:
const ObjectId = require('mongoose').Types.ObjectId
if (!ObjectId.isValid(id)) {
  return res.status(400).json({ error: 'Invalid ID format' })
}
```

### Document Not Persisting

**Symptoms:**
- Data disappears after restart
- Items created but not saved
- Empty database after reload

**Solutions:**
```bash
# Check MongoDB is actually running
mongosh "mongodb://localhost:27017"

# Verify database exists
show databases

# Check collection has data
use mydb
db.items.countDocuments()
db.items.find()

# Check connection string in .env
cat backend/.env | grep MONGODB_URI

# Verify data is being saved (check console logs)
# Look for "Document saved" or similar messages
```

### Data Inconsistency Issues

**Symptoms:**
- Duplicate data
- Missing fields
- Unexpected values

**Solutions:**
```bash
# Validate schema in MongoDB
db.items.validate()

# Check indexes
db.items.getIndexes()

# Clean up old data if needed
db.items.deleteMany({ createdAt: { $lt: new Date("2024-01-01") } })

# Run database repair
mongosh
db.fsyncLock()  // Lock database
db.fsyncUnlock()  // Unlock
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

// Check CORS middleware in backend/src/server.js
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

# Verify database is accessible
mongosh "mongodb://localhost:27017/mydb"

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
- Schema validation failures
- Type mismatch errors

**Solutions:**
```bash
# Check Mongoose schema validation
# Verify all required fields are provided

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

### Backend Build Errors

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
node --check backend/src/models/Item.js

# Install dependencies
cd backend
npm install
```

## Performance Issues

### Slow API Responses

**Symptoms:**
- Long load times
- Timeouts
- Laggy UI

**Solutions:**
```bash
# Verify indexes exist in MongoDB
mongosh
use mydb
db.items.getIndexes()

# Create missing indexes
db.items.createIndex({ category: 1 })
db.items.createIndex({ name: 1 })

# Analyze query performance
db.items.find({ category: "Electronics" }).explain("executionStats")

# Check database size
db.items.stats()

# Monitor connections
mongosh --host localhost --port 27017
db.currentOp()
```

### Frontend Slow/Laggy

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
# Implement pagination in API

# Check browser console
# Look for performance warnings

# Check network requests (DevTools)
# Ensure images/assets loading efficiently
```

## Development Issues

### Hot Reload Not Working

**Symptoms:**
- Changes don't reflect
- Need to restart manually
- Nodemon/Vite HMR fails

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

### Environment Variables Not Loaded

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

# Backend: No prefix needed
# MONGODB_URI=mongodb://...
```

## Common Error Messages

### "MongoServerError: Connection refused"
```bash
# MongoDB not running
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### "MongoAuthError: authentication failed"
```bash
# Wrong credentials
# Check username/password in connection string
# Verify user exists in MongoDB
mongosh -u username -p password --authenticationDatabase admin
```

### "Cast to ObjectId failed"
```bash
# Invalid ObjectId format
# ObjectId must be 24 hex characters
# Example valid: 507f1f77bcf86cd799439011
```

### "ValidationError: name: Path `name` is required"
```bash
# Missing required field in request
# Add "name" field to your request:
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name":"Item Name"}'
```

## Getting Help

If issues persist:

1. **Check Console Logs**
   - Backend: Terminal running backend
   - Frontend: Browser DevTools Console

2. **Verify Prerequisites**
   - Node.js 18+
   - MongoDB 5.0+
   - All dependencies installed
   - .env files created

3. **Review Documentation**
   - SETUP.md
   - API_DOCS.md
   - DATABASE_INFO.md

4. **Test Individually**
   - Test MongoDB connection with mongosh
   - Test backend with curl
   - Test frontend independently
   - Check database directly

5. **Start Fresh**
   ```bash
   # Clean everything
   rm -rf backend/node_modules
   rm -rf frontend/node_modules frontend/dist
   
   # Reinstall
   cd backend && npm install
   cd ../frontend && npm install
   
   # Stop and restart MongoDB
   brew services restart mongodb-community
   
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
7. **Verify MongoDB is running** - Before starting backend

## Still Having Issues?

- Double-check SETUP.md steps
- Verify all prerequisites (especially MongoDB)
- Check file permissions
- Try on different port
- Restart computer (fixes strange issues)
- Check antivirus/firewall settings
- Check MongoDB connection string format

Remember: Most issues are configuration-related or missing MongoDB connection!
