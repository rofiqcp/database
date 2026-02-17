# DynamoDB Learning Module - Database Information

Comprehensive guide to DynamoDB tables, indexes, attributes, and schema design.

## Overview

This module uses Amazon DynamoDB, a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability.

### Database Type
- **Type**: NoSQL (Key-Value and Document Database)
- **Provider**: Amazon Web Services (AWS)
- **SDK**: AWS SDK for JavaScript v3
- **Local Development**: DynamoDB Local

## Table Schema

### Main Table: `Items`

#### Table Configuration
- **Table Name**: `Items`
- **Partition Key**: `id` (String)
- **Billing Mode**: Provisioned (for local) or On-Demand (recommended for production)
- **Table Class**: Standard
- **Encryption**: Server-side encryption enabled in production

#### Primary Key Structure
```
Partition Key (HASH): id (String - UUID v4)
```

#### Attributes

| Attribute | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `id` | String (UUID) | ✓ | Unique identifier (Partition Key) | "550e8400-e29b-41d4-a716-446655440000" |
| `name` | String | ✓ | Item name | "Laptop" |
| `description` | String | ✗ | Item description | "High-performance gaming laptop" |
| `category` | String | ✗ | Item category (GSI partition key) | "Electronics" |
| `price` | Number | ✗ | Item price | 1299.99 |
| `stock` | Number | ✗ | Stock quantity | 5 |
| `createdAt` | String (ISO 8601) | ✓ | Creation timestamp (GSI sort key) | "2024-01-01T12:00:00.000Z" |
| `updatedAt` | String (ISO 8601) | ✓ | Last update timestamp | "2024-01-01T13:00:00.000Z" |

#### Attribute Constraints
- **id**: Must be valid UUID v4 format
- **name**: Non-empty string, max 500 characters
- **description**: Max 2000 characters
- **category**: Max 100 characters, defaults to "Uncategorized"
- **price**: Non-negative number, precision to 2 decimal places
- **stock**: Non-negative integer
- **createdAt**: ISO 8601 format timestamp
- **updatedAt**: ISO 8601 format timestamp, auto-updated on modifications

## Global Secondary Index (GSI)

### Index: `category-createdAt-index`

Enables efficient querying of items by category, sorted by creation time.

#### Index Configuration
- **Index Name**: `category-createdAt-index`
- **Partition Key**: `category` (String)
- **Sort Key**: `createdAt` (String)
- **Projection Type**: ALL (all attributes projected)

#### Use Cases
- Query all items in a specific category
- Get recently created items in a category
- Paginate through category items sorted by date
- Filter and search within categories

#### Query Examples
```javascript
// Get all Electronics, sorted by creation date (descending)
const result = await db.queryByCategory('Electronics');

// Get first 10 Books
const result = await db.queryByCategory('Books', 10);

// Paginate through Furniture
const result = await db.queryByCategory('Furniture', 20, lastEvaluatedKey);
```

#### Performance Benefits
- **O(1) lookup** by category instead of table scan
- **Sorted results** without client-side sorting
- **Reduced latency** for category-based queries
- **Lower RCU consumption** compared to Scan operations

## Item Structure

