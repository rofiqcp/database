# Elasticsearch Database Information

## What is Elasticsearch?

Elasticsearch is a distributed, RESTful search and analytics engine built on top of Apache Lucene. It is designed for horizontal scalability, reliability, and real-time search capabilities.

### Key Features

- **Full-Text Search**: Powerful inverted index-based search engine
- **Distributed**: Scales horizontally across multiple nodes
- **RESTful API**: All operations via HTTP/JSON
- **Near Real-Time**: Documents are searchable within ~1 second of indexing
- **Schema-Free**: Dynamic mapping with optional explicit mappings
- **Aggregations**: Complex analytics and data summarization

## Elasticsearch in This Module

### Database Driver

This module uses **@elastic/elasticsearch** - the official Node.js client for Elasticsearch.

**Why @elastic/elasticsearch?**
- Official client maintained by Elastic
- Full API coverage
- TypeScript support
- Connection pooling and retry logic
- Compatible with Elasticsearch 8.x

### Connection

```
http://localhost:9200
```

The Elasticsearch index is automatically created on first backend start.

### Index Mappings

```json
{
  "properties": {
    "name": { "type": "text", "fields": { "keyword": { "type": "keyword" } } },
    "description": { "type": "text" },
    "category": { "type": "keyword" },
    "price": { "type": "float" },
    "quantity": { "type": "integer" },
    "created_at": { "type": "date" },
    "updated_at": { "type": "date" }
  }
}
```

### Field Type Explanations

| Field | Type | Purpose |
|-------|------|---------|
| name | text + keyword | Full-text search AND exact matching/sorting |
| description | text | Full-text search with analysis |
| category | keyword | Exact match filtering, aggregations |
| price | float | Numeric range queries |
| quantity | integer | Numeric range queries |
| created_at | date | Date range queries, sorting |
| updated_at | date | Date range queries, sorting |

## Core Concepts

### Inverted Index

Elasticsearch uses an **inverted index** to enable fast full-text search. When a document is indexed, Elasticsearch breaks text fields into individual terms (tokens) and creates a mapping from each term to the documents containing it.

```
Term          → Documents
"laptop"      → [doc1, doc3, doc7]
"gaming"      → [doc1, doc5]
"wireless"    → [doc2, doc4]
```

### Analyzers

Analyzers process text during indexing and searching:

1. **Character Filters**: Pre-process the text (e.g., strip HTML)
2. **Tokenizer**: Split text into tokens (e.g., by whitespace)
3. **Token Filters**: Modify tokens (e.g., lowercase, stemming)

Default analyzer: **Standard Analyzer**
- Tokenizes on word boundaries
- Lowercases tokens
- Removes most punctuation

### Mappings

Mappings define how documents and their fields are stored and indexed:

- **text**: Analyzed for full-text search
- **keyword**: Not analyzed, for exact matches, sorting, aggregations
- **float/integer**: Numeric types for range queries
- **date**: Date/time types with format support
- **boolean**: True/false values
- **object**: Nested JSON objects
- **nested**: Arrays of objects with independent querying

### Documents and Indices

- **Document**: A JSON object stored in Elasticsearch (like a row in SQL)
- **Index**: A collection of documents (like a table in SQL)
- **_id**: Unique document identifier (auto-generated string)
- **_source**: The original JSON document

## Elasticsearch Data Types

| ES Type | Description | Example |
|---------|-------------|---------|
| text | Analyzed string for full-text search | "Gaming laptop" |
| keyword | Non-analyzed string for exact match | "Electronics" |
| integer | 32-bit integer | 42 |
| long | 64-bit integer | 9999999999 |
| float | 32-bit floating point | 29.99 |
| double | 64-bit floating point | 1299.999 |
| boolean | Boolean value | true |
| date | Date/time | "2024-01-01T00:00:00Z" |
| object | JSON object | {"nested": "value"} |

## Query DSL

Elasticsearch uses a powerful Query DSL (Domain Specific Language):

### Match All
```json
{ "query": { "match_all": {} } }
```

### Full-Text Search
```json
{
  "query": {
    "match": {
      "name": "gaming laptop"
    }
  }
}
```

### Multi-Match (search multiple fields)
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

### Term Query (exact match on keyword fields)
```json
{
  "query": {
    "term": {
      "category": "Electronics"
    }
  }
}
```

### Range Query
```json
{
  "query": {
    "range": {
      "price": {
        "gte": 100,
        "lte": 500
      }
    }
  }
}
```

### Bool Query (combine queries)
```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "name": "laptop" } }
      ],
      "filter": [
        { "term": { "category": "Electronics" } },
        { "range": { "price": { "gte": 500 } } }
      ]
    }
  }
}
```

## Aggregations

Aggregations provide analytics capabilities:

