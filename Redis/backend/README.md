# Redis Backend - Learning Module

Node.js + Express backend API for the Redis learning module with full CRUD operations.

## Features

- ✅ Express.js REST API
- ✅ Redis key-value data storage
- ✅ Full CRUD operations
- ✅ Search and filter
- ✅ Input validation
- ✅ CORS support
- ✅ Error handling
- ✅ Environment configuration
- ✅ Auto-incrementing IDs via Redis counter
- ✅ JSON serialization for structured data

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: Redis (via node-redis ^4.6.12)
- **Validation**: Validator
- **Environment**: Dotenv
- **Dev Tools**: Nodemon

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Redis server running on localhost:6379

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env if needed (defaults work for local development)
```

## Configuration

Edit `.env` file:

```env
PORT=3000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server runs on `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data` | Get all items |
| GET | `/api/data/:id` | Get single item |
| POST | `/api/data` | Create new item |
| PUT | `/api/data/:id` | Update item |
| DELETE | `/api/data/:id` | Delete item |
| POST | `/api/search` | Search/filter items |
| GET | `/health` | Health check |

## Data Storage Pattern

Redis is a key-value store, so structured data is stored as:

- **Item data**: `item:{id}` → JSON string
- **ID counter**: `item:counter` → auto-incrementing integer
- **Item index**: `items:index` → Redis Set of all item IDs

```
item:1  →  '{"id":1,"name":"Laptop","price":1299.99,...}'
item:2  →  '{"id":2,"name":"Mouse","price":29.99,...}'
item:counter  →  2
items:index  →  {1, 2}
```

## Testing

```bash
# Health check
curl http://localhost:3000/health

# Get all items
curl http://localhost:3000/api/data

# Create item
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","price":99.99}'
```

## Troubleshooting

### Redis Connection Failed
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Start Redis (Linux)
sudo systemctl start redis

# Start Redis (macOS with Homebrew)
brew services start redis

# Start Redis (Docker)
docker run -d -p 6379:6379 redis
```

### Port Already in Use
```bash
lsof -i :3000
kill -9 <PID>
```

### Dependencies Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## License

MIT
