# HBase Backend

Node.js + Express.js backend with HBase database for the HBase Learning Module.

## 📋 Overview

RESTful API backend built with Express.js and HBase. Provides full CRUD operations with input validation, error handling, and comprehensive API responses.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: HBase (via REST API)
- **Validation**: Validator library
- **ID Generation**: UUID v4
- **Environment**: Dotenv
- **Dev Server**: Nodemon

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js      # Express app initialization & startup
│   ├── database.js    # HBase connection & configuration
│   └── routes.js      # API route handlers
├── package.json       # Dependencies & scripts
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- HBase installed and running with REST API enabled
- npm package manager

### Installation

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Configuration

Edit `.env` file:

```env
PORT=3000
NODE_ENV=development
HBASE_HOST=localhost
HBASE_PORT=8080
CORS_ORIGIN=http://localhost:5173
```

**HBase Connection Options:**

Local HBase REST API:
```env
HBASE_HOST=localhost
HBASE_PORT=8080
```

Remote HBase:
```env
HBASE_HOST=your-hbase-server.example.com
HBASE_PORT=8080
```

### Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

### Run Production Server

```bash
npm start
```

## 🔌 API Endpoints

### Health Check
```
GET /health
Response: { status: 'OK', database: 'HBase', timestamp: '...' }
```

### Items CRUD Operations

#### Get All Items
```
GET /api/data
Response: { success: true, data: [...], timestamp: '...' }
```

#### Get Single Item
```
GET /api/data/:id
Params: id (UUID)
Response: { success: true, data: {...}, timestamp: '...' }
```

#### Create Item
```
POST /api/data
Body: { name, description?, category?, price?, quantity? }
Response: { success: true, data: {...}, timestamp: '...' }
Status: 201
```

#### Update Item
```
PUT /api/data/:id
Params: id (UUID)
Body: { name, description?, category?, price?, quantity? }
Response: { success: true, data: {...}, timestamp: '...' }
```

#### Delete Item
```
DELETE /api/data/:id
Params: id (UUID)
Response: { success: true, data: { id, message }, timestamp: '...' }
```

#### Search/Filter Items
```
POST /api/search
Body: { query?, category?, minPrice?, maxPrice? }
Response: { success: true, data: [...], timestamp: '...' }
```

## 💾 Database Operations

### HBase Table Schema

```
Table: items
Column Family: data
Column Qualifiers:
  - data:name          (String, required)
  - data:description   (String, optional)
  - data:category      (String, optional)
  - data:price         (Number, default: 0)
  - data:quantity      (Number, default: 0)
  - data:created_at    (ISO String, auto-generated)
  - data:updated_at    (ISO String, auto-updated)

Row Key: UUID v4
```

### HBase Operations Used

- `table.scan()` - Scan all rows
- `row.get()` - Get single row by key
- `row.put()` - Create or update row
- `row.delete()` - Delete row
- `table.create()` - Create table with column families
- `table.exists()` - Check if table exists

## ✅ Input Validation

All inputs are validated using the `validator` library:

- **Name**: Required, non-empty string
- **Price**: Optional positive number
- **Quantity**: Optional positive integer
- **ID**: Valid UUID v4 format

## 🔒 Security Features

- **Input Validation**: All inputs validated before processing
- **Error Handling**: Comprehensive error handling with meaningful messages
- **CORS Protection**: Configurable CORS origins
- **UUID Validation**: Prevents invalid ID injection
- **Environment Variables**: Sensitive data in .env files

## 📝 Code Examples

### Scan All Items from HBase

```javascript
const { scanAll } = require('./database');

async function getAllItems() {
  const items = await scanAll();
  return items;
}
```

### Create Item

```javascript
const { putRow } = require('./database');
const { v4: uuidv4 } = require('uuid');

async function createItem(data) {
  const rowKey = uuidv4();
  const now = new Date().toISOString();
  
  await putRow(rowKey, {
    name: data.name,
    description: data.description || '',
    category: data.category || '',
    price: data.price || 0,
    quantity: data.quantity || 0,
    created_at: now,
    updated_at: now
  });
  
  return rowKey;
}
```

### Search with Filters

```javascript
const { scanAll } = require('./database');

async function searchItems(query, category, minPrice, maxPrice) {
  let items = await scanAll();
  
  if (query) {
    const term = query.toLowerCase();
    items = items.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    );
  }
  
  if (category) {
    items = items.filter(item => item.category === category);
  }
  
  if (minPrice !== undefined) {
    items = items.filter(item => parseFloat(item.price) >= minPrice);
  }
  
  if (maxPrice !== undefined) {
    items = items.filter(item => parseFloat(item.price) <= maxPrice);
  }
  
  return items;
}
```

## 🧪 Testing

### Manual Testing with curl

```bash
# Health check
curl http://localhost:3000/health

# Get all items
curl http://localhost:3000/api/data

# Create item
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "category": "Electronics",
    "price": 99.99,
    "quantity": 10
  }'

# Get item by ID
curl http://localhost:3000/api/data/550e8400-e29b-41d4-a716-446655440000

# Update item
curl -X PUT http://localhost:3000/api/data/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Product", "price": 149.99}'

# Delete item
curl -X DELETE http://localhost:3000/api/data/550e8400-e29b-41d4-a716-446655440000

# Search items
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "minPrice": 50, "maxPrice": 150}'
```

### HBase Shell Testing

```bash
# Connect to HBase Shell
hbase shell

# List all tables
list

# Describe table
describe 'items'

# Scan all rows
scan 'items'

# Get a specific row
get 'items', 'row-key-uuid'

# Count rows
count 'items'
```

## 🐛 Debugging

View HBase logs:
```bash
# Check HBase process
ps aux | grep hbase

# View HBase logs
tail -f $HBASE_HOME/logs/hbase-*.log

# Check REST server
curl http://localhost:8080/status/cluster
```

## 📦 Dependencies

### Production Dependencies
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `hbase` - HBase REST client for Node.js
- `validator` - Input validation library
- `uuid` - UUID generation

### Development Dependencies
- `nodemon` - Auto-restart server on file changes

## 🔧 Scripts

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "build": "echo 'No build step required for Node.js'"
  }
}
```

## 🚀 Deployment Considerations

### Environment Variables
Ensure all production environment variables are set:
- `PORT` - Server port
- `NODE_ENV=production`
- `HBASE_HOST` - HBase REST API host
- `HBASE_PORT` - HBase REST API port
- `CORS_ORIGIN` - Production frontend URL

### Process Management
Use PM2 for production:
```bash
npm install -g pm2
pm2 start src/server.js --name hbase-backend
pm2 save
pm2 startup
```

## 📚 Additional Resources

- [HBase Documentation](https://hbase.apache.org/book.html)
- [HBase REST API](https://hbase.apache.org/book.html#_rest)
- [HBase Node.js Client](https://www.npmjs.com/package/hbase)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## 🤝 Contributing

This is a learning module. Feel free to:
- Add new features
- Improve error handling
- Add tests
- Enhance documentation

## 📄 License

MIT License - Use freely for learning and commercial purposes.

---

Built as part of the HBase Learning Module 🎓
