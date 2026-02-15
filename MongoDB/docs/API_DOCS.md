# API Documentation

Complete API endpoint documentation for the MongoDB Learning Module backend.

## Base URL
```
http://localhost:3000/api
```

## Database Operations

This API uses MongoDB for data storage. Operations are performed using Mongoose ODM (Object Data Modeling).

### MongoDB Collections

The application uses the following collection:
- **items** - Stores item documents with flexible schema

### Document Structure

```javascript
{
  _id: ObjectId,              // MongoDB auto-generated unique ID
  name: String,               // Required field
  description: String,        // Optional field
  category: String,           // Optional field
  price: Number,              // Default: 0
  quantity: Number,           // Default: 0
  created_at: Date,           // Auto-generated on create
  updated_at: Date,           // Auto-updated on modify
  __v: Number                 // MongoDB version control
}
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
Get all items from the MongoDB collection.

**MongoDB Operation:**
```javascript
// Uses: Item.find({})
// Returns all documents in items collection
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
      "_id": "507f1f77bcf86cd799439011",
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
Get a single item by MongoDB ObjectId.

**MongoDB Operation:**
```javascript
// Uses: Item.findById(id)
// Returns document matching _id
```

**Request:**
```bash
curl http://localhost:3000/api/data/507f1f77bcf86cd799439011
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
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
Create a new item in the MongoDB collection.

**MongoDB Operation:**
```javascript
// Uses: Item.create(data)
// Creates new document with auto-generated ObjectId and timestamps
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
    "_id": "507f1f77bcf86cd799439012",
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
Update an existing item in MongoDB.

**MongoDB Operation:**
```javascript
// Uses: Item.findByIdAndUpdate(id, data, { new: true })
// Updates document and returns updated document
```

**Request:**
```bash
curl -X PUT http://localhost:3000/api/data/507f1f77bcf86cd799439012 \
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
    "_id": "507f1f77bcf86cd799439012",
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
Delete an item from MongoDB.

**MongoDB Operation:**
```javascript
// Uses: Item.findByIdAndDelete(id)
// Removes document from collection
```

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/data/507f1f77bcf86cd799439012
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
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
Search and filter items using MongoDB query operators.

**MongoDB Operations:**
```javascript
// Uses MongoDB $regex for text search
// Uses $gte, $lte for price range
// Uses $eq for exact category match
// Combines with $and operator
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
  "query": "string (search in name/description using $regex)",
  "category": "string (exact match using $eq)",
  "minPrice": "number (using $gte operator)",
  "maxPrice": "number (using $lte operator)"
}
```

**MongoDB Query Example:**
```javascript
// Internally uses:
Item.find({
  $and: [
    { $or: [
      { name: { $regex: "laptop", $options: "i" } },
      { description: { $regex: "laptop", $options: "i" } }
    ]},
    { category: "Electronics" },
    { price: { $gte: 100 } },
    { price: { $lte: 2000 } }
  ]
})
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
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
Check server and MongoDB database status.

**MongoDB Operation:**
```javascript
// Uses: mongoose connection status check
// Verifies connection to MongoDB
```

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
   - GET Single Item: `{{baseUrl}}/data/507f1f77bcf86cd799439011`
   - POST Create: `{{baseUrl}}/data`
   - PUT Update: `{{baseUrl}}/data/507f1f77bcf86cd799439011`
   - DELETE Item: `{{baseUrl}}/data/507f1f77bcf86cd799439011`
   - POST Search: `{{baseUrl}}/search`

---

## JavaScript/Axios Examples

```javascript
// Get all items
const items = await axios.get('/api/data')

// Get single item by ObjectId
const item = await axios.get('/api/data/507f1f77bcf86cd799439011')

// Create item
const newItem = await axios.post('/api/data', {
  name: 'Item Name',
  description: 'Description',
  category: 'Category',
  price: 99.99,
  quantity: 10
})

// Update item
const updated = await axios.put('/api/data/507f1f77bcf86cd799439011', {
  name: 'Updated Name',
  description: 'Updated Description',
  category: 'Category',
  price: 89.99,
  quantity: 5
})

// Delete item
await axios.delete('/api/data/507f1f77bcf86cd799439011')

// Search items with MongoDB operators
const results = await axios.post('/api/search', {
  query: 'laptop',           // Uses $regex operator
  category: 'Electronics',   // Uses $eq operator
  minPrice: 100,            // Uses $gte operator
  maxPrice: 2000            // Uses $lte operator
})
```
