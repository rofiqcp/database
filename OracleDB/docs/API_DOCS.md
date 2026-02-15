# API Documentation

Complete API endpoint documentation for the Oracle Database Learning Module backend.

## Base URL
```
http://localhost:3000/api
```

## Database Operations

This API uses Oracle Database for data storage. Operations are performed using the oracledb Node.js driver with bind variables for security.

### Oracle Database Tables

The application uses the following table:
- **items** - Stores item rows with defined schema

### Table Structure

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
Get all items from the Oracle Database table.

**Oracle Database Operation:**
```sql
-- Uses: SELECT with ORDER BY
SELECT id, name, description, category, price, quantity, created_at, updated_at
FROM items ORDER BY created_at DESC
```

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
      "id": 1,
      "name": "Laptop",
      "description": "Gaming laptop",
      "category": "Electronics",
      "price": 1299.99,
      "quantity": 5,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

---

### 2. GET /api/data/:id
Get a single item by numeric ID.

**Oracle Database Operation:**
```sql
-- Uses: SELECT with WHERE and bind variable
SELECT id, name, description, category, price, quantity, created_at, updated_at
FROM items WHERE id = :id
```

**Request:**
```bash
curl http://localhost:3000/api/data/1
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laptop",
    "description": "Gaming laptop",
    "category": "Electronics",
    "price": 1299.99,
    "quantity": 5,
    "created_at": "2024-01-01T10:00:00.000Z",
    "updated_at": "2024-01-01T10:00:00.000Z"
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
Create a new item in the Oracle Database table.

**Oracle Database Operation:**
```sql
-- Uses: INSERT with RETURNING clause and bind variables
INSERT INTO items (name, description, category, price, quantity, created_at, updated_at)
VALUES (:name, :description, :category, :price, :quantity, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
RETURNING id INTO :id
```

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
    "id": 2,
    "name": "Wireless Mouse",
    "description": "Ergonomic mouse",
    "category": "Electronics",
    "price": 29.99,
    "quantity": 50,
    "created_at": "2024-01-01T10:05:00.000Z",
    "updated_at": "2024-01-01T10:05:00.000Z"
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

---

### 4. PUT /api/data/:id
Update an existing item in Oracle Database.

**Oracle Database Operation:**
```sql
-- Uses: UPDATE with SET and bind variables
UPDATE items SET
  name = :name,
  description = :description,
  category = :category,
  price = :price,
  quantity = :quantity,
  updated_at = CURRENT_TIMESTAMP
WHERE id = :id
```

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
    "id": 2,
    "name": "Gaming Mouse",
    "description": "RGB gaming mouse",
    "category": "Electronics",
    "price": 39.99,
    "quantity": 45,
    "created_at": "2024-01-01T10:05:00.000Z",
    "updated_at": "2024-01-01T10:10:00.000Z"
  },
  "timestamp": "2024-01-01T10:10:00.000Z"
}
```

---

### 5. DELETE /api/data/:id
Delete an item from Oracle Database.

**Oracle Database Operation:**
```sql
-- Uses: DELETE with bind variable
DELETE FROM items WHERE id = :id
```

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/data/2
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "2",
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
Search and filter items using Oracle SQL WHERE clauses with bind variables.

**Oracle Database Operations:**
```sql
-- Uses LIKE for text search with bind variables
-- Uses >= and <= for price range
-- Uses = for exact category match
-- Combined with AND operator
SELECT * FROM items
WHERE LOWER(name) LIKE :query
  AND category = :category
  AND price >= :minPrice
  AND price <= :maxPrice
ORDER BY created_at DESC
```

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
  "query": "string (search in name/description using LIKE)",
  "category": "string (exact match using =)",
  "minPrice": "number (using >= operator)",
  "maxPrice": "number (using <= operator)"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "Gaming laptop",
      "category": "Electronics",
      "price": 1299.99,
      "quantity": 5,
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T10:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T10:20:00.000Z"
}
```

---

## Health Check

### GET /health
Check server and Oracle Database status.

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
- Supports decimal places

### Quantity
- Optional (default: 0)
- Must be a positive integer

### Description & Category
- Optional
- Can be null or empty string

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

// Get single item by ID
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

// Search items with Oracle SQL operators
const results = await axios.post('/api/search', {
  query: 'laptop',           // Uses LIKE operator
  category: 'Electronics',   // Uses = operator
  minPrice: 100,             // Uses >= operator
  maxPrice: 2000             // Uses <= operator
})
```
