# Troubleshooting Guide

Common issues and solutions for the SQL Server Learning Module.

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

### mssql package installation fails

**Symptoms:**
- Native module compilation errors
- Tedious connection errors

**Solutions:**
```bash
# Ensure Node.js 18+ is installed
node --version

# Reinstall mssql package
npm uninstall mssql
npm install mssql

# If using older Node.js, upgrade
nvm install 18
nvm use 18
```

## SQL Server Issues

### Cannot connect to SQL Server

**Symptoms:**
- "ConnectionError: Failed to connect"
- "ECONNREFUSED" on port 1433
- Timeout errors

**Solutions:**

```bash
# 1. Verify SQL Server is running
# Linux
systemctl status mssql-server

# Docker
docker ps | grep sqlserver

# Windows - Check Services
```

```bash
# 2. Enable TCP/IP protocol
# Windows: SQL Server Configuration Manager > Protocols > Enable TCP/IP
# Linux: TCP/IP is enabled by default

# 3. Check firewall
# Linux
sudo ufw allow 1433/tcp

# Windows
netsh advfirewall firewall add rule name="SQL Server" dir=in action=allow protocol=tcp localport=1433
```

```bash
# 4. Verify connection manually
sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "SELECT 1"

# 5. Check .env configuration
cat backend/.env
```

### Database does not exist

**Symptoms:**
- "Cannot open database 'learning_db'"
- Login failed for user

**Solutions:**
```bash
# Create the database manually
sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "CREATE DATABASE learning_db"

# Or via Docker
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P "YourStrong@Passw0rd" \
  -Q "CREATE DATABASE learning_db"
```

### SQL Server password policy

**Symptoms:**
- "Password validation failed"
- Cannot set password

**Solutions:**
SQL Server requires strong passwords:
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Example: `YourStrong@Passw0rd`

### Docker SQL Server issues

**Symptoms:**
- Container exits immediately
- Cannot connect to container

**Solutions:**
```bash
# Check container logs
docker logs sqlserver

# Ensure ACCEPT_EULA is set
docker run -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 \
  --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest

# Check if port is mapped
docker port sqlserver

# Ensure minimum 2GB RAM for container
docker run --memory=2g ...
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

# Verify database is accessible
sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" \
  -d learning_db -Q "SELECT TOP 1 * FROM items"

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
```

## Performance Issues

### Slow API responses

**Symptoms:**
- Long load times
- Timeouts
- Laggy UI

**Solutions:**
```sql
-- Verify indexes exist
SELECT name, type_desc FROM sys.indexes WHERE object_id = OBJECT_ID('items');

-- Update statistics
UPDATE STATISTICS items;

-- Check query performance
SET STATISTICS IO ON;
SELECT * FROM items WHERE category = 'Electronics';
SET STATISTICS IO OFF;
```

```bash
# Check connection pool settings
# In database.js, verify pool configuration
# max: 10, min: 2, idleTimeoutMillis: 30000
```

### SQL Server using too much memory

**Symptoms:**
- Server slow
- Other applications affected
- High memory usage

**Solutions:**
```sql
-- Set max memory limit
EXEC sp_configure 'max server memory', 2048;  -- 2 GB
RECONFIGURE;

-- Check current memory usage
SELECT
  physical_memory_in_use_kb / 1024 AS memory_mb
FROM sys.dm_os_process_memory;
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
# SQL Server not running
# Start SQL Server service

# Backend not running
cd backend && npm run dev

# Wrong port
# Check .env configuration
```

### "Login failed for user 'sa'"
```bash
# Wrong password in .env
# Verify MSSQL_PASSWORD

# SQL Server authentication mode
# Ensure "SQL Server and Windows Authentication" mode is enabled

# Account locked out
# Check SQL Server logs
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

## Getting Help

If issues persist:

1. **Check Console Logs**
   - Backend: Terminal running backend
   - Frontend: Browser DevTools Console

2. **Verify Prerequisites**
   - Node.js 18+
   - SQL Server running
   - All dependencies installed
   - .env files created

3. **Review Documentation**
   - SETUP.md
   - API_DOCS.md
   - DATABASE_INFO.md

4. **Test Individually**
   - Test SQL Server with sqlcmd
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
7. **Use Docker** - Simplifies SQL Server setup

## Still Having Issues?

- Double-check SETUP.md steps
- Verify all prerequisites
- Check file permissions
- Try on different port
- Restart computer (fixes strange issues)
- Check antivirus/firewall settings
- Ensure SQL Server has enough memory (minimum 2 GB for Docker)

Remember: Most issues are configuration-related or missing dependencies!
