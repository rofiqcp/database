# Oracle Database Learning Module - Setup Guide

Complete step-by-step setup instructions for the Oracle Database learning module.

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Oracle Database**: XE, SE, or EE (local installation or Oracle Cloud)
- **Oracle Instant Client**: Required if Oracle DB is remote
- **Text Editor**: VS Code, Sublime Text, or your preferred editor

### Check Prerequisites
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
sqlplus -v      # Should show SQL*Plus version (optional)
```

## Oracle Database Installation

### Option 1: Oracle Database XE (Express Edition - Free)

#### Ubuntu/Debian
```bash
# Download Oracle XE from:
# https://www.oracle.com/database/technologies/xe-downloads.html

# Install prerequisites
sudo apt-get install -y libaio1

# Install Oracle XE RPM (after converting to deb or using alien)
sudo alien -i oracle-database-xe-21c-1.0-1.ol8.x86_64.rpm

# Configure Oracle XE
sudo /etc/init.d/oracle-xe-21c configure

# Set environment variables
export ORACLE_HOME=/opt/oracle/product/21c/dbhomeXE
export PATH=$ORACLE_HOME/bin:$PATH
export ORACLE_SID=XE
```

#### Windows
1. Download Oracle Database XE from: https://www.oracle.com/database/technologies/xe-downloads.html
2. Run the installer
3. Set the system password during installation
4. Oracle Database service starts automatically

#### Docker (Recommended for Development)
```bash
# Pull Oracle XE Docker image
docker pull gvenzl/oracle-xe:21-slim

# Run Oracle XE container
docker run -d \
  --name oracle-xe \
  -p 1521:1521 \
  -e ORACLE_PASSWORD=oracle \
  gvenzl/oracle-xe:21-slim

# Wait for container to be ready (may take 1-2 minutes)
docker logs -f oracle-xe
```

#### Verify Installation
```bash
# Connect to Oracle Database
sqlplus system/oracle@localhost:1521/XEPDB1

# Check status
SELECT status FROM v$instance;
```

### Option 2: Oracle Cloud (Always Free Tier)

1. Create account at https://cloud.oracle.com
2. Create an Autonomous Database (Always Free)
3. Download the wallet file
4. Configure connection using wallet
5. Use the connection string from your cloud console

## Installation Steps

### 1. Clone/Download the Repository
```bash
# If using git
cd OracleDB

# Or navigate to the OracleDB folder if already downloaded
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your Oracle connection settings
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
✓ Database indexes created successfully
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

You can also use package managers that support concurrent execution:

```bash
# Using concurrently (if installed globally)
npm install -g concurrently

# Then from OracleDB root directory
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

## Accessing the Application

1. **Frontend UI**: http://localhost:5173
2. **Backend API**: http://localhost:3000/api
3. **Health Check**: http://localhost:3000/health

## Testing the Setup

### 1. Test Oracle Database Connection
```bash
# Check if Oracle Database is running
sqlplus system/oracle@localhost:1521/XEPDB1

# In SQL*Plus, you should see a prompt like:
# SQL>

# Check database status
SELECT status FROM v$instance;

# List tables
SELECT table_name FROM user_tables;

# Exit
EXIT;
```

### 2. Test Backend API
```bash
# Health check
curl http://localhost:3000/health

# Get all items (should return empty array initially)
curl http://localhost:3000/api/data
```

### 3. Test Frontend
- Open browser to http://localhost:5173
- You should see the Oracle Database Learning Module interface
- Try creating a new item using the Create tab

### 4. Add Sample Data (Optional)

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

Or use the sample_data.json file (you'll need to send each item individually via the API or frontend).

## Directory Structure

After setup, your structure should look like:

```
OracleDB/
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
npm run build  # Validation step for Node.js
npm start      # Run in production mode
```

### Frontend
```bash
cd frontend
npm run build  # Creates optimized build in dist/
npm run preview # Preview production build
```

The frontend build creates static files in `dist/` that can be served by any web server.

## Oracle Database Connection Troubleshooting

### Oracle Database Not Running

```bash
# Check if Oracle is running
lsnrctl status

# Start Oracle Listener
lsnrctl start

# Start Oracle Database (Linux)
sqlplus / as sysdba
SQL> STARTUP;

# Docker
docker start oracle-xe
```

### Connection String Issues

```bash
# Test connection string
sqlplus system/oracle@localhost:1521/XEPDB1

# If using SID instead of service name
sqlplus system/oracle@localhost:1521/XE

# Test with tnsping
tnsping XEPDB1
```

## Troubleshooting

### Port Already in Use

**Backend (Port 3000):**
```bash
# Find process
lsof -i :3000
# Kill process
kill -9 <PID>

# Or change port in backend/.env
PORT=3001
```

**Frontend (Port 5173):**
```bash
# Find process
lsof -i :5173
# Kill process
kill -9 <PID>

# Or use different port
npm run dev -- --port 5174
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

### Oracle Database Connection Fails

```bash
# Verify Oracle is running
lsnrctl status

# Check .env file has correct connection settings
cat backend/.env

# Restart backend if you changed .env
npm run dev
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

## Next Steps

After successful setup:
1. Read [API_DOCS.md](API_DOCS.md) for API endpoint details
2. Check [DATABASE_INFO.md](DATABASE_INFO.md) for Oracle Database-specific information
3. Review [FEATURES.md](FEATURES.md) for available features
4. Try the examples in [examples/query_examples.txt](../examples/query_examples.txt)

## Getting Help

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Review console logs for error messages
- Ensure all prerequisites are met
- Verify all environment variables are set correctly
- Check Oracle Database is running before starting backend

## Summary Checklist

- [ ] Node.js 18+ installed
- [ ] Oracle Database installed (XE, Docker, or Cloud)
- [ ] Backend dependencies installed
- [ ] Backend .env file created with Oracle connection settings
- [ ] Frontend dependencies installed
- [ ] Frontend .env file created
- [ ] Oracle Database running (local or verified on cloud)
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can access frontend UI
- [ ] Can create/read/update/delete items
- [ ] API health check returns OK

Congratulations! Your Oracle Database Learning Module is ready to use! 🎉
