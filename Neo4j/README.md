# Neo4j Learning Module

A comprehensive full-stack application demonstrating Neo4j graph database capabilities with Node.js, Express, Vue 3, and modern web technologies.

## Overview

This learning module showcases:
- **Graph Database**: Neo4j with nodes and relationships
- **Backend**: Node.js + Express + Neo4j Driver
- **Frontend**: Vue 3 + Vite + Pinia + TailwindCSS
- **Graph Operations**: CRUD, traversals, path finding, relationship management

## Features

### Graph Database Features
- ✅ **Nodes**: Item, Category, Tag
- ✅ **Relationships**: BELONGS_TO, HAS_TAG
- ✅ **Graph Traversals**: Find related items through connections
- ✅ **Shortest Path**: Discover paths between items
- ✅ **Pattern Matching**: Powerful Cypher queries
- ✅ **Constraints & Indexes**: Data integrity and performance

### Backend Features
- ✅ Full CRUD operations for items
- ✅ Relationship management (add/remove tags, change category)
- ✅ Graph traversal endpoints (related items, path finding)
- ✅ Advanced search with filters
- ✅ Input validation
- ✅ Error handling
- ✅ Session management

### Frontend Features
- ✅ Modern Vue 3 Composition API
- ✅ Pinia state management
- ✅ TailwindCSS styling
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Graph visualization (text-based)
- ✅ Relationship management UI
- ✅ Path finding interface

## Quick Start

### Prerequisites

- Node.js v16 or higher
- Neo4j Desktop or Neo4j Server v4.4+

### Setup Neo4j

1. **Install Neo4j Desktop** (recommended for learning)
   - Download from https://neo4j.com/download/
   - Create a new database
   - Set a password (remember this!)
   - Start the database

2. **Configure Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your Neo4j credentials
   npm run dev
   ```

3. **Configure Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Neo4j Browser: http://localhost:7474

## Project Structure

```
Neo4j/
├── backend/
│   ├── src/
│   │   ├── server.js        # Express server setup
│   │   ├── database.js      # Neo4j driver configuration
│   │   └── routes.js        # API endpoints and Cypher queries
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Vue components
│   │   │   ├── DataTable.vue
│   │   │   ├── CreateForm.vue
│   │   │   ├── EditForm.vue
│   │   │   ├── DetailView.vue
│   │   │   ├── SearchFilter.vue
│   │   │   └── GraphView.vue
│   │   ├── stores/
│   │   │   └── dataStore.js # Pinia state management
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── api.js
│   │   └── style.css
│   ├── package.json
│   └── index.html
├── docs/
│   ├── SETUP.md             # Installation guide
│   ├── API_DOCS.md          # API reference
│   ├── DATABASE_INFO.md     # Graph database concepts
│   ├── FEATURES.md          # Advanced features
│   └── TROUBLESHOOTING.md   # Common issues
├── examples/
│   ├── sample_data.json     # 50 sample items
│   └── query_examples.txt   # 70+ Cypher queries
└── README.md
```

## API Endpoints

### Items
- `GET /api/items` - Get all items with relationships
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Categories & Tags
- `GET /api/categories` - List all categories
- `GET /api/tags` - List all tags

### Relationships
- `POST /api/items/:id/tags` - Add tag to item
- `DELETE /api/items/:id/tags/:tagId` - Remove tag

### Graph Operations
- `GET /api/items/:id/related` - Find related items
- `GET /api/graph/path/:fromId/:toId` - Find shortest path

### Search
- `POST /api/search` - Search items with filters

## Graph Schema

```
┌─────────┐                    ┌──────────┐
│  Item   │──[BELONGS_TO]──────▶│ Category │
│         │                    │          │
└─────────┘                    └──────────┘
     │
     │
     │[HAS_TAG]
     │
     ▼
