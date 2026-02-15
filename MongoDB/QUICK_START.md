# MongoDB Learning Module - Quick Start Guide

Get up and running with the MongoDB Learning Module in minutes!

## ⚡ Prerequisites

Before starting, ensure you have:

- ✅ **Node.js 18+** - [Download](https://nodejs.org/)
- ✅ **npm** (comes with Node.js)
- ✅ **MongoDB 6+** - [Download](https://www.mongodb.com/try/download/community)
- ✅ **Text Editor** (VS Code recommended)

## 🚀 5-Minute Setup

### Step 1: Install MongoDB

#### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

#### Ubuntu/Debian
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Windows
Download installer from [MongoDB Download Center](https://www.mongodb.com/try/download/community) and follow the installation wizard.

### Step 2: Verify MongoDB

```bash
# Check MongoDB is running
mongosh --eval "db.version()"

# Should output MongoDB version (e.g., 7.0.5)
```

### Step 3: Setup Backend

```bash
cd MongoDB/backend
npm install
cp .env.example .env
```

### Step 4: Setup Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```

### Step 5: Import Sample Data (Optional)

```bash
cd ../examples
./import_data.sh

# Or manually:
mongoimport --db=learning_db --collection=items --file=sample_data.json --jsonArray
```

### Step 6: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd MongoDB/backend
npm run dev
```
✅ Backend running at http://localhost:3000

**Terminal 2 - Frontend:**
```bash
cd MongoDB/frontend
npm run dev
```
✅ Frontend running at http://localhost:5173

### Step 7: Test the Application

Open http://localhost:5173 in your browser

- ✅ View items list
- ✅ Create new items
- ✅ Edit items
- ✅ Delete items
- ✅ Search and filter
- ✅ Toggle dark mode

## 📚 Documentation

- **[README.md](README.md)** - Complete overview
- **[docs/SETUP.md](docs/SETUP.md)** - Detailed setup guide
- **[docs/API_DOCS.md](docs/API_DOCS.md)** - API documentation
- **[docs/DATABASE_INFO.md](docs/DATABASE_INFO.md)** - MongoDB information
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Troubleshooting guide

---

**Happy Coding! 🚀**
