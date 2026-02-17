# Oracle Database Learning Module - Setup Guide

Complete step-by-step setup instructions for the Oracle Database learning module.

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Oracle Database**: XE (Express Edition) or higher
- **Text Editor**: VS Code, Sublime Text, or your preferred editor

### Optional Software
- **Oracle Instant Client**: Required for Thick mode (Thin mode works without it)
- **Oracle SQL Developer**: GUI tool for database management
- **Docker**: For running Oracle XE in a container

### Check Prerequisites
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
```

## Oracle Database Installation

### Option 1: Docker (Recommended for Learning)

```bash
# Pull Oracle XE image
docker pull container-registry.oracle.com/database/express:latest

# Run Oracle XE container
docker run -d \
  --name oracle-xe \
  -p 1521:1521 \
  -e ORACLE_PWD=oracle \
  container-registry.oracle.com/database/express:latest

# Wait for database to start (may take 2-5 minutes)
docker logs -f oracle-xe
# Look for: "DATABASE IS READY TO USE!"
```

### Option 2: Native Installation

1. Download Oracle XE from: https://www.oracle.com/database/technologies/xe-downloads.html
2. Follow the installation guide for your OS
3. Set the system password during installation
4. Verify the listener is running: `lsnrctl status`

### Verify Oracle is Running

```bash
# Using SQL*Plus
sqlplus system/oracle@localhost:1521/XEPDB1

# Or test connection with tnsping
tnsping localhost:1521/XEPDB1
```

## Installation Steps

### 1. Navigate to Oracle Database Folder
```bash
cd "Oracle Database"
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# (Optional) Edit .env if needed
# Update Oracle credentials if different from defaults
```

#### Backend Environment Variables (.env)
```env
PORT=3000
NODE_ENV=development
ORACLE_USER=system
ORACLE_PASSWORD=oracle
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
CORS_ORIGIN=http://localhost:5173
```

### 3. Frontend Setup

```bash
# Navigate to frontend folder (from backend folder)
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## Running the Application

### Option 1: Manual Start (Recommended for Learning)

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Expected output:
```
🚀 Oracle Database Backend Server running on http://localhost:3000
📊 Database: Oracle Database
🔗 CORS enabled for: http://localhost:5173
✓ Connected to Oracle Database
✓ Database initialized successfully
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Expected output:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Option 2: Using npm scripts

```bash
# Using concurrently (if installed globally)
npm install -g concurrently

# Then from Oracle Database root directory
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

## Accessing the Application

1. **Frontend UI**: http://localhost:5173
2. **Backend API**: http://localhost:3000/api
3. **Health Check**: http://localhost:3000/health

## Testing the Setup

### 1. Test Backend API
```bash
# Health check
curl http://localhost:3000/health

# Get all items (should return empty array initially)
curl http://localhost:3000/api/data
```

### 2. Test Frontend
- Open browser to http://localhost:5173
- You should see the Oracle Database Learning Module interface
- Try creating a new item using the Create tab

### 3. Add Sample Data (Optional)

Using curl:
```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "description": "This is a test",
    "category": "Test",
    "price": 99.99,
    "quantity": 10
  }'
```

## Directory Structure

After setup, your structure should look like:

```
Oracle Database/
├── backend/
│   ├── node_modules/        (created after npm install)
│   ├── src/
│   │   ├── server.js
│   │   ├── database.js
│   │   └── routes.js
│   ├── .env                 (you created this)
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── node_modules/        (created after npm install)
│   ├── dist/                (created after build)
│   ├── src/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── api.js
│   │   └── style.css
│   ├── .env                 (you created this)
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
├── docs/
│   └── (documentation files)
└── examples/
    ├── sample_data.json
    └── query_examples.txt
```

## Building for Production

### Backend
```bash
cd backend
npm run build  # Just a validation step for Node.js
npm start      # Run in production mode
```

### Frontend
```bash
cd frontend
npm run build  # Creates optimized build in dist/
npm run preview # Preview production build
```

The frontend build creates static files in `dist/` that can be served by any web server.

## Troubleshooting

### Oracle Connection Refused

```bash
# Verify Oracle is running
# Docker:
docker ps | grep oracle

# Native:
lsnrctl status

# Check if port 1521 is accessible
telnet localhost 1521
```

### ORA-12541: TNS:no listener
```bash
# Start Oracle listener
lsnrctl start
```

### ORA-01017: Invalid username/password
```bash
# Verify credentials in .env
# Default: system/oracle
# Reset password (SQL*Plus as SYSDBA):
sqlplus / as sysdba
ALTER USER system IDENTIFIED BY oracle;
```

### npm install Fails

```bash
# Clear npm cache
npm cache clean --force

# Delete lock file and node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### CORS Errors

Make sure:
1. Backend CORS_ORIGIN matches frontend URL
2. Frontend VITE_API_URL points to backend
3. Both servers are running

### Module Not Found Errors

```bash
# Make sure you're in the correct directory
pwd

# Reinstall dependencies
npm install
```

## Oracle XE Memory Configuration

For development, Oracle XE uses about 2GB RAM. If you need to adjust:

```sql
-- Check current SGA/PGA settings
SHOW PARAMETER sga_target;
SHOW PARAMETER pga_aggregate_target;

-- Adjust if needed (as SYSDBA)
ALTER SYSTEM SET sga_target = 1G SCOPE = SPFILE;
ALTER SYSTEM SET pga_aggregate_target = 512M SCOPE = SPFILE;
```

## Next Steps

After successful setup:
1. Read [API_DOCS.md](API_DOCS.md) for API endpoint details
2. Check [DATABASE_INFO.md](DATABASE_INFO.md) for Oracle Database information
3. Review [FEATURES.md](FEATURES.md) for available features
4. Try the examples in [examples/query_examples.txt](../examples/query_examples.txt)

## Getting Help

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Review console logs for error messages
- Ensure all prerequisites are met
- Verify all environment variables are set correctly

## Summary Checklist

- [ ] Node.js 18+ installed
- [ ] Oracle Database (XE) running on port 1521
- [ ] Backend dependencies installed
- [ ] Backend .env file created with Oracle credentials
- [ ] Frontend dependencies installed
- [ ] Frontend .env file created
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can access frontend UI
- [ ] Can create/read/update/delete items
- [ ] API health check returns OK

Congratulations! Your Oracle Database Learning Module is ready to use! 🎉
