# Neo4j Database Information

Understanding Neo4j graph database concepts and structure.

## What is Neo4j?

Neo4j is a **graph database** that stores data as nodes and relationships instead of tables. It excels at managing and querying highly connected data.

### Key Differences from Relational Databases

| Relational DB | Neo4j Graph DB |
|---------------|----------------|
| Tables | Nodes (labeled) |
| Rows | Node instances |
| Joins | Relationships |
| Foreign Keys | Direct relationships |
| SQL | Cypher Query Language |

## Graph Components

### 1. Nodes

Nodes represent entities in your data model. In this module, we have three types of nodes:

#### Item Node
```cypher
(:Item {
  id: "uuid",
  name: "Laptop",
  description: "High-performance laptop",
  price: 999.99,
  stock: 15,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
})
```

**Properties:**
- `id` (String) - Unique identifier (UUID)
- `name` (String) - Item name
- `description` (String) - Item description
- `price` (Float) - Item price
- `stock` (Integer) - Available quantity
- `createdAt` (String) - ISO timestamp
- `updatedAt` (String) - ISO timestamp

#### Category Node
```cypher
(:Category {
  id: "uuid",
  name: "Electronics"
})
```

**Properties:**
- `id` (String) - Unique identifier
- `name` (String) - Category name

#### Tag Node
```cypher
(:Tag {
  id: "uuid",
  name: "tech"
})
```

**Properties:**
- `id` (String) - Unique identifier
- `name` (String) - Tag name

### 2. Relationships

Relationships connect nodes and represent associations.

#### BELONGS_TO Relationship
```cypher
(item:Item)-[:BELONGS_TO]->(category:Category)
```

An item belongs to a category. This is a one-to-one relationship from the item's perspective.

**Example:**
```cypher
(:Item {name: "Laptop"})-[:BELONGS_TO]->(:Category {name: "Electronics"})
```

#### HAS_TAG Relationship
```cypher
(item:Item)-[:HAS_TAG]->(tag:Tag)
```

An item can have multiple tags. This is a one-to-many relationship.

**Example:**
```cypher
(:Item {name: "Laptop"})-[:HAS_TAG]->(:Tag {name: "tech"})
(:Item {name: "Laptop"})-[:HAS_TAG]->(:Tag {name: "portable"})
```

### 3. Graph Schema

Complete schema visualization:

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

### Additional Relationship Possibilities

While not implemented in this basic module, Neo4j supports many relationship patterns:

```cypher
-- Tags can be related to each other
(:Tag)-[:RELATED_TO]->(:Tag)

-- Categories can have subcategories
(:Category)-[:SUBCATEGORY_OF]->(:Category)

-- Items can be related directly
(:Item)-[:SIMILAR_TO]->(:Item)
```

## Constraints

Constraints ensure data integrity.

### Unique Constraints

```cypher
-- Ensures Item IDs are unique
CREATE CONSTRAINT item_id_unique IF NOT EXISTS
FOR (i:Item) REQUIRE i.id IS UNIQUE

-- Ensures Category IDs are unique
CREATE CONSTRAINT category_id_unique IF NOT EXISTS
FOR (c:Category) REQUIRE c.id IS UNIQUE

-- Ensures Tag IDs are unique
CREATE CONSTRAINT tag_id_unique IF NOT EXISTS
FOR (t:Tag) REQUIRE t.id IS UNIQUE
```

**Why constraints matter:**
- Prevent duplicate IDs
- Improve query performance
- Enforce data integrity
- Enable faster lookups

## Indexes

Indexes speed up queries by creating lookup structures.

### Property Indexes

```cypher
-- Index on Item name for fast text search
CREATE INDEX item_name_index IF NOT EXISTS
FOR (i:Item) ON (i.name)

-- Index on Category name
CREATE INDEX category_name_index IF NOT EXISTS
FOR (c:Category) ON (c.name)

-- Index on Tag name
CREATE INDEX tag_name_index IF NOT EXISTS
FOR (t:Tag) ON (t.name)
```

**When to use indexes:**
- Frequently searched properties
- Properties used in WHERE clauses
- Properties used for sorting

## Cypher Query Language

Cypher is Neo4j's query language, designed for pattern matching.

### Basic Patterns

#### Create a Node
```cypher
CREATE (i:Item {
  id: "123",
  name: "Laptop",
  price: 999.99
})
```

#### Match a Node
```cypher
MATCH (i:Item {name: "Laptop"})
RETURN i
```

#### Create a Relationship
```cypher
MATCH (i:Item {name: "Laptop"})
MATCH (c:Category {name: "Electronics"})
CREATE (i)-[:BELONGS_TO]->(c)
```

