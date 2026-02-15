# Troubleshooting Guide

Common issues and solutions for the Oracle Database Learning Module.

## Oracle Database Connection Issues

### Oracle Database Not Running

**Symptoms:**
- "ORA-12541: TNS: no listener" error
- "ORA-12514: TNS: listener does not currently know of service" error
- Cannot connect to database

**Solutions:**
```bash
# Check if Oracle Listener is running
lsnrctl status

# Start Oracle Listener
lsnrctl start

# Check if Oracle Database is running
sqlplus / as sysdba
SQL> SELECT status FROM v$instance;

# Start Oracle Database
sqlplus / as sysdba
SQL> STARTUP;

# Docker container
docker start oracle-xe
docker logs -f oracle-xe
```

### Invalid Connection String

**Symptoms:**
- "ORA-12154: TNS: could not resolve the connect identifier specified"
- Wrong connect string error

**Solutions:**
```bash
# Check connection string format in .env
cat backend/.env

# Service Name format (correct)
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1

# SID format (correct)
ORACLE_CONNECT_STRING=localhost:1521/XE

# TNS name format (correct)
ORACLE_CONNECT_STRING=XEPDB1

# Test connection with sqlplus
sqlplus system/oracle@localhost:1521/XEPDB1

# Test with tnsping
tnsping XEPDB1
```

### Authentication Failed

**Symptoms:**
- "ORA-01017: invalid username/password; logon denied"
- Authentication error

**Solutions:**
```bash
# Verify username and password
sqlplus system/oracle@localhost:1521/XEPDB1

# Reset user password (as SYSDBA)
sqlplus / as sysdba
SQL> ALTER USER system IDENTIFIED BY oracle;

# Check user account status
SELECT username, account_status FROM dba_users WHERE username = 'SYSTEM';

# Unlock account if locked
ALTER USER system ACCOUNT UNLOCK;
```

### Oracle Instant Client Not Found

**Symptoms:**
- "DPI-1047: Cannot locate a 64-bit Oracle Client library"
- Library loading errors

**Solutions:**
```bash
# Install Oracle Instant Client
# Download from: https://www.oracle.com/database/technologies/instant-client.html

# Set library path (Linux)
export LD_LIBRARY_PATH=/opt/oracle/instantclient_21_1:$LD_LIBRARY_PATH

# Set library path (macOS)
export DYLD_LIBRARY_PATH=/opt/oracle/instantclient_21_1:$DYLD_LIBRARY_PATH

# Or initialize in code
oracledb.initOracleClient({ libDir: '/opt/oracle/instantclient_21_1' });

# Note: oracledb 6.x "Thin mode" doesn't require Instant Client
# Make sure you're using oracledb >= 6.0
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

### oracledb Installation Issues

**Symptoms:**
- Cannot find module 'oracledb'
- oracledb build errors

**Solutions:**
```bash
# Ensure oracledb is installed
npm install oracledb

# Check installed version
npm list oracledb

# Reinstall specific version
npm install oracledb@6.2.0

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
sqlplus system/oracle@localhost:1521/XEPDB1
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

### Connection Pool Issues

**Symptoms:**
- "NJS-076: connection request timeout" error
- Too many connections
- Slow performance

**Solutions:**
```javascript
// Adjust connection pool settings in database.js
const pool = await oracledb.createPool({
  poolMin: 2,       // Reduce if too many
  poolMax: 10,      // Increase for more concurrent requests
  poolIncrement: 1,
  poolTimeout: 60   // Connection timeout in seconds
});
```

### Table Not Created

**Symptoms:**
- "ORA-00942: table or view does not exist"
- Items table not found

**Solutions:**
```bash
# Connect to Oracle and check tables
sqlplus system/oracle@localhost:1521/XEPDB1

# List user tables
SELECT table_name FROM user_tables;

# Create table manually if needed
CREATE TABLE items (
  id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR2(255) NOT NULL,
  description CLOB,
  category VARCHAR2(100),
  price NUMBER(10,2) DEFAULT 0,
  quantity NUMBER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# Create indexes
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);
```