### Terms Aggregation (group by category)
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

### Stats Aggregation (price statistics)
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

## Advantages of Elasticsearch

### 1. **Full-Text Search**
- Powerful text analysis and tokenization
- Fuzzy matching for typo tolerance
- Relevance scoring
- Highlighting of matches

### 2. **Scalability**
- Horizontal scaling across nodes
- Automatic sharding and replication
- Handles petabytes of data
- Near-linear performance scaling

### 3. **Speed**
- Near real-time search (< 1 second)
- Inverted index for fast lookups
- Distributed computation
- Caching mechanisms

### 4. **Flexibility**
- Schema-free with dynamic mapping
- RESTful API (language-agnostic)
- Rich query DSL
- Aggregation framework

### 5. **Ecosystem**
- Kibana for visualization
- Logstash for data ingestion
- Beats for lightweight data shipping
- APM for application monitoring

## Limitations

### 1. **Not a Primary Database**
- Not ACID compliant by default
- Eventual consistency model
- Not designed for frequent updates
- No transactions across documents

### 2. **Resource Intensive**
- High memory requirements (JVM heap)
- Significant disk I/O
- Minimum recommended: 4GB RAM
- Complex cluster management

### 3. **Learning Curve**
- Complex query DSL
- Mapping design requires planning
- Cluster tuning for production
- Shard sizing strategy needed

### 4. **Use Cases**
Best for:
- Full-text search
- Log analytics
- Application monitoring
- E-commerce product search
- Real-time dashboards
- Geospatial search

Not ideal for:
- Primary transactional database
- Frequent updates to documents
- Strong consistency requirements
- Small datasets (overkill)

## Elasticsearch vs Other Databases

| Feature | Elasticsearch | PostgreSQL | MySQL | MongoDB | SQLite |
|---------|--------------|------------|-------|---------|--------|
| Primary Use | Search/Analytics | Relational | Relational | Document | Embedded |
| Full-Text Search | Excellent | Good | Basic | Basic | Limited |
| Scalability | Horizontal | Vertical | Vertical | Horizontal | None |
| ACID Compliance | No | Yes | Yes | Partial | Yes |
| Query Language | Query DSL | SQL | SQL | MQL | SQL |
| Real-Time Analytics | Excellent | Good | Good | Good | Limited |
| Setup Complexity | High | Medium | Medium | Medium | None |

## Kibana

Kibana is the visualization tool for Elasticsearch:

### Features
- **Discover**: Explore and search data
- **Visualize**: Create charts and graphs
- **Dashboard**: Build interactive dashboards
- **Dev Tools**: Execute Elasticsearch queries
- **Index Management**: Manage indices and mappings

### Running Kibana
```bash
# Docker
docker run -d --name kibana \
  -p 5601:5601 \
  -e "ELASTICSEARCH_HOSTS=http://elasticsearch:9200" \
  docker.elastic.co/kibana/kibana:8.11.0

# Access at http://localhost:5601
```

## Performance Tips

### 1. **Optimize Mappings**
```json
{
  "category": { "type": "keyword" }
}
```
Use `keyword` for fields that don't need full-text search.

### 2. **Use Bulk API for Batch Operations**
```javascript
const body = items.flatMap(item => [
  { index: { _index: 'items' } },
  item
]);
await client.bulk({ body });
```

### 3. **Optimize Refresh Interval**
```json
PUT /items/_settings
{
  "index": { "refresh_interval": "30s" }
}
```

### 4. **Use Filters Instead of Queries**
Filters are cached and don't compute relevance scores.

## Security Considerations

### 1. **Network Security**
- Don't expose Elasticsearch directly to the internet
- Use a reverse proxy or application layer
- Enable TLS/SSL for production

### 2. **Authentication**
```yaml
# elasticsearch.yml
xpack.security.enabled: true
```

### 3. **Input Validation**
All user input is validated before constructing queries (done in routes.js using validator library).

### 4. **Query Injection Prevention**
The @elastic/elasticsearch client properly escapes query parameters.

## Resources

- **Official Elasticsearch Docs**: https://www.elastic.co/guide/en/elasticsearch/reference/current/
- **@elastic/elasticsearch Client**: https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/
- **Elasticsearch Definitive Guide**: https://www.elastic.co/guide/en/elasticsearch/guide/current/
- **Kibana**: https://www.elastic.co/kibana
- **Elastic Stack**: https://www.elastic.co/elastic-stack

## Conclusion

Elasticsearch is an excellent choice for learning about:
- Full-text search concepts
- Inverted indexes and text analysis
- Distributed systems
- RESTful API design
- Real-time analytics

For primary data storage, pair Elasticsearch with a traditional database (PostgreSQL, MySQL, MongoDB).
