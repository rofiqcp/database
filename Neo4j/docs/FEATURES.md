# Neo4j Features

Advanced features and capabilities of Neo4j graph database.

## Graph-Specific Features

### 1. Pattern Matching

Neo4j's killer feature is pattern matching using Cypher.

#### Simple Patterns
```cypher
-- Find all items in Electronics category
MATCH (i:Item)-[:BELONGS_TO]->(c:Category {name: "Electronics"})
RETURN i
```

#### Complex Patterns
```cypher
-- Find items with specific tags in specific categories
MATCH (i:Item)-[:BELONGS_TO]->(c:Category)
WHERE c.name IN ["Electronics", "Computers"]
MATCH (i)-[:HAS_TAG]->(t:Tag)
WHERE t.name IN ["tech", "gaming"]
RETURN i.name, c.name, collect(t.name) as tags
```

#### Variable Length Paths
```cypher
-- Find items connected within 1-3 hops
MATCH (i1:Item)-[*1..3]-(i2:Item)
WHERE i1.id = "some-id"
RETURN DISTINCT i2
```

### 2. Graph Traversals

#### Depth-First Search
```cypher
MATCH path = (start:Item)-[:HAS_TAG*]->(end:Tag)
WHERE start.name = "Laptop"
RETURN path
```

#### Breadth-First Search
```cypher
MATCH (start:Item {name: "Laptop"})
CALL apoc.path.expand(start, "HAS_TAG|BELONGS_TO>", null, 1, 3)
YIELD path
RETURN path
```

Note: Requires APOC plugin.

### 3. Shortest Path Algorithms

#### Single Shortest Path
```cypher
MATCH (start:Item {name: "Laptop"}), (end:Item {name: "Phone"})
MATCH path = shortestPath((start)-[*]-(end))
RETURN path, length(path) as hops
```

#### All Shortest Paths
```cypher
MATCH (start:Item {name: "Laptop"}), (end:Item {name: "Phone"})
MATCH paths = allShortestPaths((start)-[*]-(end))
RETURN paths
```

#### Weighted Shortest Path (Dijkstra)
```cypher
MATCH (start:Item {name: "Laptop"}), (end:Item {name: "Phone"})
CALL gds.shortestPath.dijkstra.stream({
  nodeProjection: 'Item',
  relationshipProjection: 'HAS_TAG',
  sourceNode: start,
  targetNode: end
})
YIELD path
RETURN path
```

Note: Requires Graph Data Science library.

### 4. Aggregations and Grouping

#### Count Items per Category
```cypher
MATCH (c:Category)<-[:BELONGS_TO]-(i:Item)
RETURN c.name as category, count(i) as itemCount
ORDER BY itemCount DESC
```

#### Average Price by Category
```cypher
MATCH (c:Category)<-[:BELONGS_TO]-(i:Item)
RETURN c.name as category, avg(i.price) as avgPrice
ORDER BY avgPrice DESC
```

#### Tag Co-occurrence
```cypher
MATCH (t1:Tag)<-[:HAS_TAG]-(i:Item)-[:HAS_TAG]->(t2:Tag)
WHERE t1.name < t2.name
RETURN t1.name, t2.name, count(i) as cooccurrence
ORDER BY cooccurrence DESC
```

## Indexes

### Types of Indexes

#### 1. B-tree Index (Default)
```cypher
CREATE INDEX item_name_btree IF NOT EXISTS
FOR (i:Item) ON (i.name)
```

Best for: Exact matches, range queries

#### 2. Text Index (Full-text Search)
```cypher
CREATE FULLTEXT INDEX item_search IF NOT EXISTS
FOR (i:Item) ON EACH [i.name, i.description]
```

Usage:
```cypher
CALL db.index.fulltext.queryNodes("item_search", "laptop gaming")
YIELD node, score
RETURN node.name, score
ORDER BY score DESC
```

#### 3. Composite Index
```cypher
CREATE INDEX item_name_price IF NOT EXISTS
FOR (i:Item) ON (i.name, i.price)
```

Best for: Queries filtering on multiple properties

### Index Management

#### List All Indexes
```cypher
SHOW INDEXES
```

#### Drop an Index
```cypher
DROP INDEX item_name_btree IF EXISTS
```

#### Check Index Usage
```cypher
PROFILE MATCH (i:Item {name: "Laptop"}) RETURN i
```

Look for "NodeIndexSeek" in the plan.

## Constraints

### Types of Constraints

