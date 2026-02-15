# SQL Server Backend

Node.js + Express.js backend with SQL Server database for the SQL Server Learning Module.

## 📋 Overview

RESTful API backend built with Express.js and SQL Server. Provides full CRUD operations with input validation, error handling, and comprehensive API responses.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: SQL Server (mssql Node.js driver)
- **Validation**: Validator library
- **Environment**: Dotenv
- **Dev Server**: Nodemon

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js      # Express app initialization & startup
│   ├── database.js    # SQL Server connection & configuration
│   └── routes.js      # API route handlers
├── package.json       # Dependencies & scripts
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- SQL Server 2019+ installed and running
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
MSSQL_USER=sa
MSSQL_PASSWORD=YourStrong!Password
MSSQL_SERVER=localhost
MSSQL_DATABASE=learning_db
MSSQL_PORT=1433
CORS_ORIGIN=http://localhost:5173
```

**SQL Server Connection Options:**

Local SQL Server:
```env
MSSQL_SERVER=localhost
MSSQL_PORT=1433
```

SQL Server with named instance:
```env
MSSQL_SERVER=localhost\\SQLEXPRESS
```

Azure SQL Database (cloud):
```env
MSSQL_SERVER=your-server.database.windows.net
MSSQL_DATABASE=your-database
MSSQL_USER=your-username
MSSQL_PASSWORD=your-password
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
Response: { status: 'OK', database: 'SQL Server', timestamp: '...' }
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
Params: id (integer)
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
Params: id (integer)
Body: { name, description?, category?, price?, quantity? }
Response: { success: true, data: {...}, timestamp: '...' }
```

#### Delete Item
```
DELETE /api/data/:id
Params: id (integer)
Response: { success: true, data: { id, message }, timestamp: '...' }
```

#### Search/Filter Items
```
POST /api/search
Body: { query?, category?, minPrice?, maxPrice? }
Response: { success: true, data: [...], timestamp: '...' }
```

## 💾 Database Operations

### SQL Server Table Schema

```sql
CREATE TABLE items (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  category NVARCHAR(100),
  price DECIMAL(10,2) DEFAULT 0,
  quantity INT DEFAULT 0,
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE()
)
```

### Indexes Created

- `idx_items_category` - Index on category column
- `idx_items_name` - Index on name column

### SQL Server Operations Used

- `SELECT` - Query rows
- `INSERT INTO ... OUTPUT INSERTED.*` - Create new row and return it
- `UPDATE ... OUTPUT INSERTED.*` - Update row and return it
- `DELETE` - Delete row
- `CREATE INDEX` - Create indexes
- `ORDER BY` - Sort results
- Parameterized queries with `request.input()` - Prevent SQL injection

## ✅ Input Validation

All inputs are validated using the `validator` library:

- **Name**: Required, non-empty string
- **Price**: Optional positive number
- **Quantity**: Optional positive integer
- **ID**: Valid integer format

## 🔒 Security Features

- **Input Validation**: All inputs validated before processing
- **Error Handling**: Comprehensive error handling with meaningful messages
- **CORS Protection**: Configurable CORS origins
- **Parameterized Queries**: Prevents SQL injection attacks
- **Environment Variables**: Sensitive data in .env files

## 📝 Code Examples

### Query Items from SQL Server

```javascript
const { getPool } = require('./database');

async function getAllItems() {
  const pool = getPool();
  const result = await pool.request()
    .query('SELECT * FROM items ORDER BY created_at DESC');
  return result.recordset;
}
```

### Create Item

```javascript
async function createItem(data) {
  const pool = getPool();
  const result = await pool.request()
    .input('name', sql.NVarChar(255), data.name)
    .input('description', sql.NVarChar(sql.MAX), data.description || null)
    .input('category', sql.NVarChar(100), data.category || null)
    .input('price', sql.Decimal(10, 2), data.price || 0)
    .input('quantity', sql.Int, data.quantity || 0)
    .query(`
      INSERT INTO items (name, description, category, price, quantity)
      OUTPUT INSERTED.*
      VALUES (@name, @description, @category, @price, @quantity)
    `);
  return result.recordset[0];
}
```

### Search with Filters

```javascript
async function searchItems(query, category, minPrice, maxPrice) {
  const pool = getPool();
  const request = pool.request();
  const conditions = [];

  if (query) {
    request.input('query', sql.NVarChar(255), `%${query}%`);
    conditions.push('(name LIKE @query OR description LIKE @query)');
  }

  if (category) {
    request.input('category', sql.NVarChar(100), category);
    conditions.push('category = @category');
  }

  if (minPrice !== undefined) {
    request.input('minPrice', sql.Decimal(10, 2), minPrice);
    conditions.push('price >= @minPrice');
  }

  if (maxPrice !== undefined) {
    request.input('maxPrice', sql.Decimal(10, 2), maxPrice);
    conditions.push('price <= @maxPrice');
  }

  let sqlQuery = 'SELECT * FROM items';
  if (conditions.length > 0) {
    sqlQuery += ' WHERE ' + conditions.join(' AND ');
  }
  sqlQuery += ' ORDER BY created_at DESC';

  const result = await request.query(sqlQuery);
  return result.recordset;
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

### SQL Server Management Studio Testing

```sql
-- Connect to SQL Server
-- Open SSMS and connect to localhost

-- Switch to database
USE learning_db;

-- View all items
SELECT * FROM items;

-- Find by category
SELECT * FROM items WHERE category = 'Electronics';

-- Count items
SELECT COUNT(*) FROM items;

-- Check indexes
SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID('items');
```

## 🐛 Debugging

View SQL Server logs:
```bash
# Check SQL Server process
ps aux | grep sqlservr

# View SQL Server error log (Linux)
cat /var/opt/mssql/log/errorlog
```

## 📦 Dependencies

### Production Dependencies
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variables
- `mssql` - SQL Server Node.js driver
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
- `MSSQL_USER` - SQL Server username
- `MSSQL_PASSWORD` - SQL Server password
- `MSSQL_SERVER` - SQL Server host
- `MSSQL_DATABASE` - Database name
- `MSSQL_PORT` - SQL Server port
- `CORS_ORIGIN` - Production frontend URL

### Azure SQL Database (Cloud)
For production, consider Azure SQL Database:
1. Create database at https://portal.azure.com
2. Get connection details
3. Update environment variables in .env
4. Configure firewall rules
5. Enable authentication

### Process Management
Use PM2 for production:
```bash
npm install -g pm2
pm2 start src/server.js --name sqlserver-backend
pm2 save
pm2 startup
```

## 📚 Additional Resources

- [SQL Server Documentation](https://docs.microsoft.com/en-us/sql/sql-server/)
- [mssql Node.js Driver](https://www.npmjs.com/package/mssql)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Azure SQL Database](https://azure.microsoft.com/en-us/products/azure-sql/database/)

## 🤝 Contributing

This is a learning module. Feel free to:
- Add new features
- Improve error handling
- Add tests
- Enhance documentation

## 📄 License

MIT License - Use freely for learning and commercial purposes.

---

Built as part of the SQL Server Learning Module 🎓
