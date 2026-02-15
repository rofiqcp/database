# Cassandra Backend

Node.js + Express.js backend with Cassandra database for the Cassandra Learning Module.

## 📋 Overview

RESTful API backend built with Express.js and Cassandra. Provides full CRUD operations with input validation, error handling, and comprehensive API responses.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: Apache Cassandra (cassandra-driver)
- **Validation**: Validator library
- **Environment**: Dotenv
- **Dev Server**: Nodemon

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js      # Express app initialization & startup
│   ├── database.js    # Cassandra connection & configuration
│   └── routes.js      # API route handlers
├── package.json       # Dependencies & scripts
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- Apache Cassandra installed and running
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
CASSANDRA_CONTACT_POINTS=localhost
CASSANDRA_LOCAL_DATACENTER=datacenter1
CASSANDRA_KEYSPACE=learning_db
CORS_ORIGIN=http://localhost:5173
```

**Cassandra Connection Options:**

Local Cassandra:
```env
CASSANDRA_CONTACT_POINTS=localhost
CASSANDRA_LOCAL_DATACENTER=datacenter1
```

Multiple nodes:
```env
CASSANDRA_CONTACT_POINTS=node1,node2,node3
CASSANDRA_LOCAL_DATACENTER=datacenter1
```

Cassandra with authentication:
```env
CASSANDRA_CONTACT_POINTS=localhost
CASSANDRA_LOCAL_DATACENTER=datacenter1
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
Response: { status: 'OK', database: 'Cassandra', timestamp: '...' }
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

### Cassandra Table Schema

```cql
CREATE TABLE items (
  id uuid PRIMARY KEY,
  name text,
  description text,
  category text,
  price decimal,
  quantity int,
  created_at timestamp,
  updated_at timestamp
);
```

### Indexes Created

- `idx_items_category` - Secondary index on category field

### Cassandra Operations Used

- `SELECT` - Query rows
- `INSERT INTO` - Create new row
- `UPDATE` - Update existing row
- `DELETE` - Delete row
- `CREATE TABLE` - Create table schema
- `CREATE INDEX` - Create secondary index

## ✅ Input Validation

All inputs are validated using the `validator` library:

- **Name**: Required, non-empty string
- **Price**: Optional positive number
- **Quantity**: Optional positive integer
- **ID**: Valid UUID format

## 🔒 Security Features

- **Input Validation**: All inputs validated before processing
- **Error Handling**: Comprehensive error handling with meaningful messages
- **CORS Protection**: Configurable CORS origins
- **UUID Validation**: Prevents invalid ID injection
- **Prepared Statements**: All CQL queries use prepared statements
- **Environment Variables**: Sensitive data in .env files

## 📝 Code Examples

### Query Items from Cassandra

```javascript
const { getClient } = require('./database');

async function getAllItems() {
  const client = getClient();
  const result = await client.execute(
    'SELECT * FROM items',
    [],
    { prepare: true }
  );
  return result.rows;
}
```

### Create Item

```javascript
async function createItem(data) {
  const client = getClient();
  const id = cassandra.types.Uuid.random();
  const now = new Date();
  
  await client.execute(
    'INSERT INTO items (id, name, description, category, price, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.name, data.description, data.category, data.price, data.quantity, now, now],
    { prepare: true }
  );
  return id;
}
```

### Search with Filters

```javascript
async function searchItems(category) {
  const client = getClient();
  
  // Use secondary index for category filter
  const result = await client.execute(
    'SELECT * FROM items WHERE category = ?',
    [category],
    { prepare: true }
  );
  
  return result.rows;
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

### CQL Shell Testing

```bash
# Connect to Cassandra
cqlsh

# Use the keyspace
USE learning_db;

# View all items
SELECT * FROM items;

# Find by category
SELECT * FROM items WHERE category = 'Electronics';

# Count items
SELECT COUNT(*) FROM items;

# Describe table
DESCRIBE TABLE items;
```

## 🐛 Debugging

View Cassandra logs:
```bash
# Check Cassandra process
ps aux | grep cassandra

# View Cassandra logs
tail -f /var/log/cassandra/system.log
```

## 📦 Dependencies

### Production Dependencies
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `cassandra-driver` - DataStax Cassandra Node.js driver
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
- `CASSANDRA_CONTACT_POINTS` - Production Cassandra nodes
- `CASSANDRA_LOCAL_DATACENTER` - Data center name
- `CASSANDRA_KEYSPACE` - Keyspace name
- `CORS_ORIGIN` - Production frontend URL

### DataStax Astra (Cloud)
For production, consider DataStax Astra:
1. Create database at https://astra.datastax.com
2. Download secure connect bundle
3. Update connection configuration
4. Configure authentication

### Process Management
Use PM2 for production:
```bash
npm install -g pm2
pm2 start src/server.js --name cassandra-backend
pm2 save
pm2 startup
```

## 📚 Additional Resources

- [Apache Cassandra Documentation](https://cassandra.apache.org/doc/latest/)
- [DataStax Node.js Driver](https://docs.datastax.com/en/developer/nodejs-driver/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [DataStax Astra](https://astra.datastax.com/)

## 🤝 Contributing

This is a learning module. Feel free to:
- Add new features
- Improve error handling
- Add tests
- Enhance documentation

## 📄 License

MIT License - Use freely for learning and commercial purposes.

---

Built as part of the Cassandra Learning Module 🎓