#### 1. Unique Constraint
```cypher
CREATE CONSTRAINT item_id_unique IF NOT EXISTS
FOR (i:Item) REQUIRE i.id IS UNIQUE
```

Automatically creates an index.

#### 2. Property Existence Constraint (Enterprise)
```cypher
CREATE CONSTRAINT item_name_exists IF NOT EXISTS
FOR (i:Item) REQUIRE i.name IS NOT NULL
```

#### 3. Node Key Constraint (Enterprise)
```cypher
CREATE CONSTRAINT item_key IF NOT EXISTS
FOR (i:Item) REQUIRE (i.name, i.createdAt) IS NODE KEY
```

Ensures combination is unique and all properties exist.

### Constraint Management

#### List All Constraints
```cypher
SHOW CONSTRAINTS
```

#### Drop a Constraint
```cypher
DROP CONSTRAINT item_id_unique IF EXISTS
```

## Transactions

### ACID Properties

Neo4j provides full ACID transactions:
- **Atomicity**: All or nothing
- **Consistency**: Data integrity maintained
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed data persists

### Transaction Examples

#### Explicit Transaction (Node.js)
```javascript
const session = driver.session();
const tx = session.beginTransaction();

try {
  // Multiple operations
  await tx.run('CREATE (i:Item {id: $id, name: $name})', { id: '1', name: 'Item 1' });
  await tx.run('CREATE (i:Item {id: $id, name: $name})', { id: '2', name: 'Item 2' });
  
  // Commit if all succeed
  await tx.commit();
} catch (error) {
  // Rollback on error
  await tx.rollback();
  throw error;
} finally {
  await session.close();
}
```

#### Auto-commit Transaction
```javascript
const session = driver.session();
try {
  const result = await session.run('CREATE (i:Item {name: $name}) RETURN i', { name: 'Item 1' });
} finally {
  await session.close();
}
```

### Transaction Best Practices

1. **Keep transactions short** - Reduces lock contention
2. **Batch operations** - Better performance than many small transactions
3. **Handle retries** - Network issues may require retry logic
4. **Close sessions** - Always close in `finally` block

## Performance Optimization

### Query Optimization

#### 1. Use EXPLAIN and PROFILE
```cypher
-- See query plan without executing
EXPLAIN MATCH (i:Item {name: "Laptop"}) RETURN i

-- Execute and see actual performance
PROFILE MATCH (i:Item {name: "Laptop"}) RETURN i
```

#### 2. Use Parameters
```cypher
-- Good: Uses parameters
MATCH (i:Item {name: $name}) RETURN i

-- Avoid: String concatenation
MATCH (i:Item {name: "Laptop"}) RETURN i
```

#### 3. Filter Early
```cypher
-- Good: Filter in MATCH
MATCH (i:Item {price: 999.99})
RETURN i

-- Less optimal: Filter in WHERE
MATCH (i:Item)
WHERE i.price = 999.99
RETURN i
```

#### 4. Use LIMIT
```cypher
MATCH (i:Item)
RETURN i
LIMIT 100
```

#### 5. Use WITH for Pipeline Stages
```cypher
MATCH (i:Item)
WHERE i.price > 100
WITH i
ORDER BY i.price DESC
LIMIT 10
MATCH (i)-[:HAS_TAG]->(t:Tag)
RETURN i, collect(t.name) as tags
```

### Batch Operations

#### Bulk Insert with UNWIND
```cypher
UNWIND $items as item
CREATE (i:Item {
  id: item.id,
  name: item.name,
  price: item.price
})
```

#### Periodic Commit (Large Imports)
```cypher
USING PERIODIC COMMIT 500
LOAD CSV WITH HEADERS FROM 'file:///items.csv' AS row
CREATE (i:Item {
  id: row.id,
  name: row.name,
  price: toFloat(row.price)
})
```

## Graph Data Science

### Centrality Algorithms

#### PageRank
```cypher
CALL gds.pageRank.stream({
  nodeProjection: 'Item',
  relationshipProjection: 'HAS_TAG'
})
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name as item, score
ORDER BY score DESC
LIMIT 10
```

Finds most "important" items based on tag connections.

#### Betweenness Centrality
```cypher
CALL gds.betweenness.stream({
  nodeProjection: 'Item',
  relationshipProjection: 'HAS_TAG'
})
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name as item, score
ORDER BY score DESC
```

Finds items that bridge different parts of the graph.

### Community Detection

#### Louvain Algorithm
```cypher
CALL gds.louvain.stream({
  nodeProjection: 'Item',
  relationshipProjection: 'HAS_TAG'
})
YIELD nodeId, communityId
RETURN communityId, collect(gds.util.asNode(nodeId).name) as items
ORDER BY communityId
```

