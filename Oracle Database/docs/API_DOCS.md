# API Documentation

Complete API endpoint documentation for the Oracle Database Learning Module backend.

## Base URL
```
http://localhost:3000/api
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Endpoints

### 1. GET /api/data
Get all items from the database.

**Request:**
```bash
curl http://localhost:3000/api/data
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "ID": 1,
      "NAME": "Laptop",
      "DESCRIPTION": "Gaming laptop",
      "CATEGORY": "Electronics",
      "PRICE": 1299.99,
      "QUANTITY": 5,
      "CREATED_AT": "2024-01-01T10:00:00.000Z",
      "UPDATED_AT": "2024-01-01T10:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

> **Note:** Oracle Database returns column names in uppercase by default when using `oracledb.OUT_FORMAT_OBJECT`.

---

### 2. GET /api/data/:id
Get a single item by ID.

**Request:**
```bash
curl http://localhost:3000/api/data/1
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "ID": 1,
    "NAME": "Laptop",
    "DESCRIPTION": "Gaming laptop",
    "CATEGORY": "Electronics",
    "PRICE": 1299.99,
    "QUANTITY": 5,
    "CREATED_AT": "2024-01-01T10:00:00.000Z",
    "UPDATED_AT": "2024-01-01T10:00:00.000Z"
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "error": "Item not found",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

---

### 3. POST /api/data
Create a new item.

**Request:**
```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Mouse",
    "description": "Ergonomic mouse",
    "category": "Electronics",
    "price": 29.99,
    "quantity": 50
  }'
```

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "category": "string (optional)",
  "price": "number (optional, default: 0)",
  "quantity": "integer (optional, default: 0)"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "ID": 2,
    "NAME": "Wireless Mouse",
    "DESCRIPTION": "Ergonomic mouse",
    "CATEGORY": "Electronics",
    "PRICE": 29.99,
    "QUANTITY": 50,
    "CREATED_AT": "2024-01-01T10:05:00.000Z",
    "UPDATED_AT": "2024-01-01T10:05:00.000Z"
  },
  "timestamp": "2024-01-01T10:05:00.000Z"
}
```

**Validation Errors:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Name is required",
  "timestamp": "2024-01-01T10:05:00.000Z"
}
```

> **Note:** Oracle uses `RETURNING INTO` with bind variables to retrieve the auto-generated ID after insert.

---

### 4. PUT /api/data/:id
Update an existing item.

**Request:**
```bash
curl -X PUT http://localhost:3000/api/data/2 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Mouse",
    "description": "RGB gaming mouse",
    "category": "Electronics",
    "price": 39.99,
    "quantity": 45
  }'
```

**Request Body:** (all fields required)
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "price": "number",
  "quantity": "integer"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "ID": 2,
    "NAME": "Gaming Mouse",
    "DESCRIPTION": "RGB gaming mouse",
    "CATEGORY": "Electronics",
    "PRICE": 39.99,
    "QUANTITY": 45,
    "CREATED_AT": "2024-01-01T10:05:00.000Z",
    "UPDATED_AT": "2024-01-01T10:10:00.000Z"
  },
  "timestamp": "2024-01-01T10:10:00.000Z"
}
```

---

### 5. DELETE /api/data/:id
Delete an item.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/data/2
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 2,
    "message": "Item deleted successfully"
  },
  "timestamp": "2024-01-01T10:15:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "success": false,
  "error": "Item not found",
  "timestamp": "2024-01-01T10:15:00.000Z"
}
```

---

### 6. POST /api/search
Search and filter items.

**Request:**
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "laptop",
    "category": "Electronics",
    "minPrice": 100,
    "maxPrice": 2000
  }'
```

**Request Body:** (all fields optional)
```json
{
  "query": "string (search in name/description)",
  "category": "string (exact match)",
  "minPrice": "number",
  "maxPrice": "number"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "ID": 1,
      "NAME": "Laptop",
      "DESCRIPTION": "Gaming laptop",
      "CATEGORY": "Electronics",
      "PRICE": 1299.99,
      "QUANTITY": 5,
      "CREATED_AT": "2024-01-01T10:00:00.000Z",
      "UPDATED_AT": "2024-01-01T10:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T10:20:00.000Z"
}
```

> **Note:** Oracle uses named bind variables (`:name`, `:id`) instead of positional `?` placeholders. Search uses `LOWER()` for case-insensitive matching.

---

## Health Check

### GET /health
Check server and database status.

**Request:**
```bash
curl http://localhost:3000/health
```

**Response:** `200 OK`
```json
{
  "status": "OK",
  "database": "Oracle Database",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success - Request completed successfully |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Validation Rules

### Name
- Required
- Cannot be empty string
- Trimmed automatically

### Price
- Optional (default: 0)
- Must be a positive number
- Stored as NUMBER(10,2) in Oracle

### Quantity
- Optional (default: 0)
- Must be a positive integer

### Description & Category
- Optional
- Can be null or empty string
- Description stored as CLOB for unlimited length

---

## Oracle-Specific Notes

### Bind Variables
Oracle uses named bind variables for parameterized queries:
```javascript
// Oracle style
connection.execute('SELECT * FROM items WHERE id = :id', { id: 1 })

// vs SQLite/MySQL positional style
db.get('SELECT * FROM items WHERE id = ?', [1])
```

### RETURNING INTO
Oracle supports `RETURNING INTO` to get generated values:
```javascript
const result = await connection.execute(
  'INSERT INTO items (name) VALUES (:name) RETURNING id INTO :id',
  { name: 'Test', id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } },
  { autoCommit: true }
);
const newId = result.outBinds.id[0];
```

### Connection Pooling
Always release connections back to the pool:
```javascript
let connection;
try {
  connection = await getConnection();
  // ... use connection
} finally {
  if (connection) await connection.close();
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. This is intentional for the learning module to keep the code simple and focused on database operations.

### For Production Use

Consider adding rate limiting middleware to prevent abuse:

```bash
npm install express-rate-limit
```

```javascript
// In server.js, add:
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply to all API routes
app.use('/api/', limiter);
```

---

## CORS

CORS is enabled for the frontend origin (default: `http://localhost:5173`).

To change the allowed origin, update `CORS_ORIGIN` in backend `.env` file.

---

## Testing with Postman

Import this collection structure:

1. **Collection**: Oracle Database API
2. **Base URL Variable**: `{{baseUrl}}` = `http://localhost:3000/api`
3. **Requests**:
   - GET All Items: `{{baseUrl}}/data`
   - GET Single Item: `{{baseUrl}}/data/1`
   - POST Create: `{{baseUrl}}/data`
   - PUT Update: `{{baseUrl}}/data/1`
   - DELETE Item: `{{baseUrl}}/data/1`
   - POST Search: `{{baseUrl}}/search`

---

## JavaScript/Axios Examples

```javascript
// Get all items
const items = await axios.get('/api/data')

// Get single item
const item = await axios.get('/api/data/1')

// Create item
const newItem = await axios.post('/api/data', {
  name: 'Item Name',
  description: 'Description',
  category: 'Category',
  price: 99.99,
  quantity: 10
})

// Update item
const updated = await axios.put('/api/data/1', {
  name: 'Updated Name',
  description: 'Updated Description',
  category: 'Category',
  price: 89.99,
  quantity: 5
})

// Delete item
await axios.delete('/api/data/1')

// Search items
const results = await axios.post('/api/search', {
  query: 'laptop',
  category: 'Electronics',
  minPrice: 100,
  maxPrice: 2000
})
```