### Example Item Document
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Gaming Laptop",
  "description": "High-performance laptop with RTX 4070 GPU, 32GB RAM, 1TB SSD",
  "category": "Electronics",
  "price": 1299.99,
  "stock": 5,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-15T14:30:00.000Z"
}
```

### Minimal Valid Item
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Product",
  "description": "",
  "category": "Uncategorized",
  "price": 0,
  "stock": 0,
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

## DynamoDB Concepts

### Primary Key Types

#### 1. Partition Key (Simple Primary Key)
- **This module uses**: `id` as partition key
- **Purpose**: Uniquely identifies each item
- **Distribution**: AWS distributes data across partitions based on hash of partition key
- **Access Pattern**: Direct item lookup by ID

#### 2. Composite Primary Key (Not used in this module)
- Combination of partition key + sort key
- Enables range queries and sorting

### Capacity Units

#### Read Capacity Units (RCU)
- **1 RCU** = 1 strongly consistent read/sec for item up to 4KB
- **1 RCU** = 2 eventually consistent reads/sec for item up to 4KB
- **GetItem**: Uses RCUs based on item size
- **Query/Scan**: Uses RCUs for all items examined

#### Write Capacity Units (WCU)
- **1 WCU** = 1 write/sec for item up to 1KB
- **PutItem/UpdateItem/DeleteItem**: Uses WCUs based on item size

#### Provisioned Throughput (Local Development)
```javascript
{
  ReadCapacityUnits: 5,  // 5 RCU/second
  WriteCapacityUnits: 5  // 5 WCU/second
}
```

#### On-Demand Billing (Recommended for Production)
- Pay per request
- No capacity planning needed
- Automatically scales

### Data Types

DynamoDB supports the following attribute types:

#### Scalar Types
- **String (S)**: UTF-8 encoded text, max 400KB
- **Number (N)**: Numeric values (integers and decimals)
- **Binary (B)**: Binary data, max 400KB
- **Boolean (BOOL)**: true or false
- **Null (NULL)**: null value

#### Set Types
- **String Set (SS)**: Set of strings
- **Number Set (NS)**: Set of numbers
- **Binary Set (BS)**: Set of binary values

#### Document Types
- **List (L)**: Ordered collection of values
- **Map (M)**: Unordered collection of key-value pairs

This module primarily uses:
- **String**: id, name, description, category, createdAt, updatedAt
- **Number**: price, stock

## Access Patterns

### 1. Get Item by ID
```
Operation: GetItem
Key: { id: "uuid" }
Capacity: 1 RCU for items ≤ 4KB
Performance: ~10ms latency
```

### 2. Get All Items (with pagination)
```
Operation: Scan
Capacity: Based on table size
Performance: Variable, depends on table size
Use Case: Admin dashboard, reports
```

### 3. Query by Category
```
Operation: Query (using GSI)
Index: category-createdAt-index
Capacity: RCUs based on matching items
Performance: ~10-20ms latency
Use Case: Category pages, filtering
```

### 4. Create Item
```
Operation: PutItem
Capacity: 1 WCU for items ≤ 1KB
Performance: ~10ms latency
```

### 5. Update Item
```
Operation: UpdateItem
Capacity: 1 WCU for items ≤ 1KB
Performance: ~10ms latency
```

### 6. Delete Item
```
Operation: DeleteItem
Capacity: 1 WCU for items ≤ 1KB
Performance: ~10ms latency
```

### 7. Search Items
```
Operation: Scan with FilterExpression
Capacity: RCUs for all items scanned
Performance: Slower for large tables
Optimization: Use Query with GSI when possible
```

## DynamoDB Best Practices

### 1. Partition Key Design
✓ **Good**: Use high-cardinality attributes (UUID, user ID, etc.)
✗ **Bad**: Use low-cardinality attributes (status, category as primary key)

### 2. Use GSI for Alternative Access Patterns
✓ **Good**: Query by category using GSI
✗ **Bad**: Scan table and filter by category

### 3. Pagination
✓ **Good**: Use LastEvaluatedKey for pagination
✗ **Bad**: Retrieve all items at once

### 4. Attribute Projection
✓ **Good**: Project ALL for GSI if all attributes needed frequently
✓ **Good**: Project KEYS_ONLY or INCLUDE for specific use cases

### 5. Avoid Scans
✓ **Good**: Use Query operations with key conditions
✗ **Bad**: Use Scan for common queries

### 6. Batch Operations
✓ **Good**: Use BatchGetItem, BatchWriteItem for multiple items
✗ **Bad**: Individual GetItem/PutItem in loops

## Comparison with Relational Databases

| Feature | DynamoDB | Relational DB (SQL) |
|---------|----------|---------------------|
| **Data Model** | NoSQL (Key-Value, Document) | Relational (Tables with Rows) |
| **Schema** | Flexible, schema-less | Fixed schema |
| **Primary Key** | Required partition key | Primary key (optional but recommended) |
| **Joins** | No native joins | SQL JOINs |
| **Queries** | Key-based, limited filtering | Flexible SQL queries |
| **Scaling** | Automatic horizontal scaling | Manual vertical/horizontal scaling |
| **Indexes** | LSI, GSI (limited) | Unlimited indexes |
| **Transactions** | Limited (TransactWriteItems) | Full ACID transactions |
| **Performance** | Consistent low latency | Variable based on query complexity |

## DynamoDB vs Other NoSQL Databases

| Feature | DynamoDB | MongoDB | Cassandra |
|---------|----------|---------|-----------|
| **Type** | Key-Value, Document | Document | Wide-Column |
| **Hosting** | AWS Managed | Self-hosted / Atlas | Self-hosted |
| **Scaling** | Automatic | Manual sharding | Automatic |
| **Consistency** | Eventually consistent (default) | Tunable | Tunable |
| **Query Language** | Limited (PartiQL) | Rich (MongoDB Query Language) | CQL (SQL-like) |
| **Indexes** | LSI, GSI | Multiple indexes | Secondary indexes |
| **Schema** | Schema-less | Schema-less | Schema-defined |

## Data Modeling Example

### E-commerce Use Case

#### Items Table (Current)
```
id (PK) | name | category | price | stock
```

#### Potential Extensions

**Orders Table**:
```
orderId (PK) | customerId (GSI PK) | orderDate | items | total
```

**Customers Table**:
```
customerId (PK) | email (GSI PK) | name | address
```

**Access Patterns**:
1. Get order by orderId → GetItem on Orders
2. Get all orders for customer → Query on customerId GSI
3. Get customer by email → Query on email GSI
4. Get items in category → Query on category-createdAt-index

## Storage and Limits

### DynamoDB Limits
- **Item size**: 400KB maximum
- **Attribute name length**: 64KB maximum
- **Partition key length**: 2048 bytes maximum
- **GSI per table**: 20 maximum
- **LSI per table**: 5 maximum
- **Attributes in projection**: All, or up to 100

### Cost Considerations
- **Storage**: $0.25 per GB-month
- **On-demand reads**: $0.25 per million read request units
- **On-demand writes**: $1.25 per million write request units
- **Provisioned capacity**: $0.00065 per RCU-hour, $0.00065 per WCU-hour

## Monitoring and Performance

### CloudWatch Metrics
- **ConsumedReadCapacityUnits**: Track read usage
- **ConsumedWriteCapacityUnits**: Track write usage
- **UserErrors**: Track client-side errors
- **SystemErrors**: Track DynamoDB service errors
- **ThrottledRequests**: Track throttling

### Performance Optimization
1. Use Query instead of Scan
2. Design efficient partition keys
3. Use GSI for alternative access patterns
4. Enable DynamoDB Accelerator (DAX) for caching
5. Use batch operations
6. Implement exponential backoff for retries
7. Monitor and adjust capacity

## Schema Migration

DynamoDB is schema-less, but here's how to handle changes:

### Adding New Attribute
```javascript
// No migration needed
// Just start including the new attribute in PutItem/UpdateItem
```

### Renaming Attribute
```javascript
// 1. Add new attribute
// 2. Backfill data (read old, write new)
// 3. Update application code
// 4. Eventually remove old attribute
```

### Changing Data Type
```javascript
// 1. Add new attribute with new type
// 2. Migrate data
// 3. Update code
// 4. Remove old attribute
```

## Backup and Recovery

### Point-in-Time Recovery (PITR)
- Continuous backups for last 35 days
- Restore to any point in time
- Minimal performance impact

### On-Demand Backups
- Full table backups
- No performance impact
- Keep indefinitely
- Cross-region copy available

### Export to S3
- Export table data to S3
- Use for analytics, archival
- DynamoDB JSON or Amazon Ion format
