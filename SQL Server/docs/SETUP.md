# SQL Server Learning Module - Setup Guide

Complete step-by-step setup instructions for the SQL Server learning module.

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **SQL Server**: Express, Standard, or Enterprise edition
- **Text Editor**: VS Code, Sublime Text, or your preferred editor

### Optional Tools
- **SQL Server Management Studio (SSMS)**: GUI tool for SQL Server
- **Azure Data Studio**: Cross-platform database tool

### Check Prerequisites
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
```

### SQL Server Installation

#### Windows
1. Download SQL Server Express from https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Run the installer and choose "Basic" installation
3. Enable TCP/IP protocol in SQL Server Configuration Manager
4. Set port to 1433

#### Linux (Ubuntu/Debian)
```bash
# Import Microsoft GPG key
curl https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add -

# Add repository
sudo add-apt-repository "$(curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/mssql-server-2022.list)"

# Install SQL Server
sudo apt-get update
sudo apt-get install -y mssql-server

# Configure SQL Server
sudo /opt/mssql/bin/mssql-conf setup

# Verify installation
systemctl status mssql-server
```

#### Docker (Recommended for Development)
```bash
docker run -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd" \
  -p 1433:1433 \
  --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### Create the Database
```sql
-- Connect to SQL Server and run:
CREATE DATABASE learning_db;
```

Or via command line:
```bash
# Using sqlcmd
sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "CREATE DATABASE learning_db"
```

## Installation Steps

### 1. Navigate to SQL Server Folder
```bash
cd "SQL Server"
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your SQL Server connection details
```

#### Backend Environment Variables (.env)
```env
PORT=3000
NODE_ENV=development
MSSQL_SERVER=localhost
MSSQL_PORT=1433
MSSQL_USER=sa
MSSQL_PASSWORD=YourStrong@Passw0rd
MSSQL_DATABASE=learning_db
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
🚀 SQL Server Backend Server running on http://localhost:3000
📊 Database: SQL Server
🔗 CORS enabled for: http://localhost:5173
✓ Connected to SQL Server
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

# Then from SQL Server root directory
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
- You should see the SQL Server Learning Module interface
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
SQL Server/
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

### SQL Server Connection Failed

**Check SQL Server is running:**
```bash
# Linux
systemctl status mssql-server

# Docker
docker ps | grep sqlserver

# Windows
# Open Services and check "SQL Server (MSSQLSERVER)"
```

**Enable TCP/IP Protocol:**
1. Open SQL Server Configuration Manager
2. Navigate to SQL Server Network Configuration > Protocols
3. Enable TCP/IP
4. Set port to 1433
5. Restart SQL Server service

### Port Already in Use

**Backend (Port 3000):**
```bash
lsof -i :3000
kill -9 <PID>
```

**Frontend (Port 5173):**
```bash
lsof -i :5173
kill -9 <PID>
```

### npm install Fails

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

Make sure:
1. Backend CORS_ORIGIN matches frontend URL
2. Frontend VITE_API_URL points to backend
3. Both servers are running

## Next Steps

After successful setup:
1. Read [API_DOCS.md](API_DOCS.md) for API endpoint details
2. Check [DATABASE_INFO.md](DATABASE_INFO.md) for SQL Server-specific information
3. Review [FEATURES.md](FEATURES.md) for available features
4. Try the examples in [examples/query_examples.txt](../examples/query_examples.txt)

## Summary Checklist

- [ ] Node.js 18+ installed
- [ ] SQL Server installed and running
- [ ] Database `learning_db` created
- [ ] Backend dependencies installed
- [ ] Backend .env file created with correct credentials
- [ ] Frontend dependencies installed
- [ ] Frontend .env file created
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can access frontend UI
- [ ] Can create/read/update/delete items
- [ ] API health check returns OK

Congratulations! Your SQL Server Learning Module is ready to use! 🎉
