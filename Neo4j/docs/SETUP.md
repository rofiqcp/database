# Neo4j Setup Guide

This guide will help you set up Neo4j and configure the learning module.

## Prerequisites

- Node.js v16 or higher
- Neo4j Desktop or Neo4j Server v4.4+

## Option 1: Neo4j Desktop (Recommended for Learning)

### Installation

1. **Download Neo4j Desktop**
   - Visit https://neo4j.com/download/
   - Download Neo4j Desktop for your operating system
   - Install and launch Neo4j Desktop

2. **Create a New Project**
   - Click "New Project" in Neo4j Desktop
   - Give it a name like "Neo4j Learning Module"

3. **Create a Database**
   - Click "Add Database" → "Create a Local Database"
   - Name: `learning-db`
   - Password: Choose a secure password (remember this!)
   - Version: 4.4 or later
   - Click "Create"

4. **Start the Database**
   - Click "Start" on your database
   - Wait for it to show "Active"
   - Note the connection details (usually `bolt://localhost:7687`)

### Access Neo4j Browser

1. Click "Open" next to your database
2. This opens Neo4j Browser in your web browser
3. Login with username `neo4j` and your password
4. You can now run Cypher queries directly

## Option 2: Neo4j Server (Docker)

### Using Docker

```bash
# Pull Neo4j image
docker pull neo4j:latest

# Run Neo4j container
docker run \
  --name neo4j-learning \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/your_password \
  -v $HOME/neo4j/data:/data \
  neo4j:latest
```

### Access

- Neo4j Browser: http://localhost:7474
- Bolt connection: bolt://localhost:7687
- Username: `neo4j`
- Password: `your_password`

## Option 3: Neo4j Aura (Cloud)

1. Visit https://neo4j.com/cloud/aura/
2. Create a free account
3. Create a new database
4. Save the connection URI, username, and password
5. Use these credentials in your `.env` file

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Update the following in `.env`:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password_here
```

### 3. Verify Connection

Start the backend server:

```bash
npm run dev
```

You should see:
```
✓ Connected to Neo4j database
✓ Database schema initialized (constraints and indexes created)
🚀 Neo4j Backend Server running on http://localhost:3000
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

The default configuration should work if backend is on port 3000.

### 3. Start Development Server

```bash
npm run dev
```

Frontend will be available at http://localhost:5173

## Verification

### Test Backend Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "database": "Neo4j",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test Creating an Item

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Item",
    "description": "Testing Neo4j connection",
    "price": 9.99,
    "stock": 10
  }'
```

### Check in Neo4j Browser

Run this Cypher query in Neo4j Browser:

```cypher
MATCH (i:Item)
RETURN i
```

You should see your test item!

## Troubleshooting

### Connection Refused

- Verify Neo4j is running
- Check that port 7687 is accessible
- Confirm credentials in `.env` are correct

### Authentication Failed

- Verify username and password
- Default username is always `neo4j`
- Password is what you set during database creation

### Schema Errors

If you see constraint errors, the schema may already exist. This is normal on restart.

### Port Already in Use

If port 3000 or 5173 is in use:
- Change PORT in backend `.env`
- Update VITE_API_URL in frontend `.env`

## Next Steps

1. Explore the API endpoints in [API_DOCS.md](./API_DOCS.md)
2. Learn about Neo4j graph concepts in [DATABASE_INFO.md](./DATABASE_INFO.md)
3. Try the example queries in [../examples/query_examples.txt](../examples/query_examples.txt)
4. Load sample data from [../examples/sample_data.json](../examples/sample_data.json)

## Additional Resources

- Neo4j Documentation: https://neo4j.com/docs/
- Cypher Query Language: https://neo4j.com/docs/cypher-manual/
- Neo4j Browser Guide: https://neo4j.com/docs/browser-manual/
- Neo4j Driver Documentation: https://neo4j.com/docs/javascript-manual/
