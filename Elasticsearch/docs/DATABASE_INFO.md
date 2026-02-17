# Elasticsearch Database Information

## What is Elasticsearch?

Elasticsearch is a distributed, RESTful search and analytics engine built on top of Apache Lucene. It provides a scalable, near real-time search solution capable of handling large volumes of data with high performance.

### Key Features

- **Full-Text Search**: Powerful text analysis and search with relevance scoring
- **Distributed Architecture**: Horizontally scalable across multiple nodes
- **Near Real-Time**: Documents are searchable within ~1 second of indexing
- **RESTful API**: All operations via HTTP/JSON
- **Schema-Free (Dynamic Mapping)**: Auto-detects field types, or define explicit mappings
- **Aggregations**: Powerful analytics and data summarization
- **Fuzzy Search**: Handles typos and approximate matching
- **Open Source**: Available under multiple licenses

## Elasticsearch in This Module

### Node.js Client

This module uses **@elastic/elasticsearch** - the official Elasticsearch client for Node.js.

**Why @elastic/elasticsearch?**
- Official client maintained by Elastic
- Full API coverage
- Promise-based async/await support
- Connection pooling and load balancing
- Automatic retries and error handling
- TypeScript support

### Connection Configuration

```javascript
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'http://localhost:9200'
});
```

### Index Mapping

```javascript
await client.indices.create({
  index: 'items',
  body: {
    mappings: {
      properties: {
        name: { type: 'text', fields: { keyword: { type: 'keyword' } } },
        description: { type: 'text' },
        category: { type: 'keyword' },
        price: { type: 'float' },
        quantity: { type: 'integer' },
        created_at: { type: 'date' },
        updated_at: { type: 'date' }
      }
    }
  }
});
```

## Elasticsearch Core Concepts

### Index
An index is like a "database" in relational terms. It's a collection of documents that share similar characteristics. Each index has a name used to reference it during indexing, search, update, and delete operations.

### Document
A document is a basic unit of information that can be indexed. It's expressed in JSON. Each document is stored in an index and has a unique `_id`.

### Mapping
A mapping defines the schema of an index — how documents and their fields are stored and indexed. Similar to a table schema in relational databases.

### Shards
An index can be divided into multiple shards. Each shard is a fully functional and independent index that can be hosted on any node. Sharding enables horizontal scaling.

### Replicas
Replicas are copies of shards that provide high availability and improved search performance. If a node fails, replica shards can serve the data.

## Elasticsearch Data Types Used

### text
Analyzed text for full-text search. The field value is broken into individual terms (tokens) by an analyzer.

```javascript
name: { type: 'text', fields: { keyword: { type: 'keyword' } } }
```

The `fields.keyword` sub-field stores the exact value for sorting and aggregations.

### keyword
Exact-value string, not analyzed. Used for filtering, sorting, and aggregations.

```javascript
category: { type: 'keyword' }
```

### float
Single-precision 32-bit IEEE 754 floating point number.

```javascript
price: { type: 'float' }
```

### integer
Signed 32-bit integer.

```javascript
quantity: { type: 'integer' }
```

### date
Date values, stored as milliseconds since epoch or as formatted strings.

```javascript
created_at: { type: 'date' }
```

## Inverted Index

Elasticsearch uses an **inverted index** — the core data structure that makes full-text search fast.

### How It Works

For a document with `name: "Gaming Laptop"`:

| Term    | Document IDs |
|---------|-------------|
| gaming  | doc1, doc5  |
| laptop  | doc1, doc3  |

When you search for "gaming", Elasticsearch looks up the term in the inverted index and immediately finds all matching documents.

### Analyzers

Text fields go through analysis before being indexed:

1. **Character filters**: Clean the text (e.g., strip HTML)
2. **Tokenizer**: Break text into individual tokens
3. **Token filters**: Transform tokens (e.g., lowercase, stemming)

**Standard Analyzer** (default):
- "Gaming Laptop" → ["gaming", "laptop"]

**English Analyzer**:
- "Running quickly" → ["run", "quick"] (stemming applied)

## Query DSL (Domain Specific Language)

Elasticsearch uses a JSON-based query language:

### Match Query (Full-Text)
```json
{
  "query": {
    "match": {
      "name": "gaming laptop"
    }
  }
}
```

### Term Query (Exact Match)
```json
{
  "query": {
    "term": {
      "category": "Electronics"
    }
  }
}
```

### Bool Query (Compound)
```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "laptop" } }
      ],
      "filter": [
        { "term": { "category": "Electronics" } },
        { "range": { "price": { "gte": 100, "lte": 2000 } } }
      ]
    }
  }
}
```

