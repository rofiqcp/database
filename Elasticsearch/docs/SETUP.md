# Elasticsearch Learning Module - Setup Guide

Complete step-by-step setup instructions for the Elasticsearch learning module.

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Elasticsearch**: Version 8.x running on localhost:9200
- **Text Editor**: VS Code, Sublime Text, or your preferred editor

### Check Prerequisites
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
curl http://localhost:9200  # Should return Elasticsearch cluster info
```

### Installing Elasticsearch

#### Option 1: Docker (Recommended)
```bash
docker run -d --name elasticsearch \
  -p 9200:9200 -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

#### Option 2: Download from Elastic
Download from https://www.elastic.co/downloads/elasticsearch and follow the installation guide.

#### Option 3: Homebrew (macOS)
```bash
brew tap elastic/tap
brew install elastic/tap/elasticsearch-full
elasticsearch
```

## Installation Steps

### 1. Navigate to the Elasticsearch Folder
```bash
cd Elasticsearch
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
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX=items
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
🚀 Elasticsearch Backend Server running on http://localhost:3000
📊 Database: Elasticsearch
🔗 CORS enabled for: http://localhost:5173
✓ Elasticsearch index "items" created successfully
✓ Connected to Elasticsearch
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
npm install -g concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

## Accessing the Application

1. **Frontend UI**: http://localhost:5173
2. **Backend API**: http://localhost:3000/api
3. **Health Check**: http://localhost:3000/health
4. **Elasticsearch**: http://localhost:9200

## Testing the Setup

### 1. Test Elasticsearch Connection
```bash
curl http://localhost:9200
curl http://localhost:9200/_cat/indices?v
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
- You should see the Elasticsearch Learning Module interface
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
Elasticsearch/
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

### Elasticsearch Not Running

```bash
# Check if Elasticsearch is running
curl http://localhost:9200

# If using Docker, check container
docker ps | grep elasticsearch
docker start elasticsearch
```

### Port Already in Use

**Backend (Port 3000):**
```bash
lsof -i :3000
kill -9 <PID>

# Or change port in backend/.env
PORT=3001
```

**Frontend (Port 5173):**
```bash
lsof -i :5173
kill -9 <PID>

npm run dev -- --port 5174
```

### npm install Fails

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Index Not Created

The Elasticsearch index is automatically created on first backend start. If issues occur:

```bash
# Manually create the index
curl -X PUT http://localhost:9200/items

# Delete and let it recreate
curl -X DELETE http://localhost:9200/items
cd backend && npm run dev
```

### CORS Errors

Make sure:
1. Backend CORS_ORIGIN matches frontend URL
2. Frontend VITE_API_URL points to backend
3. Both servers are running

### Module Not Found Errors

```bash
pwd  # Make sure you're in the correct directory
npm install
```

## Next Steps

After successful setup:
1. Read [API_DOCS.md](API_DOCS.md) for API endpoint details
2. Check [DATABASE_INFO.md](DATABASE_INFO.md) for Elasticsearch-specific information
3. Review [FEATURES.md](FEATURES.md) for available features
4. Try the examples in [examples/query_examples.txt](../examples/query_examples.txt)

## Getting Help

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Review console logs for error messages
- Ensure all prerequisites are met
- Verify all environment variables are set correctly

## Summary Checklist

- [ ] Node.js 18+ installed
- [ ] Elasticsearch 8.x running on localhost:9200
- [ ] Backend dependencies installed
- [ ] Backend .env file created
- [ ] Frontend dependencies installed
- [ ] Frontend .env file created
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can access frontend UI
- [ ] Can create/read/update/delete items
- [ ] API health check returns OK

Congratulations! Your Elasticsearch Learning Module is ready to use! 🎉