Groups items into communities based on tag connections.

### Similarity

#### Node Similarity
```cypher
CALL gds.nodeSimilarity.stream({
  nodeProjection: 'Item',
  relationshipProjection: 'HAS_TAG'
})
YIELD node1, node2, similarity
RETURN gds.util.asNode(node1).name as item1,
       gds.util.asNode(node2).name as item2,
       similarity
ORDER BY similarity DESC
LIMIT 10
```

Finds similar items based on shared tags.

## Advanced Cypher Features

### Conditional Logic

#### CASE Expressions
```cypher
MATCH (i:Item)
RETURN i.name,
  CASE
    WHEN i.price < 50 THEN 'Cheap'
    WHEN i.price < 200 THEN 'Moderate'
    ELSE 'Expensive'
  END as priceRange
```

### List Operations

#### List Comprehension
```cypher
MATCH (i:Item)-[:HAS_TAG]->(t:Tag)
RETURN i.name, [tag IN collect(t) WHERE tag.name STARTS WITH 't'] as tTags
```

#### List Functions
```cypher
MATCH (i:Item)
RETURN i.name, size([(i)-[:HAS_TAG]->() | 1]) as tagCount
```

### Map Projections

```cypher
MATCH (i:Item)
RETURN i {.name, .price, tagCount: size([(i)-[:HAS_TAG]->() | 1])}
```

### Pattern Comprehension

```cypher
MATCH (i:Item)
RETURN i.name, [(i)-[:HAS_TAG]->(t:Tag) | t.name] as tags
```

## Security Features

### Role-Based Access Control (Enterprise)

```cypher
-- Create role
CREATE ROLE reader

-- Grant read permissions
GRANT TRAVERSE ON GRAPH * NODES * TO reader
GRANT READ {*} ON GRAPH * NODES * TO reader

-- Create user
CREATE USER alice SET PASSWORD 'password123' CHANGE NOT REQUIRED
GRANT ROLE reader TO alice
```

### Query Whitelisting (Enterprise)

Limit which queries users can run.

## Backup and Restore

### Backup (Enterprise)
```bash
neo4j-admin backup --backup-dir=/backups --name=graph.db-backup
```

### Restore (Enterprise)
```bash
neo4j-admin restore --from=/backups/graph.db-backup --database=neo4j
```

### Export to Cypher
```cypher
CALL apoc.export.cypher.all("export.cypher", {
  format: "plain",
  useOptimizations: {type: "UNWIND_BATCH", unwindBatchSize: 20}
})
```

## Monitoring and Debugging

### Query Logging

Enable in `neo4j.conf`:
```
dbms.logs.query.enabled=true
dbms.logs.query.threshold=1000ms
```

### View Active Queries
```cypher
CALL dbms.listQueries()
YIELD queryId, username, query, elapsedTimeMillis
WHERE elapsedTimeMillis > 1000
RETURN queryId, username, query, elapsedTimeMillis
ORDER BY elapsedTimeMillis DESC
```

### Kill Slow Query
```cypher
CALL dbms.killQuery("query-id")
```

### Database Statistics
```cypher
CALL db.stats.retrieve('GRAPH COUNTS')
```

## Visualization

### Built-in Browser Visualization

Neo4j Browser automatically visualizes query results as a graph.

### Custom Styling

```cypher
// In Neo4j Browser, use grass (style) file
:style

// Example custom styling
node {
  diameter: 50px;
  color: #A5ABB6;
  border-color: #9AA1AC;
}

node.Item {
  color: #68BDF6;
}

node.Category {
  color: #6DCE9E;
}
```

## Integration with Other Tools

### Neo4j Bloom
Visual graph exploration tool (commercial).

### Neo4j GraphQL Library
Auto-generate GraphQL API from graph schema.

### Apache Spark Connector
Process large graphs with Spark.

### Kafka Integration
Stream data into Neo4j in real-time.

## Best Practices Summary

1. **Model for your queries** - Design graph based on query patterns
2. **Use labels** - Makes queries faster and more readable
3. **Create constraints** - Ensure data integrity
4. **Index frequently queried properties** - Improve performance
5. **Use parameters** - Better security and query plan caching
6. **Profile queries** - Identify bottlenecks
7. **Keep transactions short** - Reduce lock contention
8. **Batch operations** - Better performance for bulk operations
9. **Monitor performance** - Use query logs and metrics
10. **Version control schema** - Track schema changes over time
