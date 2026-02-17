# API Documentation

Complete API reference for the Neo4j Learning Module backend.

## Base URL

```
http://localhost:3000/api
```

## Response Format

All endpoints return responses in this format:

```json
{
  "success": true/false,
  "data": {...} or [...],
  "error": "error message" (if success is false),
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Authentication

Currently, no authentication is required. This is a learning module.

---

## Items Endpoints

### Get All Items

**GET** `/items`

Returns all items with their relationships (categories and tags).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Laptop",
      "description": "High-performance laptop",
      "price": 999.99,
      "stock": 15,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "category": {
        "id": "uuid",
        "name": "Electronics"
      },
      "tags": [
        { "id": "uuid", "name": "tech" },
        { "id": "uuid", "name": "portable" }
      ]
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Cypher Query Used:**
```cypher
MATCH (i:Item)
OPTIONAL MATCH (i)-[:BELONGS_TO]->(c:Category)
OPTIONAL MATCH (i)-[:HAS_TAG]->(t:Tag)
RETURN i, c.id as categoryId, c.name as categoryName,
       collect(DISTINCT {id: t.id, name: t.name}) as tags
ORDER BY i.createdAt DESC
```

---

### Get Single Item

**GET** `/items/:id`

Returns a specific item by ID with all relationships.

**Parameters:**
- `id` (URL param) - Item UUID

**Response:** Same structure as single item in Get All Items

**Cypher Query Used:**
```cypher
MATCH (i:Item {id: $id})
OPTIONAL MATCH (i)-[:BELONGS_TO]->(c:Category)
OPTIONAL MATCH (i)-[:HAS_TAG]->(t:Tag)
RETURN i, c.id as categoryId, c.name as categoryName,
       collect(DISTINCT {id: t.id, name: t.name}) as tags
```

---

### Create Item

**POST** `/items`

Creates a new item with optional category and tags.

**Request Body:**
```json
{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "stock": 15,
  "category": {
    "id": "uuid (optional)",
    "name": "Electronics"
  },
  "tags": [
    { "id": "uuid (optional)", "name": "tech" },
    { "name": "portable" }
  ]
}
```

**Validation:**
- `name` - Required, non-empty string
- `price` - Optional, positive number (default: 0)
- `stock` - Optional, non-negative integer (default: 0)

**Response:** Created item with relationships

**Cypher Queries Used:**
```cypher
-- Create item
CREATE (i:Item {
  id: $id,
  name: $name,
  description: $description,
  price: $price,
  stock: $stock,
  createdAt: $createdAt,
  updatedAt: $updatedAt
})

-- Add category (if provided)
MERGE (c:Category {id: $categoryId, name: $categoryName})
CREATE (i)-[:BELONGS_TO]->(c)

-- Add tags (for each tag)
MATCH (i:Item {id: $itemId})
MERGE (t:Tag {id: $tagId, name: $tagName})
CREATE (i)-[:HAS_TAG]->(t)
```

---

### Update Item

**PUT** `/items/:id`

Updates an existing item. Can update category relationship.

**Parameters:**
- `id` (URL param) - Item UUID

**Request Body:**
```json
{
  "name": "Updated Laptop",
  "description": "New description",
  "price": 899.99,
  "stock": 20,
  "category": {
    "name": "Computers"
  }
}
```

**Response:** Updated item with relationships

**Cypher Queries Used:**
```cypher
-- Update properties
MATCH (i:Item {id: $id})
SET i.name = $name,
    i.description = $description,
    i.price = $price,
    i.stock = $stock,
    i.updatedAt = $updatedAt

-- Update category
MATCH (i:Item {id: $id})
OPTIONAL MATCH (i)-[r:BELONGS_TO]->()
DELETE r
WITH i
MERGE (c:Category {id: $categoryId, name: $categoryName})
CREATE (i)-[:BELONGS_TO]->(c)
```

---

### Delete Item

**DELETE** `/items/:id`

Deletes an item and all its relationships.

**Parameters:**
- `id` (URL param) - Item UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Item deleted successfully"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Cypher Query Used:**
```cypher
MATCH (i:Item {id: $id})
DETACH DELETE i
```

---

## Categories Endpoints

### Get All Categories

**GET** `/categories`

Returns all categories with item count.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Electronics",
      "itemCount": 15
    }
  ]
}
```

**Cypher Query Used:**
```cypher
MATCH (c:Category)
OPTIONAL MATCH (c)<-[:BELONGS_TO]-(i:Item)
RETURN c, count(i) as itemCount
ORDER BY c.name
```

---

## Tags Endpoints

### Get All Tags

**GET** `/tags`

