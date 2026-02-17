# DynamoDB Learning Module - API Documentation

Complete API reference for all available endpoints.

## Base URL
```
http://localhost:3000/api
```

## Response Format

All API responses follow this consistent format:

```json
{
  "success": true/false,
  "data": <response_data>,
  "error": null or "error message",
  "message": "Operation successful" or error message,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Endpoints

### 1. Health Check

Check if the server is running.

**Endpoint**: `GET /health`

**Request**: None

**Response**:
```json
{
  "status": "OK",
  "database": "DynamoDB",
  "endpoint": "http://localhost:8000",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Example**:
```bash
curl http://localhost:3000/health
```

---

### 2. Get All Items

Retrieve all items with pagination support.

**Endpoint**: `GET /api/data`

**Query Parameters**:
- `limit` (optional): Number of items to return (default: 50, max: 100)
- `lastKey` (optional): Pagination token from previous response

**Request**:
```bash
curl http://localhost:3000/api/data

# With pagination
curl "http://localhost:3000/api/data?limit=20&lastKey=<encoded_last_key>"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Laptop",
        "description": "High-performance gaming laptop",
        "category": "Electronics",
        "price": 1299.99,
        "stock": 5,
        "createdAt": "2024-01-01T12:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "lastEvaluatedKey": "encoded_key_for_next_page",
    "hasMore": true
  },
  "error": null,
  "message": "Operation successful",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 3. Get Item by ID

Retrieve a single item by its ID.

**Endpoint**: `GET /api/data/:id`

**Path Parameters**:
- `id`: Item UUID

**Request**:
```bash
curl http://localhost:3000/api/data/550e8400-e29b-41d4-a716-446655440000
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Laptop",
    "description": "High-performance gaming laptop",
    "category": "Electronics",
    "price": 1299.99,
    "stock": 5,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "error": null,
  "message": "Operation successful",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response** (404):
```json
{
  "success": false,
  "data": null,
  "error": "Item not found",
  "message": "Item not found",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 4. Create Item

Create a new item.

**Endpoint**: `POST /api/data`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse",
  "category": "Electronics",
  "price": 29.99,
  "stock": 50
}
```

**Field Validation**:
- `name`: **Required**, non-empty string
- `description`: Optional string
- `category`: Optional string (default: "Uncategorized")
- `price`: Optional number >= 0 (default: 0)
- `stock`: Optional integer >= 0 (default: 0)

**Request Example**:
```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "category": "Electronics",
    "price": 29.99,
    "stock": 50
  }'
```

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "category": "Electronics",
    "price": 29.99,
    "stock": 50,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "error": null,
  "message": "Operation successful",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Validation Error** (400):
```json
{
  "success": false,
  "data": null,
  "error": "Name is required",
  "message": "Name is required",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 5. Update Item

Update an existing item.

**Endpoint**: `PUT /api/data/:id`

**Path Parameters**:
- `id`: Item UUID

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Updated Laptop",
  "description": "Updated description",
  "category": "Electronics",
  "price": 1199.99,
  "stock": 10
}
```

**Request Example**:
```bash
curl -X PUT http://localhost:3000/api/data/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Laptop",
    "description": "Updated description",
    "category": "Electronics",
    "price": 1199.99,
    "stock": 10
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated Laptop",
    "description": "Updated description",
    "category": "Electronics",
    "price": 1199.99,
    "stock": 10,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T13:00:00.000Z"
  },
  "error": null,
  "message": "Operation successful",
  "timestamp": "2024-01-01T13:00:00.000Z"
}
```

**Error Response** (404):
```json
{
  "success": false,
  "data": null,
  "error": "Item not found",
  "message": "Item not found",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 6. Delete Item

Delete an item by ID.

**Endpoint**: `DELETE /api/data/:id`

**Path Parameters**:
- `id`: Item UUID

**Request Example**:
```bash
curl -X DELETE http://localhost:3000/api/data/550e8400-e29b-41d4-a716-446655440000
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Item deleted successfully"
  },
  "error": null,
  "message": "Operation successful",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response** (404):
```json
{
  "success": false,
  "data": null,
  "error": "Item not found",
  "message": "Item not found",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 7. Query Items by Category (GSI)

Query items by category using Global Secondary Index for optimized performance.

**Endpoint**: `GET /api/category/:category`

**Path Parameters**:
- `category`: Category name (e.g., "Electronics", "Books")

**Query Parameters**:
- `limit` (optional): Number of items to return (default: 50)
- `lastKey` (optional): Pagination token from previous response

**Request Example**:
```bash
curl http://localhost:3000/api/category/Electronics