### Multi-Match Query
```json
{
  "query": {
    "multi_match": {
      "query": "gaming laptop",
      "fields": ["name", "description"],
      "fuzziness": "AUTO"
    }
  }
}
```

### Fuzzy Search
```json
{
  "query": {
    "fuzzy": {
      "name": {
        "value": "laptpo",
        "fuzziness": "AUTO"
      }
    }
  }
}
```

## Aggregations

Aggregations provide analytics capabilities on your data:

### Terms Aggregation
```json
{
  "size": 0,
  "aggs": {
    "categories": {
      "terms": { "field": "category" }
    }
  }
}
```

### Stats Aggregation
```json
{
  "size": 0,
  "aggs": {
    "price_stats": {
      "stats": { "field": "price" }
    }
  }
}
```

### Histogram Aggregation
```json
{
  "size": 0,
  "aggs": {
    "price_ranges": {
      "histogram": {
        "field": "price",
        "interval": 100
      }
    }
  }
}
```

### Nested Aggregation
```json
{
  "size": 0,
  "aggs": {
    "by_category": {
      "terms": { "field": "category" },
      "aggs": {
        "avg_price": {
          "avg": { "field": "price" }
        }
      }
    }
  }
}
```

## Cluster Concepts

### Cluster
A collection of one or more nodes that together hold your entire data. It provides federated indexing and search capabilities.

### Node
A single server that is part of the cluster. Each node stores data and participates in the cluster's indexing and search capabilities.

### Node Types
- **Master Node**: Manages cluster-wide settings and operations
- **Data Node**: Stores data and executes data-related operations
- **Ingest Node**: Pre-processes documents before indexing
- **Coordinating Node**: Routes requests and merges results

### Shards and Replicas

```
Index: items (5 primary shards, 1 replica each)
├── Node 1: [Shard 0 (P)] [Shard 1 (R)]
├── Node 2: [Shard 1 (P)] [Shard 2 (R)]
├── Node 3: [Shard 2 (P)] [Shard 0 (R)]
├── Node 4: [Shard 3 (P)] [Shard 4 (R)]
└── Node 5: [Shard 4 (P)] [Shard 3 (R)]
```

## Kibana

Kibana is the visualization and management UI for Elasticsearch:

- **Discover**: Explore and search your data
- **Visualize**: Create charts and graphs
- **Dashboard**: Build interactive dashboards
- **Dev Tools**: Run Elasticsearch queries directly
- **Index Management**: Manage indices and mappings

### Install Kibana
```bash
# Docker
docker run -d --name kibana \
  -p 5601:5601 \
  --link elasticsearch:elasticsearch \
  kibana:8.11.0

# Access at http://localhost:5601
```

## Elasticsearch vs Other Databases

### vs PostgreSQL/MySQL
- ✅ Superior full-text search performance
- ✅ Fuzzy search and relevance scoring
- ✅ Horizontal scaling
- ❌ Not ACID-compliant (eventual consistency)
- ❌ Not suitable as primary transactional database

### vs MongoDB
- ✅ Better search capabilities
- ✅ Better aggregation for analytics
- ✅ Built-in distributed architecture
- ❌ Higher memory requirements
- ❌ Not designed for frequent updates

### vs Redis
- ✅ Persistent storage with search
- ✅ Complex query capabilities
- ❌ Slower for simple key-value operations
- ❌ Higher resource requirements

## Best Practices

1. **Use explicit mappings** (already implemented)
2. **Choose correct field types** (text vs keyword)
3. **Use `refresh: true` sparingly** (impacts performance at scale)
4. **Use bulk API for large imports**
5. **Monitor cluster health**
6. **Size shards appropriately** (10-50GB per shard recommended)
7. **Use aliases** for zero-downtime reindexing
8. **Implement proper error handling** (already implemented)

## Resources

- [Elasticsearch Official Docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [@elastic/elasticsearch Node.js Client](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html)
- [Elasticsearch: The Definitive Guide](https://www.elastic.co/guide/en/elasticsearch/guide/current/index.html)
- [Kibana Guide](https://www.elastic.co/guide/en/kibana/current/index.html)

## Security Notes

- Disable external access in development (bind to localhost)
- Enable authentication in production (X-Pack Security)
- Use TLS/SSL for remote connections
- Limit index permissions per user/role
- Keep Elasticsearch updated
- Regular snapshots for backup

## Backup and Restore

```bash
# Create snapshot repository
PUT _snapshot/my_backup
{
  "type": "fs",
  "settings": {
    "location": "/mount/backups/my_backup"
  }
}

# Create snapshot
PUT _snapshot/my_backup/snapshot_1

# Restore snapshot
POST _snapshot/my_backup/snapshot_1/_restore
```
