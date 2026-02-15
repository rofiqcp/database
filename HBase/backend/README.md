# HBase Backend - Learning Module

Node.js + Express backend API for the HBase learning module.

## Features

- ✅ Express.js REST API
- ✅ HBase column-family emulator for learning
- ✅ Full CRUD operations
- ✅ Search and filter
- ✅ Input validation
- ✅ Error handling
- ✅ CORS support

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: HBase (emulated for learning)
- **Validation**: Validator
- **ID Generation**: UUID v4
- **Environment**: Dotenv
- **Dev Tools**: Nodemon

## Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

## Environment Variables

```env
PORT=3000
NODE_ENV=development
HBASE_REST_URL=http://localhost:8080
HBASE_TABLE=items
HBASE_NAMESPACE=learning
CORS_ORIGIN=http://localhost:5173
```

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

## HBase Column Family Model

Items are stored using HBase's column-family model:

### Column Family: `info`
| Qualifier | Type | Description |
|-----------|------|-------------|
| name | String | Item name (required) |
| description | String | Item description |
| category | String | Item category |

### Column Family: `meta`
| Qualifier | Type | Description |
|-----------|------|-------------|
| price | Number | Item price |
| quantity | Integer | Stock quantity |
| created_at | Timestamp | Creation time |
| updated_at | Timestamp | Last update time |

## Row Key Design

- Row keys use UUID v4 for uniqueness
- In production HBase, row key design is critical for performance
- Consider composite keys: `<category>_<reverse_timestamp>_<uuid>`

## Project Structure

```
backend/
├── src/
│   ├── server.js      # Express app and server
│   ├── database.js    # HBase emulator
│   └── routes.js      # API routes
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Scripts

```bash
npm run dev    # Start with nodemon (hot reload)
npm start      # Start in production mode
npm run build  # Validation step
```

## Testing API

```bash
# Health check
curl http://localhost:3000/health

# Create item
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","price":99.99,"quantity":10}'

# Get all items
curl http://localhost:3000/api/data
```

## About the Emulator

This module uses an in-memory HBase emulator for learning purposes. The emulator faithfully replicates HBase's column-family storage model:

- **Tables** with named column families
- **Row keys** as primary identifiers
- **Column qualifiers** within families
- **Timestamps** on each cell

In production, replace the emulator with actual HBase REST API calls using axios.

## Troubleshooting

### Server won't start
```bash
node --check src/server.js
npm install
```

### Port in use
```bash
lsof -i :3000
kill -9 <PID>
```

## License

MIT
