# Firebase API Documentation

Complete API reference for the Firebase Learning Module backend.

## Base URL

```
http://localhost:3000/api
```

## Authentication

API key authentication is required for write operations (POST, PUT, DELETE).

**Header:**
```
x-api-key: your-secret-api-key-here
```

**Query Parameter:**
```
?apiKey=your-secret-api-key-here
```

## Response Format

All API responses follow this consistent format:

```json
{
  "success": boolean,
  "data": object | array | null,
  "error": string | null,
  "timestamp": "ISO 8601 timestamp"
}
```

## Endpoints

### Health Check

Check server and database status.

**GET** `/health`

**Response:**
```json
{
  "status": "OK",
  "database": "Firebase Firestore",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### Get All Items

Retrieve all items from the database.

**GET** `/api/data`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123xyz",
      "name": "Laptop",
      "description": "High-performance laptop",
      "price": 999.99,
      "category": "Electronics",
      "stock": 15,
      "featured": true,
      "userId": "user123",
      "createdAt": {"_seconds": 1234567890, "_nanoseconds": 0},
      "updatedAt": {"_seconds": 1234567890, "_nanoseconds": 0}
    }
  ],
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### Get Item by ID

Retrieve a single item by its document ID.

**GET** `/api/data/:id`

**Parameters:**
- `id` (path) - Document ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123xyz",
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "category": "Electronics",
    "stock": 15,
    "featured": true,
    "userId": "user123",
    "createdAt": {"_seconds": 1234567890, "_nanoseconds": 0},
    "updatedAt": {"_seconds": 1234567890, "_nanoseconds": 0}
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "data": null,
  "error": "Item not found",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### Create Item

Create a new item in the database.

**POST** `/api/data`

**Headers:**
```
Content-Type: application/json
x-api-key: your-secret-api-key-here
```

**Request Body:**
```json
{
  "name": "Smartphone",
  "description": "Latest model smartphone",
  "price": 799.99,
  "category": "Electronics",
  "stock": 50,
  "featured": true,
  "userId": "user123"
}
```

**Required Fields:**
- `name` (string) - Item name

**Optional Fields:**
- `description` (string) - Item description
- `price` (number) - Item price (default: 0)
- `category` (string) - Item category
- `stock` (number) - Available stock (default: 0)
- `featured` (boolean) - Featured item flag (default: false)
- `userId` (string) - User identifier (default: "anonymous")

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "xyz789abc",
    "name": "Smartphone",
    "description": "Latest model smartphone",
    "price": 799.99,
    "category": "Electronics",
    "stock": 50,
    "featured": true,
    "userId": "user123",
    "createdAt": {"_seconds": 1234567890, "_nanoseconds": 0},
    "updatedAt": {"_seconds": 1234567890, "_nanoseconds": 0}
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "data": null,
  "error": "Name is required",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "data": null,
  "error": "API key is required",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### Update Item

Update an existing item.

**PUT** `/api/data/:id`

**Headers:**
```
Content-Type: application/json
x-api-key: your-secret-api-key-here
```

**Parameters:**
- `id` (path) - Document ID

**Request Body:**
```json
{
  "name": "Smartphone Pro",
  "description": "Updated description",
  "price": 899.99,
  "category": "Electronics",
  "stock": 45,
  "featured": false,
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "xyz789abc",
    "name": "Smartphone Pro",
    "description": "Updated description",
    "price": 899.99,
    "category": "Electronics",
    "stock": 45,
    "featured": false,
    "userId": "user123",
    "createdAt": {"_seconds": 1234567890, "_nanoseconds": 0},
    "updatedAt": {"_seconds": 1234567899, "_nanoseconds": 0}
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### Delete Item

Delete an item from the database.

**DELETE** `/api/data/:id`

**Headers:**
```
x-api-key: your-secret-api-key-here
```

**Parameters:**
- `id` (path) - Document ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "xyz789abc",
    "message": "Item deleted successfully"
  },
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### Get Items by Category

Retrieve all items in a specific category.

**GET** `/api/category/:category`

**Parameters:**
- `category` (path) - Category name

**Example:**
```
GET /api/category/Electronics
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "name": "Laptop",
      "category": "Electronics",
      "price": 999.99,
      ...
    },
    {
      "id": "def456",
      "name": "Smartphone",
      "category": "Electronics",
      "price": 799.99,
      ...
    }
  ],
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### Search Items

Search and filter items with multiple criteria.

**POST** `/api/search`

**Request Body:**
```json
{
  "query": "laptop",
  "category": "Electronics",
  "minPrice": 500,
  "maxPrice": 1500,
  "featured": true
}
```

**All fields are optional:**
- `query` (string) - Text search in name/description
- `category` (string) - Filter by category
- `minPrice` (number) - Minimum price
- `maxPrice` (number) - Maximum price
- `featured` (boolean) - Filter featured items

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "name": "Gaming Laptop",
      "description": "High-performance gaming laptop",
      "category": "Electronics",
      "price": 1299.99,
      "featured": true,
      ...
    }
  ],
  "error": null,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## WebSocket Real-time Updates

Connect to WebSocket for real-time data synchronization.

**WebSocket URL:**
```
ws://localhost:3000/ws
```

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onopen = () => {
  console.log('Connected to WebSocket');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};
```

### Message Types

#### Connection Confirmation
```json
{
  "type": "connected",
  "message": "Connected to Firebase real-time updates",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### Data Change Notification
```json
{
  "type": "data_change",
  "changeType": "added|modified|removed",
  "data": {
    "id": "abc123",
    "name": "New Item",
    ...
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Change Types

- **added**: New document created
- **modified**: Existing document updated
- **removed**: Document deleted

### Ping/Pong

Send ping to test connection:
```javascript
ws.send(JSON.stringify({ type: 'ping' }));
```

Response:
```json
{
  "type": "pong",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Error Codes

- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing API key)
- **403** - Forbidden (invalid API key or permission denied)
- **404** - Not Found
- **500** - Internal Server Error

## Rate Limiting

Firebase has the following limits:
- **Firestore**: 10,000 writes/day (free tier)
- **WebSocket**: No artificial limits

## Examples

### cURL Examples

**Get all items:**
```bash
curl http://localhost:3000/api/data
```

**Create item:**
```bash
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"name":"Laptop","price":999.99,"category":"Electronics"}'
```

**Update item:**
```bash
curl -X PUT http://localhost:3000/api/data/abc123 \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"name":"Gaming Laptop","price":1299.99}'
```

**Delete item:**
```bash
curl -X DELETE http://localhost:3000/api/data/abc123 \
  -H "x-api-key: your-api-key"
```

**Search items:**
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"category":"Electronics","minPrice":500,"maxPrice":1500}'
```

### JavaScript (Axios) Example

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'your-api-key'
  }
});

// Get all items
const items = await api.get('/data');

// Create item
const newItem = await api.post('/data', {
  name: 'Laptop',
  price: 999.99,
  category: 'Electronics'
});

// Update item
const updated = await api.put('/data/abc123', {
  price: 1099.99
});

// Delete item
await api.delete('/data/abc123');

// Search
const results = await api.post('/search', {
  category: 'Electronics',
  minPrice: 500
});
```