# With pagination
curl "http://localhost:3000/api/category/Electronics?limit=20&lastKey=<encoded_key>"
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Laptop",
        "description": "High-performance gaming laptop",
        "category": "Electronics",
        "price": 1299.99,
        "stock": 5,
        "createdAt": "2024-01-01T12:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "lastEvaluatedKey": "encoded_key_for_next_page",
    "hasMore": true
  },
  "error": null,
  "message": "Operation successful",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 8. Search Items

Search and filter items with multiple criteria.

**Endpoint**: `POST /api/search`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "query": "laptop",
  "category": "Electronics",
  "minPrice": 100,
  "maxPrice": 2000,
  "limit": 20,
  "lastKey": null
}
```

**Filter Parameters**:
- `query` (optional): Search in name and description
- `category` (optional): Filter by category (uses GSI if only filter)
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `limit` (optional): Results per page (default: 50)
- `lastKey` (optional): Pagination token

**Request Example**:
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

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Gaming Laptop",
        "description": "High-performance laptop for gaming",
        "category": "Electronics",
        "price": 1299.99,
        "stock": 5,
        "createdAt": "2024-01-01T12:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "lastEvaluatedKey": null,
    "hasMore": false
  },
  "error": null,
  "message": "Operation successful",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 9. Get All Categories

Retrieve a list of all unique categories.

**Endpoint**: `GET /api/categories`

**Request Example**:
```bash
curl http://localhost:3000/api/categories
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    "Books",
    "Electronics",
    "Furniture",
    "Uncategorized"
  ],
  "error": null,
  "message": "Operation successful",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 500 | Internal Server Error |

## Common Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "data": null,
  "error": "Price must be a positive number",
  "message": "Price must be a positive number",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "data": null,
  "error": "Item not found",
  "message": "Item not found",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Server Error (500)
```json
{
  "success": false,
  "data": null,
  "error": "Internal server error",
  "message": "Internal server error",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Pagination

DynamoDB uses cursor-based pagination with `LastEvaluatedKey`:

1. Make initial request
2. Check if `hasMore` is `true`
3. Use `lastEvaluatedKey` from response in next request
4. Repeat until `hasMore` is `false`

**Example Pagination Flow**:
```bash
# Page 1
curl "http://localhost:3000/api/data?limit=10"
# Response includes: "lastEvaluatedKey": "abc123..."

# Page 2
curl "http://localhost:3000/api/data?limit=10&lastKey=abc123..."
# Response includes: "lastEvaluatedKey": "def456..."

# Page 3
curl "http://localhost:3000/api/data?limit=10&lastKey=def456..."
# Response includes: "lastEvaluatedKey": null, "hasMore": false
```

## Rate Limiting

When using AWS DynamoDB (not local):
- Read capacity units (RCU): 5 per second (default)
- Write capacity units (WCU): 5 per second (default)
- Exceeding capacity returns `ProvisionedThroughputExceededException`
- Consider implementing exponential backoff
- Enable auto-scaling in production

## Testing with cURL

### Complete CRUD Example
```bash
# 1. Create an item
ITEM_ID=$(curl -s -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","category":"Test","price":99.99,"stock":10}' \
  | jq -r '.data.id')

# 2. Get the item
curl http://localhost:3000/api/data/$ITEM_ID

# 3. Update the item
curl -X PUT http://localhost:3000/api/data/$ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Item","category":"Test","price":79.99,"stock":20}'

# 4. Search for the item
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"category":"Test"}'

# 5. Delete the item
curl -X DELETE http://localhost:3000/api/data/$ITEM_ID
```

## Testing with Postman

Import this collection into Postman for easy testing:

1. Create new collection: "DynamoDB API"
2. Add base URL variable: `{{baseUrl}}` = `http://localhost:3000/api`
3. Create requests for each endpoint above
4. Test with different scenarios

## SDK Integration Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Create item
const newItem = await api.post('/data', {
  name: 'Product',
  category: 'Electronics',
  price: 99.99,
  stock: 10
});

// Get all items
const items = await api.get('/data');

// Update item
await api.put(`/data/${itemId}`, updatedData);

// Delete item
await api.delete(`/data/${itemId}`);
```

### Python
```python
import requests

base_url = 'http://localhost:3000/api'

# Create item
response = requests.post(f'{base_url}/data', json={
    'name': 'Product',
    'category': 'Electronics',
    'price': 99.99,
    'stock': 10
})

# Get all items
response = requests.get(f'{base_url}/data')
items = response.json()
```
