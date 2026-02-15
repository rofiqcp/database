# HBase Learning Module - Setup Guide

Complete step-by-step setup instructions for the HBase learning module.

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Text Editor**: VS Code, Sublime Text, or your preferred editor

### Check Prerequisites
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
```

### Optional: Real HBase Installation
For production use, HBase requires:
- Java 8 or 11
- Hadoop (HDFS)
- ZooKeeper
- Minimum 2GB RAM (development)
- Recommended 16-64GB RAM (production)

This learning module uses an in-memory emulator, so Hadoop/HBase installation is **not required**.

## Installation Steps

### 1. Clone/Download the Repository
```bash
# If using git
cd HBase

# Or navigate to the HBase folder if already downloaded
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
# Default values work fine for local development
```

#### Backend Environment Variables (.env)
```env
PORT=3000
NODE_ENV=development
HBASE_REST_URL=http://localhost:8080
HBASE_TABLE=items
HBASE_NAMESPACE=learning
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
✓ Connected to HBase (Learning Emulator)
✓ Database initialized successfully
🚀 HBase Backend Server running on http://localhost:3000
📊 Database: Apache HBase
🔗 CORS enabled for: http://localhost:5173
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

# Then from HBase root directory
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
- You should see the HBase Learning Module interface
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

Or use the sample_data.json file (you'll need to send each item individually via the API or frontend).

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

## Connecting to Real HBase

To connect to a real HBase cluster, modify `backend/src/database.js`:

```javascript
const axios = require('axios');

const HBASE_REST_URL = process.env.HBASE_REST_URL || 'http://localhost:8080';

// Replace emulator calls with REST API calls:
// GET row:    axios.get(`${HBASE_REST_URL}/items/rowKey`)
// PUT cell:   axios.put(`${HBASE_REST_URL}/items/rowKey/cf:qualifier`, data)
// SCAN:       axios.get(`${HBASE_REST_URL}/items/*`)
// DELETE row: axios.delete(`${HBASE_REST_URL}/items/rowKey`)
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

## Summary Checklist

- [ ] Node.js 18+ installed
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