### Data Not Persisting

**Symptoms:**
- Data disappears after restart
- Items created but not saved
- Empty table after reload

**Solutions:**
```bash
# Check if auto-commit is enabled (should be true)
# In database.js: oracledb.autoCommit = true;

# Verify table has data
sqlplus system/oracle@localhost:1521/XEPDB1
SELECT COUNT(*) FROM items;
SELECT * FROM items;

# Check connection string in .env
cat backend/.env

# Verify data is being saved (check console logs)
```

### ORA Errors

**Common ORA errors and solutions:**

```bash
# ORA-00001: unique constraint violated
# Duplicate primary key - identity column should handle this automatically

# ORA-01400: cannot insert NULL into ("SCHEMA"."ITEMS"."NAME")
# Name field is required - ensure it's provided in the request

# ORA-02291: integrity constraint violated - parent key not found
# Foreign key issue - check related tables

# ORA-00054: resource busy and acquire with NOWAIT specified
# Table is locked - wait or kill the blocking session
SELECT sid, serial#, username FROM v$session WHERE username = 'SYSTEM';
ALTER SYSTEM KILL SESSION 'sid,serial#';
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
# Look for stack traces and ORA errors

# Verify database is accessible
sqlplus system/oracle@localhost:1521/XEPDB1

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
node --check backend/src/database.js

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
# Verify indexes exist
sqlplus system/oracle@localhost:1521/XEPDB1
SELECT index_name, column_name FROM user_ind_columns WHERE table_name = 'ITEMS';

# Create missing indexes
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);

# Analyze query performance
EXPLAIN PLAN FOR SELECT * FROM items WHERE category = 'Electronics';
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);

# Gather table statistics
EXEC DBMS_STATS.GATHER_TABLE_STATS(USER, 'ITEMS');
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

# Reduce data load
# Implement pagination in API

# Check browser console
# Look for performance warnings

# Check network requests (DevTools)
```

## Common Error Messages

### "ORA-12541: TNS: no listener"
```bash
# Oracle Listener not running
lsnrctl start
```

### "ORA-01017: invalid username/password; logon denied"
```bash
# Wrong credentials
# Check ORACLE_USER and ORACLE_PASSWORD in .env
sqlplus system/oracle@localhost:1521/XEPDB1
```

### "ORA-00942: table or view does not exist"
```bash
# Table not created
# Restart backend to auto-create table
# Or create manually in SQL*Plus
```

### "DPI-1047: Cannot locate a 64-bit Oracle Client library"
```bash
# Oracle Instant Client not installed
# For oracledb 6.x, Thin mode doesn't require it
# Ensure using oracledb >= 6.0.0
npm list oracledb
```

### "NJS-076: connection request timeout"
```bash
# Connection pool exhausted
# Increase poolMax or check for connection leaks
# Ensure connections are closed in finally blocks
```

## Getting Help

If issues persist:

1. **Check Console Logs**
   - Backend: Terminal running backend
   - Frontend: Browser DevTools Console

2. **Verify Prerequisites**
   - Node.js 18+
   - Oracle Database running
   - All dependencies installed
   - .env files created

3. **Review Documentation**
   - SETUP.md
   - API_DOCS.md
   - DATABASE_INFO.md

4. **Test Individually**
   - Test Oracle connection with sqlplus
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
   
   # Restart Oracle Database
   lsnrctl stop && lsnrctl start
   
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
6. **Read error messages** - ORA errors are descriptive
7. **Verify Oracle is running** - Before starting backend
8. **Close connections** - Always use try/finally blocks

## Still Having Issues?

- Double-check SETUP.md steps
- Verify all prerequisites (especially Oracle Database)
- Check file permissions
- Try on different port
- Restart computer (fixes strange issues)
- Check antivirus/firewall settings
- Check Oracle Listener status with `lsnrctl status`

Remember: Most issues are configuration-related or Oracle Database connection issues!
