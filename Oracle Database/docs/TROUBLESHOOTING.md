# Troubleshooting Guide

Common issues and solutions for the Oracle Database Learning Module.

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

### oracledb installation fails

**Symptoms:**
- Native module compilation errors
- Oracle Instant Client not found

**Solutions:**
```bash
# oracledb 6.x supports Thin mode (no Instant Client needed)
# Ensure you're using oracledb >= 6.0.0

# If using Thick mode, install Oracle Instant Client:
# macOS:
brew install instantclient-basiclite

# Linux (Ubuntu/Debian):
# Download from Oracle website
sudo apt-get install libaio1
export LD_LIBRARY_PATH=/opt/oracle/instantclient_21_1:$LD_LIBRARY_PATH

# Windows:
# Download Instant Client and add to PATH
```

## Oracle Database Issues

### ORA-12541: TNS:no listener

**Symptoms:**
- Cannot connect to Oracle Database
- Connection refused errors

**Solutions:**
```bash
# Check if listener is running
lsnrctl status

# Start the listener
lsnrctl start

# If using Docker
docker start oracle-xe
docker logs oracle-xe

# Check listener configuration
cat $ORACLE_HOME/network/admin/listener.ora
```

### ORA-01017: Invalid username/password

**Symptoms:**
- Authentication failures
- Login denied

**Solutions:**
```bash
# Verify credentials in .env file
cat backend/.env

# Reset password (connect as SYSDBA)
sqlplus / as sysdba
ALTER USER system IDENTIFIED BY oracle;
EXIT;

# Unlock account if locked
ALTER USER system ACCOUNT UNLOCK;
```

### ORA-12514: TNS:listener does not currently know of service

**Symptoms:**
- Listener running but service not found
- XEPDB1 not available

**Solutions:**
```bash
# Check available services
lsnrctl services

# If using Docker, wait for database to fully start
docker logs -f oracle-xe
# Wait for "DATABASE IS READY TO USE!"

# Open the pluggable database
sqlplus / as sysdba
ALTER PLUGGABLE DATABASE XEPDB1 OPEN;
ALTER PLUGGABLE DATABASE XEPDB1 SAVE STATE;
EXIT;
```

### ORA-00955: Name is already used by an existing object

**Symptoms:**
- Error during initialization
- Table or sequence already exists

**Solutions:**
This is expected behavior. The application handles this error gracefully by catching ORA-00955. No action needed.

### ORA-28000: The account is locked

**Solutions:**
```sql
-- Connect as SYSDBA
sqlplus / as sysdba

-- Unlock the account
ALTER USER system ACCOUNT UNLOCK;

-- Set password
ALTER USER system IDENTIFIED BY oracle;
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

# Verify Oracle is running
docker ps | grep oracle  # If using Docker

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

## Connection Pool Issues

### Pool exhaustion

**Symptoms:**
- "NJS-076: connection pool is full"
- Slow or hanging requests
- Timeout errors

**Solutions:**
```javascript
// Increase pool size in database.js
const dbConfig = {
  poolMax: 20,      // Increase max connections
  poolMin: 4,       // Increase min connections
  poolIncrement: 2  // Faster pool growth
};
```

```bash
# Ensure connections are being released
# Check routes.js for proper finally blocks:
# finally { if (connection) await connection.close(); }

# Monitor pool statistics
# Add to server.js for debugging:
const pool = require('./database').pool();
console.log('Pool stats:', pool.connectionsOpen, pool.connectionsInUse);
```

### Connection timeout

**Symptoms:**
- Long waits for connections
- "NJS-040: connection request timeout"

**Solutions:**
```javascript
// Add timeout to pool config
const dbConfig = {
  queueTimeout: 60000,  // Wait up to 60s for connection
  poolTimeout: 60       // Idle connections timeout after 60s
};
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

**Solutions:**
```bash
# Check backend is running
curl http://localhost:3000/health

# Verify base URL in frontend
cat frontend/.env

# Check API route prefix: /api/data, /api/search
```

### API returns 500 errors

**Symptoms:**
- Internal server errors
- Database errors in console

**Solutions:**
```bash
# Check backend console for Oracle errors
# Common issues:
# - ORA-00942: Table or view does not exist
# - ORA-01400: Cannot insert NULL
# - ORA-01438: Value larger than precision

# Verify database is accessible
sqlplus system/oracle@localhost:1521/XEPDB1

# Check table exists
SELECT table_name FROM user_tables WHERE table_name = 'ITEMS';
```

