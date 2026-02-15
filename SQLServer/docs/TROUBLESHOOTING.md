# Troubleshooting Guide

Common issues and solutions for the SQL Server Learning Module.

## SQL Server Connection Issues

### SQL Server Not Running

**Symptoms:**
- "connect ECONNREFUSED" error
- "ConnectionError" in console
- Cannot connect to database

**Solutions:**
```bash
# Check if SQL Server is running (Linux)
systemctl status mssql-server

# Start SQL Server (Linux)
sudo systemctl start mssql-server

# Check Docker container
docker ps | grep sqlserver

# Start Docker container
docker start sqlserver

# Verify connection
sqlcmd -S localhost -U sa -P "YourStrong!Password" -Q "SELECT 1"
```

### Invalid Connection Configuration

**Symptoms:**
- "Login failed" error
- Wrong username/password error
- Connection timeout

**Solutions:**
```bash
# Check connection details in .env
cat backend/.env

# Verify SQL Server credentials
sqlcmd -S localhost -U sa -P "YourStrong!Password"

# Check port is correct (default: 1433)
sqlcmd -S localhost,1433 -U sa -P "YourStrong!Password"

# For Docker, ensure port mapping is correct
docker port sqlserver
```

### Authentication Failed

**Symptoms:**
- "Login failed for user" error
- "Invalid username or password"

**Solutions:**
```bash
# Verify SA password
sqlcmd -S localhost -U sa -P "YourStrong!Password"

# Reset SA password (Linux)
sudo /opt/mssql/bin/mssql-conf set-sa-password

# Reset SA password (Docker)
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "OldPassword" \
  -Q "ALTER LOGIN sa WITH PASSWORD = 'NewPassword'"

# Check SQL Server authentication mode
# Ensure mixed mode authentication is enabled
```

### Network Connection Issues

**Symptoms:**
- Timeout errors
- Connection hangs
- Slow connection

**Solutions:**
```bash
# Check if SQL Server port is accessible
telnet localhost 1433

# For Docker, verify port mapping
docker ps

# Check firewall rules (Linux)
sudo ufw status
sudo ufw allow 1433/tcp

# Increase connection timeout
# In database.js config:
# connectionTimeout: 30000
# requestTimeout: 30000
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

### mssql Package Installation Issues

**Symptoms:**
- Cannot find module 'mssql'
- mssql version conflicts

**Solutions:**
```bash
# Ensure mssql is installed
npm install mssql

# Check installed version
npm list mssql

# Reinstall specific version
npm install mssql@^10.0.1

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
sqlcmd -S localhost -U sa -P "YourStrong!Password"
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

### Database Not Found

**Symptoms:**
- "Cannot open database" error
- Database doesn't exist

**Solutions:**
```sql
-- Create database manually if needed
sqlcmd -S localhost -U sa -P "YourStrong!Password"
CREATE DATABASE learning_db;
GO

-- Verify database exists
SELECT name FROM sys.databases;
GO
```

### Table Not Created

**Symptoms:**
- "Invalid object name 'items'" error
- Table doesn't exist

**Solutions:**
```bash
# Restart the backend - table is auto-created on startup
npm run dev

# Or create manually
sqlcmd -S localhost -U sa -P "YourStrong!Password" -d learning_db
```

```sql
CREATE TABLE items (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  category NVARCHAR(100),
  price DECIMAL(10,2) DEFAULT 0,
  quantity INT DEFAULT 0,
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE()
);
GO
```

### Connection Pool Issues

**Symptoms:**
- "connection pool was destroyed" error
- Too many connections
- Slow performance

**Solutions:**
```javascript
// Adjust connection pool in database.js
const config = {
  pool: {
    max: 20,      // Maximum connections
    min: 0,       // Minimum connections
    idleTimeoutMillis: 30000
  }
};
```

### Data Not Persisting

**Symptoms:**
- Data disappears after restart
- Items created but not saved
- Empty table after reload

**Solutions:**
```bash
# Check SQL Server is running
sqlcmd -S localhost -U sa -P "YourStrong!Password"

# Verify database exists
SELECT name FROM sys.databases;

# Check table has data
USE learning_db;
SELECT COUNT(*) FROM items;
SELECT * FROM items;

# Check connection details in .env
cat backend/.env
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

# Verify database is accessible
sqlcmd -S localhost -U sa -P "YourStrong!Password" -d learning_db

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
# Verify all required fields are provided
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
```

## Performance Issues

### Slow API Responses

**Symptoms:**
- Long load times
- Timeouts
- Laggy UI

**Solutions:**
```sql
-- Verify indexes exist
USE learning_db;
SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('items');

-- Create missing indexes
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);

-- Analyze query performance
SET STATISTICS IO ON;
SET STATISTICS TIME ON;
SELECT * FROM items WHERE category = N'Electronics';
SET STATISTICS IO OFF;
SET STATISTICS TIME OFF;

-- Check table size
EXEC sp_spaceused 'items';
```

## Common Error Messages

### "ConnectionError: Failed to connect to localhost:1433"
```bash
# SQL Server not running
sudo systemctl start mssql-server  # Linux
docker start sqlserver              # Docker
```

### "Login failed for user 'sa'"
```bash
# Wrong credentials
# Check MSSQL_USER and MSSQL_PASSWORD in .env
# Verify with sqlcmd
sqlcmd -S localhost -U sa -P "YourStrong!Password"
```

### "Invalid object name 'items'"
```bash
# Table doesn't exist
# Restart backend to auto-create
npm run dev
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

2. **Verify Prerequisites**
   - Node.js 18+
   - SQL Server 2019+
   - All dependencies installed
   - .env files created

3. **Review Documentation**
   - SETUP.md
   - API_DOCS.md
   - DATABASE_INFO.md

4. **Test Individually**
   - Test SQL Server connection with sqlcmd
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
   
   # Restart SQL Server
   sudo systemctl restart mssql-server
   
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
7. **Verify SQL Server is running** - Before starting backend

## Still Having Issues?

- Double-check SETUP.md steps
- Verify all prerequisites (especially SQL Server)
- Check file permissions
- Try on different port
- Restart computer (fixes strange issues)
- Check antivirus/firewall settings
- Check SQL Server connection configuration

Remember: Most issues are configuration-related or missing SQL Server connection!