#### Match a Pattern
```cypher
MATCH (i:Item)-[:BELONGS_TO]->(c:Category)
WHERE c.name = "Electronics"
RETURN i.name, i.price
```

### Advanced Patterns

#### Find Related Items
```cypher
MATCH (i:Item {name: "Laptop"})-[:HAS_TAG]->(t:Tag)<-[:HAS_TAG]-(related:Item)
RETURN related.name
```

This finds items that share tags with "Laptop".

#### Shortest Path
```cypher
MATCH (i1:Item {name: "Laptop"}), (i2:Item {name: "Phone"})
MATCH path = shortestPath((i1)-[*]-(i2))
RETURN path
```

The `*` means "any number of relationships of any type".

#### Aggregations
```cypher
MATCH (c:Category)<-[:BELONGS_TO]-(i:Item)
RETURN c.name, count(i) as itemCount
ORDER BY itemCount DESC
```

## Graph Algorithms

Neo4j provides built-in graph algorithms for analysis.

### Path Finding

- **Shortest Path**: Find the shortest connection between nodes
- **All Shortest Paths**: Find all shortest paths
- **Dijkstra**: Weighted shortest path

### Centrality

- **PageRank**: Identify important nodes
- **Betweenness**: Find nodes that bridge communities
- **Closeness**: Measure how close a node is to all others

### Community Detection

- **Louvain**: Detect communities in the graph
- **Label Propagation**: Fast community detection

## Data Model Best Practices

### 1. Use Meaningful Labels
```cypher
-- Good
(:Item), (:Category), (:Tag)

-- Avoid
(:Node1), (:Data), (:Thing)
```

### 2. Use Descriptive Relationship Types
```cypher
-- Good
-[:BELONGS_TO]->
-[:HAS_TAG]->

-- Avoid
-[:RELATED]->
-[:CONNECTED]->
```

### 3. Store Properties on Nodes
```cypher
-- Good: Properties on Item node
(:Item {name: "Laptop", price: 999.99})

-- Avoid: Creating nodes for simple values
(:Item)-[:HAS_PRICE]->(:Price {value: 999.99})
```

### 4. Use Constraints for Uniqueness
Always create unique constraints on ID fields.

### 5. Index Frequently Queried Properties
Create indexes on properties used in WHERE clauses.

## Performance Considerations

### Query Optimization

1. **Use MATCH instead of WHERE when possible**
```cypher
-- Optimized
MATCH (i:Item {name: "Laptop"})

-- Less optimal
MATCH (i:Item)
WHERE i.name = "Laptop"
```

2. **Use OPTIONAL MATCH for optional patterns**
```cypher
MATCH (i:Item)
OPTIONAL MATCH (i)-[:BELONGS_TO]->(c:Category)
RETURN i, c
```

3. **Limit results when appropriate**
```cypher
MATCH (i:Item)
RETURN i
LIMIT 100
```

### Relationship Direction

Relationships have direction but can be traversed both ways:

```cypher
-- Forward
MATCH (i:Item)-[:BELONGS_TO]->(c:Category)

-- Backward
MATCH (i:Item)<-[:BELONGS_TO]-(c:Category)

-- Either direction
MATCH (i:Item)-[:BELONGS_TO]-(c:Category)
```

## Transactions

Neo4j is ACID-compliant with full transaction support.

### In the Node.js Driver

```javascript
const session = driver.session();
const tx = session.beginTransaction();

try {
  await tx.run('CREATE (i:Item {name: $name})', { name: 'Laptop' });
  await tx.run('CREATE (c:Category {name: $name})', { name: 'Electronics' });
  await tx.commit();
} catch (error) {
  await tx.rollback();
  throw error;
} finally {
  await session.close();
}
```

### Automatic Transactions

In this module, we use automatic transactions (single queries):

```javascript
const result = await executeQuery('MATCH (i:Item) RETURN i');
```

Each query runs in its own transaction.

## Backup and Restore

### Export Data

```cypher
-- Export all nodes and relationships
CALL apoc.export.cypher.all("backup.cypher", {})
```

### Import Data

```cypher
-- Run exported Cypher file
:source backup.cypher
```

Note: Requires APOC plugin.

## Monitoring

### View Database Info

```cypher
-- Count all nodes
MATCH (n)
RETURN count(n)

-- Count by label
MATCH (n:Item)
RETURN count(n)

-- Count relationships
MATCH ()-[r]->()
RETURN count(r)
```

### View Schema

```cypher
CALL db.schema.visualization()
```

## Learning Resources

- **Neo4j Documentation**: https://neo4j.com/docs/
- **Cypher Manual**: https://neo4j.com/docs/cypher-manual/
- **Graph Academy**: https://graphacademy.neo4j.com/
- **Cypher Cheat Sheet**: https://neo4j.com/docs/cypher-cheat-sheet/