## Frontend Issues

### White screen / blank page

**Solutions:**
```bash
# Check browser console for errors (F12)
# Verify backend is running
curl http://localhost:3000/api/data

# Check API URL in frontend .env
cat frontend/.env

# Hard refresh: Ctrl+Shift+R or Cmd+Shift+R
# Restart frontend
cd frontend && npm run dev
```

### Components not updating

**Solutions:**
```javascript
// Check if store is being used correctly
// Open browser Vue DevTools
// Verify Pinia store initialization
// Force refresh: store.fetchItems()
```

### Dark mode not working

**Solutions:**
```javascript
// Check tailwind.config.js: darkMode: 'class'
// Verify store.darkMode state in Vue DevTools
// Clear browser storage: localStorage.clear()
```

## Build Issues

### Frontend build fails

**Solutions:**
```bash
# Clean and rebuild
rm -rf node_modules dist package-lock.json
npm install
npm run build

# Check for syntax errors in components
# Verify all imports exist
```

## Performance Issues

### Slow API responses

**Solutions:**
```sql
-- Verify indexes exist
SELECT index_name, table_name FROM user_indexes WHERE table_name = 'ITEMS';

-- Analyze table statistics
EXEC DBMS_STATS.GATHER_TABLE_STATS('SYSTEM', 'ITEMS');

-- Check execution plans
EXPLAIN PLAN FOR SELECT * FROM items WHERE category = 'Electronics';
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
```

```bash
# Check connection pool utilization
# Monitor Oracle sessions
sqlplus system/oracle@localhost:1521/XEPDB1
SELECT COUNT(*) FROM v$session WHERE username = 'SYSTEM';
```

### Oracle XE memory issues

**Solutions:**
```sql
-- Check memory allocation
SHOW PARAMETER sga_target;
SHOW PARAMETER pga_aggregate_target;

-- Oracle XE limit: 2GB SGA
-- Ensure host has at least 4GB RAM
```

## Common Error Messages

### "Cannot find module 'oracledb'"
```bash
npm install oracledb
```

### "NJS-500: connection to the Oracle Database was broken"
```bash
# Oracle instance crashed or restarted
# Restart Oracle:
docker restart oracle-xe
# Or:
sqlplus / as sysdba
STARTUP;
```

### "ECONNREFUSED 127.0.0.1:1521"
```bash
# Oracle not running on expected port
# Start Oracle and verify listener
lsnrctl status
docker start oracle-xe
```

### "Failed to fetch"
```bash
# Backend not running - start it
cd backend && npm run dev

# Check CORS settings
# Check browser console for details
```

## Docker-Specific Issues

### Container won't start

```bash
# Check logs
docker logs oracle-xe

# Ensure enough memory (Oracle XE needs ~2GB)
docker stats oracle-xe

# Remove and recreate
docker rm -f oracle-xe
docker run -d --name oracle-xe -p 1521:1521 -e ORACLE_PWD=oracle \
  container-registry.oracle.com/database/express:latest
```

### Slow container startup

Oracle XE takes 2-5 minutes to start. Wait for "DATABASE IS READY TO USE!" in logs.

```bash
docker logs -f oracle-xe
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
   - Test Oracle: `sqlplus system/oracle@localhost:1521/XEPDB1`
   - Test backend: `curl http://localhost:3000/health`
   - Test frontend: Open http://localhost:5173

5. **Start Fresh**
   ```bash
   # Clean everything
   rm -rf backend/node_modules
   rm -rf frontend/node_modules frontend/dist
   
   # Reinstall
   cd backend && npm install
   cd ../frontend && npm install
   
   # Restart Oracle
   docker restart oracle-xe
   
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
5. **Monitor connections** - Always close connections in finally blocks
6. **Use Docker** - Simplifies Oracle installation
7. **Read error messages** - Oracle error numbers (ORA-xxxxx) are well-documented

## Still Having Issues?

- Double-check SETUP.md steps
- Verify Oracle is running and accessible
- Check Oracle documentation for ORA-xxxxx errors
- Try with a fresh Docker container
- Restart computer (fixes strange issues)

Remember: Most issues are Oracle connectivity or missing dependencies!
