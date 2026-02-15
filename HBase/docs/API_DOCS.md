# API Documentation

Complete API endpoint documentation for the HBase Learning Module backend.

## Base URL
```
http://localhost:3000/api
```

## Database Operations

This API uses HBase for data storage. Operations are performed using the HBase REST API via the `hbase` Node.js client.

### HBase Table

The application uses the following table:
- **items** - Stores item data with column family `data`

### Row Structure

```
Table: items
Row Key: UUID v4 (e.g., "550e8400-e29b-41d4-a716-446655440000")
Column Family: data
  data:name          - Item name (required)
  data:description   - Item description (optional)
  data:category      - Item category (optional)
  data:price         - Item price (default: 0)
  data:quantity      - Item quantity (default: 0)
  data:created_at    - Creation timestamp (auto-generated)
  data:updated_at    - Last update timestamp (auto-updated)
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
Get all items from the HBase table.

**HBase Operation:**
```javascript
// Uses: table.scan() to retrieve all rows
// Returns all rows sorted by created_at descending
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
      "id": "550e8400-e29b-41d4-a716-446655440000",
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
Get a single item by UUID row key.

**HBase Operation:**
```javascript
// Uses: row.get() to retrieve a specific row by key
// Returns all column qualifiers for the row
```

**Request:**
```bash
curl http://localhost:3000/api/data/550e8400-e29b-41d4-a716-446655440000
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
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
Create a new item in the HBase table.

**HBase Operation:**
```javascript
// Uses: row.put() to insert a new row with UUID as row key
// All column qualifiers set under 'data' column family
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
    "id": "550e8400-e29b-41d4-a716-446655440001",
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
Update an existing item in HBase.

**HBase Operation:**
```javascript
// Uses: row.put() to update column qualifiers for existing row
// Updates updated_at timestamp automatically
```

**Request:**
```bash
curl -X PUT http://localhost:3000/api/data/550e8400-e29b-41d4-a716-446655440001 \
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
    "id": "550e8400-e29b-41d4-a716-446655440001",
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
Delete an item from HBase.

**HBase Operation:**
```javascript
// Uses: row.delete() to remove entire row by key
// Removes all column qualifiers for the row
```

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/data/550e8400-e29b-41d4-a716-446655440001
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
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
Search and filter items using in-memory filtering (HBase has limited query support).

**HBase Operations:**
```javascript
// Uses table.scan() to get all rows
// Filters in-memory by:
// - Text search on name and description (case-insensitive includes)
// - Category exact match
// - Price range with min/max comparison
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
  "query": "string (search in name/description)",
  "category": "string (exact match)",
  "minPrice": "number (minimum price filter)",
  "maxPrice": "number (maximum price filter)"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
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
Check server and HBase database status.

**Request:**
```bash
curl http://localhost:3000/health
```

**Response:** `200 OK`
```json
{
  "status": "OK",
  "database": "HBase",
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

Consider adding rate limiting middleware:

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);
```

---

## CORS

CORS is enabled for the frontend origin (default: `http://localhost:5173`).

To change the allowed origin, update `CORS_ORIGIN` in backend `.env` file.

---

## Testing with Postman

Import this collection structure:

1. **Collection**: HBase API
2. **Base URL Variable**: `{{baseUrl}}` = `http://localhost:3000/api`
3. **Requests**:
   - GET All Items: `{{baseUrl}}/data`
   - GET Single Item: `{{baseUrl}}/data/550e8400-e29b-41d4-a716-446655440000`
   - POST Create: `{{baseUrl}}/data`
   - PUT Update: `{{baseUrl}}/data/550e8400-e29b-41d4-a716-446655440000`
   - DELETE Item: `{{baseUrl}}/data/550e8400-e29b-41d4-a716-446655440000`
   - POST Search: `{{baseUrl}}/search`

---

## JavaScript/Axios Examples

```javascript
// Get all items
const items = await axios.get('/api/data')

// Get single item by UUID
const item = await axios.get('/api/data/550e8400-e29b-41d4-a716-446655440000')

// Create item
const newItem = await axios.post('/api/data', {
  name: 'Item Name',
  description: 'Description',
  category: 'Category',
  price: 99.99,
  quantity: 10
})

// Update item
const updated = await axios.put('/api/data/550e8400-e29b-41d4-a716-446655440000', {
  name: 'Updated Name',
  description: 'Updated Description',
  category: 'Category',
  price: 89.99,
  quantity: 5
})

// Delete item
await axios.delete('/api/data/550e8400-e29b-41d4-a716-446655440000')

// Search items
const results = await axios.post('/api/search', {
  query: 'laptop',
  category: 'Electronics',
  minPrice: 100,
  maxPrice: 2000
})
```