┌─────────┐
│   Tag   │
│         │
└─────────┘
```

### Node Properties

**Item**
- id (UUID)
- name (String)
- description (String)
- price (Float)
- stock (Integer)
- createdAt (DateTime)
- updatedAt (DateTime)

**Category**
- id (UUID)
- name (String)

**Tag**
- id (UUID)
- name (String)

## Example Cypher Queries

### Create an Item with Relationships
```cypher
CREATE (i:Item {
  id: randomUUID(),
  name: 'Gaming Laptop',
  description: 'High-performance laptop',
  price: 1299.99,
  stock: 15,
  createdAt: datetime()
})
MERGE (c:Category {name: 'Electronics'})
MERGE (t1:Tag {name: 'gaming'})
MERGE (t2:Tag {name: 'tech'})
CREATE (i)-[:BELONGS_TO]->(c)
CREATE (i)-[:HAS_TAG]->(t1)
CREATE (i)-[:HAS_TAG]->(t2)
RETURN i
```

### Find Related Items
```cypher
MATCH (i:Item {name: 'Gaming Laptop'})-[:HAS_TAG]->(t:Tag)<-[:HAS_TAG]-(related:Item)
WHERE i <> related
RETURN DISTINCT related.name, collect(t.name) as sharedTags
ORDER BY size(sharedTags) DESC
```

### Find Shortest Path
```cypher
MATCH (i1:Item {name: 'Gaming Laptop'}), (i2:Item {name: 'Wireless Mouse'})
MATCH path = shortestPath((i1)-[*]-(i2))
RETURN path, length(path) as hops
```

## Documentation

- **[Setup Guide](docs/SETUP.md)** - Complete installation instructions
- **[API Documentation](docs/API_DOCS.md)** - All endpoints with examples
- **[Database Info](docs/DATABASE_INFO.md)** - Graph concepts and Cypher
- **[Features](docs/FEATURES.md)** - Advanced features and algorithms
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## Sample Data

Load sample data from `examples/sample_data.json`:

```bash
# Using the API
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d @examples/sample_data.json
```

Or in Neo4j Browser, try queries from `examples/query_examples.txt`.

## Learning Resources

### Neo4j Resources
- [Neo4j Documentation](https://neo4j.com/docs/)
- [Cypher Manual](https://neo4j.com/docs/cypher-manual/)
- [Graph Academy](https://graphacademy.neo4j.com/)

### This Module
- Start with basic CRUD operations
- Explore relationship management
- Try graph traversals and path finding
- Experiment with Cypher queries
- Build your own graph patterns

## Key Concepts

### Graph vs Relational
- **Graph**: Natural for connected data, no joins needed
- **Relationships**: First-class citizens with properties
- **Traversals**: Follow relationships efficiently
- **Pattern Matching**: Expressive Cypher syntax

### When to Use Neo4j
- Social networks
- Recommendation engines
- Fraud detection
- Network analysis
- Knowledge graphs
- Route optimization

## Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-reload on changes
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot module replacement
```

### Build for Production
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## Testing

### Test Backend Health
```bash
curl http://localhost:3000/health
```

### Test Create Item
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "description": "Testing",
    "price": 9.99,
    "stock": 10
  }'
```

### Verify in Neo4j Browser
```cypher
MATCH (i:Item)
RETURN i
LIMIT 10
```

## Troubleshooting

### Connection Issues
- Verify Neo4j is running
- Check credentials in `.env`
- Ensure port 7687 is accessible

### See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for more help

## Contributing

This is a learning module. Feel free to:
- Experiment with the code
- Add new features
- Try different graph patterns
- Extend the schema

## License

MIT

## Additional Notes

### Graph Database Benefits
- **Performance**: O(1) relationship traversals
- **Flexibility**: Easy schema evolution
- **Intuitiveness**: Models match real-world relationships
- **ACID**: Full transaction support

### Next Steps
1. Complete the [Setup Guide](docs/SETUP.md)
2. Explore the API with [API_DOCS.md](docs/API_DOCS.md)
3. Learn graph concepts in [DATABASE_INFO.md](docs/DATABASE_INFO.md)
4. Try example queries in `examples/query_examples.txt`
5. Build your own graph application!

---

**Happy Graph Learning! 🚀**
