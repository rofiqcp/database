# MongoDB Learning Module - Setup Guide

Complete step-by-step setup instructions for the MongoDB learning module.

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **MongoDB**: Version 5.0 or higher (local installation or MongoDB Atlas account)
- **Text Editor**: VS Code, Sublime Text, or your preferred editor

### Check Prerequisites
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
mongosh --version  # Should be 1.x or higher (optional)
```

## MongoDB Installation

### Option 1: Local MongoDB Installation

#### macOS (using Homebrew)
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify installation
mongosh --eval "db.adminCommand('ping')"
```

#### Ubuntu/Debian
```bash
# Add MongoDB repository
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
```

#### Windows
1. Download MongoDB from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Install MongoDB as a Service"
4. Complete installation
5. MongoDB service should start automatically

#### Verify Installation
```bash
# Connect to MongoDB
mongosh

# Check status
db.adminCommand('ping')
```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string (looks like):
```
mongodb+srv://username:password@cluster0.mongodb.net/dbname
```
4. Use this connection string in your .env file

## Installation Steps

### 1. Clone/Download the Repository
```bash
# If using git
cd MongoDB

# Or navigate to the MongoDB folder if already downloaded
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your MongoDB connection string
```

#### Backend Environment Variables (.env)
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mydb
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/dbname
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
🚀 MongoDB Backend Server running on http://localhost:3000
📊 Database: MongoDB
🔗 CORS enabled for: http://localhost:5173
✓ Database connected successfully
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

# Then from MongoDB root directory
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

## Accessing the Application

1. **Frontend UI**: http://localhost:5173
2. **Backend API**: http://localhost:3000/api
3. **Health Check**: http://localhost:3000/health

## Testing the Setup

### 1. Test MongoDB Connection
```bash
# Check if MongoDB is running
mongosh

# In mongosh, you should see a prompt like:
# test>

# Create a test database
use testdb

# Create a test collection
db.test.insertOne({ message: "Hello MongoDB" })

# Query the data
db.test.find()

# Clean up
db.test.deleteOne({ message: "Hello MongoDB" })
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
- You should see the MongoDB Learning Module interface
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
MongoDB/
├── backend/
│   ├── node_modules/        (created after npm install)
│   ├── src/
│   │   ├── server.js
│   │   ├── models/
│   │   │   └── Item.js      (MongoDB schema)
│   │   ├── routes.js
│   │   └── database.js
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
    └── query_examples.js
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

## MongoDB Connection Troubleshooting

### MongoDB Server Not Running

```bash
# Check if mongod is running
ps aux | grep mongod

# Start MongoDB service
# On macOS with Homebrew:
brew services start mongodb-community

# On Ubuntu/Debian:
sudo systemctl start mongod

# On Windows:
# Should be running as a service, or check Services app
```

### Connection String Issues

```bash
# Test connection string locally
mongosh "mongodb://localhost:27017"

# Test Atlas connection
mongosh "mongodb+srv://username:password@cluster0.mongodb.net/dbname"

# If using Windows, try IP address instead of localhost
mongosh "mongodb://127.0.0.1:27017"
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

### MongoDB Connection Fails

```bash
# Verify MongoDB is running
mongosh "mongodb://localhost:27017"

# Check .env file has correct connection string
cat backend/.env | grep MONGODB_URI

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
2. Check [DATABASE_INFO.md](DATABASE_INFO.md) for MongoDB-specific information
3. Review [FEATURES.md](FEATURES.md) for available features
4. Try the examples in [examples/query_examples.js](../examples/query_examples.js)

## Getting Help

- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- Review console logs for error messages
- Ensure all prerequisites are met
- Verify all environment variables are set correctly
- Check MongoDB is running before starting backend

## Summary Checklist

- [ ] Node.js 18+ installed
- [ ] MongoDB 5.0+ installed or MongoDB Atlas account created
- [ ] Backend dependencies installed
- [ ] Backend .env file created with MongoDB connection string
- [ ] Frontend dependencies installed
- [ ] Frontend .env file created
- [ ] MongoDB server running (local or verified on Atlas)
- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can access frontend UI
- [ ] Can create/read/update/delete items
- [ ] API health check returns OK

Congratulations! Your MongoDB Learning Module is ready to use! 🎉
