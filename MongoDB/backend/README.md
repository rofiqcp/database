# MongoDB Backend - Learning Module

Node.js + Express backend server for MongoDB database operations with full CRUD API.

## Features

- ✅ RESTful API with Express.js
- ✅ MongoDB database with official Node.js driver
- ✅ Full CRUD operations
- ✅ Input validation
- ✅ Error handling
- ✅ CORS support
- ✅ Search and filter functionality
- ✅ Automatic index creation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB (official driver)
- **Validation**: Validator
- **Environment**: Dotenv
- **Dev Tool**: Nodemon

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- MongoDB server running locally or remotely

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
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=learning_db
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
Returns a specific item by its MongoDB ObjectId.

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

## Document Structure

### Items Collection
```javascript
{
  _id: ObjectId("..."),       // Auto-generated MongoDB ObjectId
  name: "Item Name",          // Required
  description: "Description", // Optional
  category: "Category",       // Optional
  price: 99.99,               // Default: 0
  quantity: 10,                // Default: 0
  created_at: "ISO string",   // Auto-set on creation
  updated_at: "ISO string"    // Auto-updated on modification
}
```

## Project Structure

```
backend/
├── src/
│   ├── server.js       # Express app and server
│   ├── database.js     # MongoDB connection and initialization
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

# Get specific item (use valid ObjectId)
curl http://localhost:3000/api/data/65a1b2c3d4e5f6a7b8c9d0e1

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

### MongoDB Connection Failed
Ensure MongoDB is running:
```bash
# Check MongoDB status
mongosh --eval "db.runCommand({ ping: 1 })"

# Start MongoDB (Linux)
sudo systemctl start mongod

# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

MIT
