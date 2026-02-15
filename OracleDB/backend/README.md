# Oracle Database Backend

Node.js + Express.js backend with Oracle Database for the Oracle Database Learning Module.

## 📋 Overview

RESTful API backend built with Express.js and Oracle Database. Provides full CRUD operations with input validation, error handling, and comprehensive API responses.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: Oracle Database (oracledb Node.js driver)
- **Validation**: Validator library
- **Environment**: Dotenv
- **Dev Server**: Nodemon

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js      # Express app initialization & startup
│   ├── database.js    # Oracle Database connection & configuration
│   └── routes.js      # API route handlers
├── package.json       # Dependencies & scripts
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- Oracle Database (XE, SE, or EE) installed and running
- Oracle Instant Client (if required)
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
ORACLE_USER=system
ORACLE_PASSWORD=oracle
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
CORS_ORIGIN=http://localhost:5173
```

**Oracle Database Connection Options:**

Local Oracle XE:
```env
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
```

Oracle with SID:
```env
ORACLE_CONNECT_STRING=localhost:1521/XE
```

Oracle with TNS name:
```env
ORACLE_CONNECT_STRING=myoracledb
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
Response: { status: 'OK', database: 'Oracle Database', timestamp: '...' }
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
Params: id (numeric ID)
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
Params: id (numeric ID)
Body: { name, description?, category?, price?, quantity? }
Response: { success: true, data: {...}, timestamp: '...' }
```

#### Delete Item
```
DELETE /api/data/:id
Params: id (numeric ID)
Response: { success: true, data: { id, message }, timestamp: '...' }
```

#### Search/Filter Items
```
POST /api/search
Body: { query?, category?, minPrice?, maxPrice? }
Response: { success: true, data: [...], timestamp: '...' }
```

## 💾 Database Operations

### Oracle Database Table Schema

```sql
CREATE TABLE items (
  id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR2(255) NOT NULL,
  description CLOB,
  category VARCHAR2(100),
  price NUMBER(10,2) DEFAULT 0,
  quantity NUMBER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Indexes Created

- `idx_items_category` - Index on category column
- `idx_items_name` - Index on name column

### Oracle Database Operations Used

- `SELECT` - Query rows from table
- `INSERT INTO ... RETURNING` - Create new row and return generated ID
- `UPDATE ... SET` - Update existing row
- `DELETE FROM` - Delete row
- `CREATE TABLE` - Create table structure
- `CREATE INDEX` - Create indexes
- Bind variables (`:param`) - Parameterized queries

## ✅ Input Validation

All inputs are validated using the `validator` library:

- **Name**: Required, non-empty string
- **Price**: Optional positive number
- **Quantity**: Optional positive integer
- **ID**: Valid numeric ID format

## 🔒 Security Features

- **Input Validation**: All inputs validated before processing
- **Error Handling**: Comprehensive error handling with meaningful messages
- **CORS Protection**: Configurable CORS origins
- **ID Validation**: Prevents invalid ID injection
- **Bind Variables**: Prevents SQL injection with parameterized queries
- **Environment Variables**: Sensitive data in .env files

## 📝 Code Examples

### Query Items from Oracle Database

```javascript
const oracledb = require('oracledb');
const { getConnection } = require('./database');

async function getAllItems() {
  const connection = await getConnection();
  try {
    const result = await connection.execute(
      'SELECT id, name, description, category, price, quantity, created_at, updated_at FROM items ORDER BY created_at DESC'
    );
    return result.rows;
  } finally {
    await connection.close();
  }
}
```

### Create Item

```javascript
async function createItem(data) {
  const connection = await getConnection();
  try {
    const result = await connection.execute(
      `INSERT INTO items (name, description, category, price, quantity, created_at, updated_at)
       VALUES (:name, :description, :category, :price, :quantity, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id INTO :id`,
      {
        name: data.name,
        description: data.description || null,
        category: data.category || null,
        price: data.price || 0,
        quantity: data.quantity || 0,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );
    return result.outBinds.id[0];
  } finally {
    await connection.close();
  }
}
```

### Search with Filters

```javascript
async function searchItems(query, category, minPrice, maxPrice) {
  const connection = await getConnection();
  try {
    let sql = 'SELECT * FROM items WHERE 1=1';
    const binds = {};

    if (query) {
      sql += ' AND (LOWER(name) LIKE :query OR LOWER(description) LIKE :query)';
      binds.query = '%' + query.toLowerCase() + '%';
    }

    if (category) {
      sql += ' AND category = :category';
      binds.category = category;
    }

    if (minPrice !== undefined) {
      sql += ' AND price >= :minPrice';
      binds.minPrice = parseFloat(minPrice);
    }

    if (maxPrice !== undefined) {
      sql += ' AND price <= :maxPrice';
      binds.maxPrice = parseFloat(maxPrice);
    }

    sql += ' ORDER BY created_at DESC';

    const result = await connection.execute(sql, binds);
    return result.rows;
  } finally {
    await connection.close();
  }
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
curl http://localhost:3000/api/data/1

# Update item
curl -X PUT http://localhost:3000/api/data/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Product", "price": 149.99}'

# Delete item
curl -X DELETE http://localhost:3000/api/data/1

# Search items
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test", "minPrice": 50, "maxPrice": 150}'
```

### SQL*Plus Testing

```bash
# Connect to Oracle Database
sqlplus system/oracle@localhost:1521/XEPDB1

# View all items
SELECT * FROM items;

# Find by category
SELECT * FROM items WHERE category = 'Electronics';

# Count items
SELECT COUNT(*) FROM items;

# Check indexes
SELECT index_name, column_name FROM user_ind_columns WHERE table_name = 'ITEMS';
```

## 🐛 Debugging

Enable detailed logging:

```javascript
// In database.js
oracledb.initOracleClient({ libDir: '/path/to/instantclient' });
```

View Oracle Database logs:
```bash
# Check Oracle listener status
lsnrctl status

# View Oracle alert log
tail -f $ORACLE_BASE/diag/rdbms/<db_name>/<instance>/trace/alert_<instance>.log
```

## 📦 Dependencies

### Production Dependencies
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `oracledb` - Official Oracle Database Node.js driver
- `validator` - Input validation library

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
- `ORACLE_USER` - Oracle Database user
- `ORACLE_PASSWORD` - Oracle Database password
- `ORACLE_CONNECT_STRING` - Oracle connection string
- `CORS_ORIGIN` - Production frontend URL

### Oracle Cloud
For production, consider Oracle Cloud Infrastructure (OCI):
1. Create an Autonomous Database at https://cloud.oracle.com
2. Download wallet and configure connection
3. Update connection settings in .env
4. Enable authentication
5. Configure network security

### Process Management
Use PM2 for production:
```bash
npm install -g pm2
pm2 start src/server.js --name oracledb-backend
pm2 save
pm2 startup
```

## 📚 Additional Resources

- [Oracle Database Documentation](https://docs.oracle.com/en/database/)
- [Oracle Node.js Driver (oracledb)](https://oracle.github.io/node-oracledb/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Oracle Cloud](https://cloud.oracle.com/)

## 🤝 Contributing

This is a learning module. Feel free to:
- Add new features
- Improve error handling
- Add tests
- Enhance documentation

## 📄 License

MIT License - Use freely for learning and commercial purposes.

---

Built as part of the Oracle Database Learning Module 🎓
