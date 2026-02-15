# SQL Server Learning Module - Setup Guide

Complete step-by-step setup instructions for the SQL Server learning module.

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **SQL Server**: Version 2019 or higher (local installation or Azure SQL Database)
- **Text Editor**: VS Code, Sublime Text, or your preferred editor

### Check Prerequisites
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
sqlcmd -?       # Should show sqlcmd help (optional)
```

## SQL Server Installation

### Option 1: Local SQL Server Installation

#### Windows
1. Download SQL Server from: https://www.microsoft.com/en-us/sql-server/sql-server-downloads
2. Choose "Developer" edition (free for development)
3. Run the installer and follow the wizard
4. Install SQL Server Management Studio (SSMS): https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms

#### Ubuntu/Debian (Linux)
```bash
# Import the public repository GPG keys
curl https://packages.microsoft.com/keys/microsoft.asc | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc

# Register the SQL Server Ubuntu repository
sudo add-apt-repository "$(wget -qO- https://packages.microsoft.com/config/ubuntu/20.04/mssql-server-2022.list)"

# Install SQL Server
sudo apt-get update
sudo apt-get install -y mssql-server

# Run setup
sudo /opt/mssql/bin/mssql-conf setup

# Verify installation
systemctl status mssql-server
```

#### macOS (using Docker)
```bash
# Pull SQL Server image
docker pull mcr.microsoft.com/mssql/server:2022-latest

# Run SQL Server container
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong!Password" \
  -p 1433:1433 --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest

# Verify container is running
docker ps
```

#### Docker (All platforms)
```bash
# Pull and run SQL Server
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong!Password" \
  -p 1433:1433 --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

#### Verify Installation
```bash
# Connect to SQL Server using sqlcmd
sqlcmd -S localhost -U sa -P "YourStrong!Password" -Q "SELECT @@VERSION"
```

### Option 2: Azure SQL Database (Cloud)

1. Create account at https://portal.azure.com
2. Create a new SQL Database resource
3. Get your connection details from the Azure portal
4. Use the connection details in your .env file

## Installation Steps

### 1. Clone/Download the Repository
```bash
# If using git
cd SQLServer

# Or navigate to the SQLServer folder if already downloaded
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your SQL Server connection details
```

#### Backend Environment Variables (.env)
```env
PORT=3000
NODE_ENV=development
MSSQL_USER=sa
MSSQL_PASSWORD=YourStrong!Password
MSSQL_SERVER=localhost
MSSQL_DATABASE=learning_db
MSSQL_PORT=1433
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
✓ Connected to SQL Server database
✓ Database table and indexes created successfully
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

# Then from SQLServer root directory
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

## Accessing the Application

1. **Frontend UI**: http://localhost:5173
2. **Backend API**: http://localhost:3000/api
3. **Health Check**: http://localhost:3000/health

## Testing the Setup

### 1. Test SQL Server Connection
```bash
# Check if SQL Server is running
sqlcmd -S localhost -U sa -P "YourStrong!Password" -Q "SELECT 1"

# Or using Docker
docker exec -it sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong!Password" -Q "SELECT @@VERSION"
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
- You should see the SQL Server Learning Module interface
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

## Directory Structure

After setup, your structure should look like:

```
SQLServer/
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

## SQL Server Connection Troubleshooting

### SQL Server Not Running

```bash
# Check if SQL Server is running (Linux)
systemctl status mssql-server

# Start SQL Server (Linux)
sudo systemctl start mssql-server

# Check Docker container
docker ps | grep sqlserver

# Start Docker container
docker start sqlserver
```

### Connection String Issues

```bash
# Test connection with sqlcmd
sqlcmd -S localhost -U sa -P "YourStrong!Password"

# Test with specific port
sqlcmd -S localhost,1433 -U sa -P "YourStrong!Password"

# If using Windows, try IP address instead of localhost
sqlcmd -S 127.0.0.1 -U sa -P "YourStrong!Password"
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

### SQL Server Connection Fails

```bash
# Verify SQL Server is running
sqlcmd -S localhost -U sa -P "YourStrong!Password" -Q "SELECT 1"

# Check .env file has correct connection details
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
2. Check [DATABASE_INFO.md](DATABASE_INFO.md) for SQL Server-specific information
3. Review [FEATURES.md](FEATURES.md) for available features
4. Try the examples in [examples/query_examples.txt](../examples/query_examples.txt)

## Getting Help

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Review console logs for error messages
- Ensure all prerequisites are met
- Verify all environment variables are set correctly
- Check SQL Server is running before starting backend

## Summary Checklist

- [ ] Node.js 18+ installed
- [ ] SQL Server 2019+ installed or Azure SQL Database configured
- [ ] Backend dependencies installed
- [ ] Backend .env file created with SQL Server connection details
- [ ] Frontend dependencies installed
- [ ] Frontend .env file created
- [ ] SQL Server running (local, Docker, or Azure)
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can access frontend UI
- [ ] Can create/read/update/delete items
- [ ] API health check returns OK

Congratulations! Your SQL Server Learning Module is ready to use! 🎉
