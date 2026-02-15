# HBase Learning Module - Setup Guide

Complete step-by-step setup instructions for the HBase learning module.

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Java**: JDK 8 or 11 (required by HBase)
- **HBase**: Version 2.4+ with REST API enabled
- **Text Editor**: VS Code, Sublime Text, or your preferred editor

### Check Prerequisites
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
java -version   # Should be 1.8.x or 11.x
hbase version   # Should be 2.4.x or higher
```

## HBase Installation

### Option 1: Standalone Mode (Recommended for Learning)

#### macOS / Linux
```bash
# Download HBase
wget https://downloads.apache.org/hbase/2.5.7/hbase-2.5.7-bin.tar.gz
tar xzf hbase-2.5.7-bin.tar.gz
cd hbase-2.5.7

# Set JAVA_HOME in conf/hbase-env.sh
export JAVA_HOME=$(/usr/libexec/java_home)

# Start HBase in standalone mode
bin/start-hbase.sh

# Start REST server (required for this module)
bin/hbase rest start -p 8080

# Verify installation
curl http://localhost:8080/status/cluster
```

#### Windows
1. Download HBase from: https://hbase.apache.org/downloads.html
2. Extract the archive
3. Set `JAVA_HOME` environment variable
4. Edit `conf/hbase-site.xml` for Windows paths
5. Run `bin\start-hbase.cmd`
6. Run `bin\hbase rest start -p 8080`

#### Verify Installation
```bash
# Connect to HBase Shell
hbase shell

# Check status
status

# Exit shell
exit
```

### Option 2: Docker (Quick Start)

```bash
# Run HBase with Docker
docker run -d --name hbase \
  -p 8080:8080 \
  -p 9090:9090 \
  -p 16010:16010 \
  -p 16020:16020 \
  harisekhon/hbase

# Verify REST API
curl http://localhost:8080/status/cluster
```

### Option 3: Pseudo-Distributed Mode

```bash
# Edit conf/hbase-site.xml
cat > conf/hbase-site.xml << 'EOF'
<configuration>
  <property>
    <name>hbase.cluster.distributed</name>
    <value>true</value>
  </property>
  <property>
    <name>hbase.rootdir</name>
    <value>hdfs://localhost:9000/hbase</value>
  </property>
  <property>
    <name>hbase.zookeeper.property.dataDir</name>
    <value>/tmp/hbase-zookeeper</value>
  </property>
</configuration>
EOF

# Start HDFS first, then HBase
start-dfs.sh
bin/start-hbase.sh
bin/hbase rest start -p 8080
```

## Installation Steps

### 1. Clone/Download the Repository
```bash
# Navigate to the HBase folder
cd HBase
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your HBase connection
```

#### Backend Environment Variables (.env)
```env
PORT=3000
NODE_ENV=development
HBASE_HOST=localhost
HBASE_PORT=8080
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

#### Terminal 1 - HBase REST Server
```bash
# Start HBase (if not already running)
$HBASE_HOME/bin/start-hbase.sh

# Start REST server
$HBASE_HOME/bin/hbase rest start -p 8080
```

#### Terminal 2 - Backend
```bash
cd backend
npm run dev
```
Expected output:
```
🚀 HBase Backend Server running on http://localhost:3000
📊 Database: HBase
🔗 CORS enabled for: http://localhost:5173
✓ Connected to HBase REST API at localhost:8080
```

#### Terminal 3 - Frontend
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

# Then from HBase root directory
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

## Accessing the Application

1. **Frontend UI**: http://localhost:5173
2. **Backend API**: http://localhost:3000/api
3. **Health Check**: http://localhost:3000/health
4. **HBase Master UI**: http://localhost:16010

## Testing the Setup

### 1. Test HBase Connection
```bash
# Check if HBase REST API is running
curl http://localhost:8080/status/cluster

# Using HBase shell
hbase shell

# In hbase shell:
status
list
exit
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
- You should see the HBase Learning Module interface
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
HBase/
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

## HBase Connection Troubleshooting

### HBase REST Server Not Running

```bash
# Check if HBase processes are running
ps aux | grep hbase

# Start HBase
$HBASE_HOME/bin/start-hbase.sh

# Start REST server
$HBASE_HOME/bin/hbase rest start -p 8080

# Verify REST API
curl http://localhost:8080/status/cluster
```

### Connection String Issues

```bash
# Test REST API locally
curl http://localhost:8080/status/cluster

# If using Docker, check container
docker ps | grep hbase
docker logs hbase
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
2. Check [DATABASE_INFO.md](DATABASE_INFO.md) for HBase-specific information
3. Review [FEATURES.md](FEATURES.md) for available features
4. Try the examples in [examples/query_examples.txt](../examples/query_examples.txt)

## Getting Help

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Review console logs for error messages
- Ensure all prerequisites are met
- Verify all environment variables are set correctly
- Check HBase REST server is running before starting backend

## Summary Checklist

- [ ] Java JDK 8 or 11 installed
- [ ] Node.js 18+ installed
- [ ] HBase 2.4+ installed
- [ ] HBase REST server running on port 8080
- [ ] Backend dependencies installed
- [ ] Backend .env file created
- [ ] Frontend dependencies installed
- [ ] Frontend .env file created
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can access frontend UI
- [ ] Can create/read/update/delete items
- [ ] API health check returns OK

Congratulations! Your HBase Learning Module is ready to use! 🎉
