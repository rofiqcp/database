# Elasticsearch Backend - Learning Module

Node.js + Express backend server for Elasticsearch database operations with full CRUD API.

## Features

- ✅ RESTful API with Express.js
- ✅ Elasticsearch with @elastic/elasticsearch driver
- ✅ Full CRUD operations
- ✅ Input validation
- ✅ Error handling
- ✅ CORS support
- ✅ Search and filter functionality
- ✅ Automatic index initialization

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: Elasticsearch (@elastic/elasticsearch)
- **Validation**: Validator
- **Environment**: Dotenv
- **Dev Tool**: Nodemon

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Elasticsearch 8.x running on localhost:9200

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env if needed (optional, defaults work fine)
```

## Configuration

Edit `.env` file:

```env
PORT=3000
NODE_ENV=development
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX=items
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
Returns all items from the index.

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

## Index Mappings

### Items Index
```json
{
  "properties": {
    "name": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
    "description": { "type": "text" },
    "category": { "type": "keyword" },
    "price": { "type": "float" },
    "quantity": { "type": "integer" },
    "created_at": { "type": "date" },
    "updated_at": { "type": "date" }
  }
}
```

## Project Structure

```
backend/
├── src/
│   ├── server.js       # Express app and server
│   ├── database.js     # Elasticsearch connection and initialization
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
curl http://localhost:3000/api/data/<document_id>

# Search
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "laptop"}'
```

## Building

No build step required for Node.js backend. Use `npm run build` for validation.

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### Elasticsearch Connection Refused
Ensure Elasticsearch is running on the configured node URL. Default: `http://localhost:9200`.

```bash
# Check Elasticsearch status
curl http://localhost:9200
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

MIT
