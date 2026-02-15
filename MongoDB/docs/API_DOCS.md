# API Documentation

Complete API endpoint documentation for the MongoDB Learning Module backend.

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
      "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
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
Get a single item by its MongoDB ObjectId.

**Request:**
```bash
curl http://localhost:3000/api/data/65a1b2c3d4e5f6a7b8c9d0e1
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
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

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": "Invalid ID format",
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
    "_id": "65a1b2c3d4e5f6a7b8c9d0e2",
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
Update an existing item.

**Request:**
```bash
curl -X PUT http://localhost:3000/api/data/65a1b2c3d4e5f6a7b8c9d0e2 \
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
    "_id": "65a1b2c3d4e5f6a7b8c9d0e2",
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
Delete an item.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/data/65a1b2c3d4e5f6a7b8c9d0e2
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "65a1b2c3d4e5f6a7b8c9d0e2",
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
  "query": "string (regex search in name/description)",
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
      "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
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
Check server and database status.

**Request:**
```bash
curl http://localhost:3000/health
```

**Response:** `200 OK`
```json
{
  "status": "OK",
  "database": "MongoDB",
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success - Request completed successfully |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input, validation error, or invalid ObjectId |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## ID Format

MongoDB uses **ObjectId** as the primary key (`_id`). ObjectIds are 24-character hexadecimal strings.

### Valid ObjectId Examples
- `65a1b2c3d4e5f6a7b8c9d0e1`
- `507f1f77bcf86cd799439011`

### Invalid ObjectId Examples
- `1` (too short)
- `not-a-valid-id` (not hexadecimal)
- `65a1b2c3d4e5f6a7b8c9d0e1z` (too long)

The API validates ObjectId format and returns a `400 Bad Request` error for invalid IDs.

---

## Validation Rules

### Name
- Required
- Cannot be empty string
- Trimmed automatically

### Price
- Optional (default: 0)
- Must be a positive number
- Supports up to 2 decimal places

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

For more granular control, apply different limits to different endpoints:

```javascript
// Higher limit for read operations
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200
});

// Lower limit for write operations
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50
});

app.get('/api/data', readLimiter, routes);
app.post('/api/data', writeLimiter, routes);
```

---

## CORS

CORS is enabled for the frontend origin (default: `http://localhost:5173`).

To change the allowed origin, update `CORS_ORIGIN` in backend `.env` file.

---

## Testing with Postman

Import this collection structure:

1. **Collection**: MongoDB API
2. **Base URL Variable**: `{{baseUrl}}` = `http://localhost:3000/api`
3. **Requests**:
   - GET All Items: `{{baseUrl}}/data`
   - GET Single Item: `{{baseUrl}}/data/65a1b2c3d4e5f6a7b8c9d0e1`
   - POST Create: `{{baseUrl}}/data`
   - PUT Update: `{{baseUrl}}/data/65a1b2c3d4e5f6a7b8c9d0e1`
   - DELETE Item: `{{baseUrl}}/data/65a1b2c3d4e5f6a7b8c9d0e1`
   - POST Search: `{{baseUrl}}/search`

---

## JavaScript/Axios Examples

```javascript
// Get all items
const items = await axios.get('/api/data')

// Get single item (use ObjectId)
const item = await axios.get('/api/data/65a1b2c3d4e5f6a7b8c9d0e1')

// Create item
const newItem = await axios.post('/api/data', {
  name: 'Item Name',
  description: 'Description',
  category: 'Category',
  price: 99.99,
  quantity: 10
})

// Update item
const updated = await axios.put('/api/data/65a1b2c3d4e5f6a7b8c9d0e1', {
  name: 'Updated Name',
  description: 'Updated Description',
  category: 'Category',
  price: 89.99,
  quantity: 5
})

// Delete item
await axios.delete('/api/data/65a1b2c3d4e5f6a7b8c9d0e1')

// Search items
const results = await axios.post('/api/search', {
  query: 'laptop',
  category: 'Electronics',
  minPrice: 100,
  maxPrice: 2000
})
```