Returns all tags with item count.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "tech",
      "itemCount": 25
    }
  ]
}
```

**Cypher Query Used:**
```cypher
MATCH (t:Tag)
OPTIONAL MATCH (t)<-[:HAS_TAG]-(i:Item)
RETURN t, count(i) as itemCount
ORDER BY t.name
```

---

## Relationship Endpoints

### Add Tag to Item

**POST** `/items/:id/tags`

Creates a HAS_TAG relationship between an item and a tag.

**Parameters:**
- `id` (URL param) - Item UUID

**Request Body:**
```json
{
  "tagId": "uuid (optional)",
  "tagName": "tech"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "tech"
  },
  "error": "Tag added successfully"
}
```

**Cypher Query Used:**
```cypher
MATCH (i:Item {id: $itemId})
MERGE (t:Tag {id: $tagId, name: $tagName})
MERGE (i)-[:HAS_TAG]->(t)
```

---

### Remove Tag from Item

**DELETE** `/items/:id/tags/:tagId`

Removes the HAS_TAG relationship between an item and a tag.

**Parameters:**
- `id` (URL param) - Item UUID
- `tagId` (URL param) - Tag UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Tag removed successfully"
  }
}
```

**Cypher Query Used:**
```cypher
MATCH (i:Item {id: $itemId})-[r:HAS_TAG]->(t:Tag {id: $tagId})
DELETE r
```

---

## Graph Traversal Endpoints

### Get Related Items

**GET** `/items/:id/related`

Finds items related to a given item through shared tags or same category.

**Parameters:**
- `id` (URL param) - Item UUID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Related Item",
      "price": 49.99,
      "relationScore": 3,
      "relationReasons": ["shared tags", "same category"]
    }
  ]
}
```

**Cypher Query Used:**
```cypher
MATCH (i:Item {id: $id})
OPTIONAL MATCH (i)-[:HAS_TAG]->(t:Tag)<-[:HAS_TAG]-(related:Item)
WHERE related.id <> $id
WITH i, related, count(t) as sharedTags
OPTIONAL MATCH (i)-[:BELONGS_TO]->(c:Category)<-[:BELONGS_TO]-(related2:Item)
WHERE related2.id <> $id
WITH collect(DISTINCT {item: related, score: sharedTags, reason: 'shared tags'}) +
     collect(DISTINCT {item: related2, score: 1, reason: 'same category'}) as allRelated
UNWIND allRelated as rel
WITH rel.item as item, sum(rel.score) as totalScore, collect(rel.reason) as reasons
WHERE item IS NOT NULL
RETURN DISTINCT item, totalScore, reasons
ORDER BY totalScore DESC
LIMIT 10
```

---

### Find Shortest Path

**GET** `/graph/path/:fromId/:toId`

Finds the shortest path between two items in the graph.

**Parameters:**
- `fromId` (URL param) - Starting item UUID
- `toId` (URL param) - Ending item UUID

**Response (Path Found):**
```json
{
  "success": true,
  "data": {
    "found": true,
    "pathLength": 3,
    "nodes": [
      { "id": "uuid1", "name": "Item A" },
      { "id": "uuid2", "name": "Tag X" },
      { "id": "uuid3", "name": "Item B" }
    ],
    "relationships": [
      { "type": "HAS_TAG", "from": "uuid1", "to": "uuid2" },
      { "type": "HAS_TAG", "from": "uuid3", "to": "uuid2" }
    ]
  }
}
```

**Response (No Path):**
```json
{
  "success": true,
  "data": {
    "found": false,
    "message": "No path found between these items"
  }
}
```

**Cypher Query Used:**
```cypher
MATCH (from:Item {id: $fromId}), (to:Item {id: $toId})
MATCH path = shortestPath((from)-[*]-(to))
RETURN path, length(path) as pathLength
```

---

## Search Endpoint

### Search Items

**POST** `/search`

Search and filter items using multiple criteria.

**Request Body:**
```json
{
  "query": "laptop",
  "category": "Electronics",
  "tags": ["tech", "portable"],
  "minPrice": 100,
  "maxPrice": 1000
}
```

**All fields are optional.**

**Response:** Array of matching items with relationships

**Cypher Query Used:**
```cypher
MATCH (i:Item)
[OPTIONAL category match if provided]
[OPTIONAL tags match if provided]
WHERE [all conditions]
OPTIONAL MATCH (i)-[:BELONGS_TO]->(cat:Category)
OPTIONAL MATCH (i)-[:HAS_TAG]->(tag:Tag)
RETURN DISTINCT i, cat.id as categoryId, cat.name as categoryName,
       collect(DISTINCT {id: tag.id, name: tag.name}) as tags
ORDER BY i.createdAt DESC
```

---

## Health Check

### Health Status

**GET** `/health`

Returns server health status.

**Response:**
```json
{
  "status": "OK",
  "database": "Neo4j",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "data": null,
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common Error Status Codes

- `400` - Bad Request (validation error)
- `404` - Not Found (item doesn't exist)
- `500` - Internal Server Error (database error)

### Example Validation Error

```json
{
  "success": false,
  "error": "Name is required, Price must be a positive number",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
