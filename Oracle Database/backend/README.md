# Oracle Database Backend - Learning Module

Node.js + Express backend server for Oracle Database operations with full CRUD API.

## Features

- ✅ RESTful API with Express.js
- ✅ Oracle Database with oracledb driver
- ✅ Connection pooling for performance
- ✅ Full CRUD operations
- ✅ Input validation
- ✅ Error handling
- ✅ CORS support
- ✅ Search and filter functionality
- ✅ Automatic database initialization

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: Oracle Database (oracledb driver)
- **Validation**: Validator
- **Environment**: Dotenv
- **Dev Tool**: Nodemon

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Oracle Database (XE or higher) running on localhost:1521
- Oracle Instant Client (if not using Thick mode)

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env if needed (configure Oracle credentials)
```

## Configuration

Edit `.env` file:

```env
PORT=3000
NODE_ENV=development
ORACLE_USER=system
ORACLE_PASSWORD=oracle
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1
CORS_ORIGIN=http://localhost:5173
```

## Running the Server

### Development Mode
```bash
npm run dev
```
Server runs on `http://localhost:3000` with auto-reload.

### Production Mode
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```
Returns server and database status.

### Get All Items
```
GET /api/data
```
Returns all items from the database.

**Response:**
```json
{
  "success": true,
  "data": [...],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Get Single Item
```
GET /api/data/:id
```
Returns a specific item by ID.

### Create Item
```
POST /api/data
Content-Type: application/json

{
  "name": "Item Name",
  "description": "Description",
  "category": "Category",
  "price": 99.99,
  "quantity": 10
}
```

### Update Item
```
PUT /api/data/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated Description",
  "category": "Category",
  "price": 89.99,
  "quantity": 5
}
```

### Delete Item
```
DELETE /api/data/:id
```

### Search/Filter Items
```
POST /api/search
Content-Type: application/json

{
  "query": "search text",
  "category": "Category",
  "minPrice": 10,
  "maxPrice": 100
}
```

## Database Schema

### Items Table
```sql
CREATE TABLE items (
  id NUMBER PRIMARY KEY,
  name VARCHAR2(255) NOT NULL,
  description CLOB,
  category VARCHAR2(100),
  price NUMBER(10,2),
  quantity NUMBER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sequence & Trigger (Auto-Increment)
```sql
CREATE SEQUENCE items_seq START WITH 1 INCREMENT BY 1;

CREATE OR REPLACE TRIGGER items_bi
BEFORE INSERT ON items
FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT items_seq.NEXTVAL INTO :NEW.id FROM DUAL;
  END IF;
END;
```

## Project Structure

```
backend/
├── src/
│   ├── server.js       # Express app and server
│   ├── database.js     # Oracle connection pool and initialization
│   └── routes.js       # API routes
├── package.json
├── .env.example
└── README.md
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Development

### Add Sample Data

Use curl or Postman:

```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "Gaming laptop",
    "category": "Electronics",
    "price": 1299.99,
    "quantity": 5
  }'
```

### Test Endpoints

```bash
# Get all items
curl http://localhost:3000/api/data

# Get specific item
curl http://localhost:3000/api/data/1

# Search
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "laptop"}'
```

## Building

No build step required for Node.js backend. Use `npm run build` for validation.

## Troubleshooting

### Oracle Instant Client Not Found
```bash
# Install Oracle Instant Client
# macOS: brew install instantclient-basiclite
# Linux: Download from Oracle website and set LD_LIBRARY_PATH
export LD_LIBRARY_PATH=/opt/oracle/instantclient_21_1:$LD_LIBRARY_PATH
```

### ORA-12541: TNS:no listener
```bash
# Verify Oracle is running
lsnrctl status

# Start the listener
lsnrctl start
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### Connection Pool Errors
Ensure Oracle Database is running and accessible. Check credentials in `.env`.

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

MIT
