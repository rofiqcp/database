# Neo4j Backend

Backend server for the Neo4j Learning Module built with Node.js, Express, and the Neo4j JavaScript Driver.

## Prerequisites

- Node.js (v16 or higher)
- Neo4j Database (v4.4 or higher)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Neo4j credentials
```

3. Start Neo4j database and ensure it's running

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3000` by default.

## Environment Variables

- `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: Frontend URL for CORS (default: http://localhost:5173)
- `NEO4J_URI`: Neo4j connection URI (default: bolt://localhost:7687)
- `NEO4J_USER`: Neo4j username (default: neo4j)
- `NEO4J_PASSWORD`: Neo4j password (required)

## API Endpoints

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Categories & Tags
- `GET /api/categories` - Get all categories
- `GET /api/tags` - Get all tags

### Relationships
- `POST /api/items/:id/tags` - Add tag to item
- `DELETE /api/items/:id/tags/:tagId` - Remove tag from item
- `GET /api/items/:id/related` - Find related items

### Graph Operations
- `GET /api/graph/path/:fromId/:toId` - Find shortest path between items

### Other
- `GET /health` - Health check
- `POST /api/search` - Search items

## Features

- Graph database with nodes and relationships
- CRUD operations using Cypher queries
- Graph traversal and path finding
- Relationship management
- Input validation
- Error handling
- Request logging
