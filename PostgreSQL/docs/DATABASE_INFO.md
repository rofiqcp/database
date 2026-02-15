# PostgreSQL Database Information

## What is PostgreSQL?

PostgreSQL is a powerful, open-source object-relational database system with over 35 years of active development. It has earned a strong reputation for reliability, feature robustness, and performance.

### Key Features

- **ACID Compliant**: Atomic, Consistent, Isolated, Durable transactions
- **Multi-Version Concurrency Control (MVCC)**: Handles concurrent users efficiently
- **Advanced Data Types**: JSONB, Arrays, UUID, and custom types
- **Full-Text Search**: Built-in text search capabilities
- **Extensible**: Add custom functions, data types, and operators
- **Foreign Keys & Constraints**: Strong data integrity
- **ANSI SQL Compliant**: Standard SQL with extensions
- **Open Source**: Free with PostgreSQL License

## PostgreSQL in This Module

### Database Driver

This module uses **node-postgres (pg)** - the most popular PostgreSQL client for Node.js.

**Why node-postgres?**
- Most mature and widely-used PostgreSQL driver for Node.js
- Active maintenance and community support
- Connection pooling built-in
- Promise and callback support
- Excellent performance

### Connection Configuration

```javascript
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'learning_db',
  max: 20, // Maximum clients in pool
});
```

### Schema

```sql
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price NUMERIC(10, 2),
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);
```

## PostgreSQL Data Types Used

### SERIAL
Auto-incrementing integer for primary keys. Equivalent to creating a sequence and setting the column default.

```sql
id SERIAL PRIMARY KEY
-- Equivalent to:
-- id INTEGER PRIMARY KEY DEFAULT nextval('items_id_seq')
```

### VARCHAR(n)
Variable-length character string with limit.

```sql
name VARCHAR(255) NOT NULL
category VARCHAR(100)
```

### TEXT
Variable unlimited length text.

```sql
description TEXT
```

### NUMERIC(p, s)
Exact numeric with precision (p) and scale (s). Perfect for money.

```sql
price NUMERIC(10, 2)  -- Up to 10 digits, 2 after decimal
```

### INTEGER
4-byte integer (-2,147,483,648 to 2,147,483,647).

```sql
quantity INTEGER DEFAULT 0
```

### TIMESTAMP
Date and time (no timezone in this schema, but TIMESTAMPTZ is available).

```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## Query Syntax Differences

### Parameterized Queries

**PostgreSQL uses numbered placeholders:**
```sql
SELECT * FROM items WHERE id = $1
INSERT INTO items (name, price) VALUES ($1, $2)
```

**SQLite uses question marks:**
```sql
SELECT * FROM items WHERE id = ?
INSERT INTO items (name, price) VALUES (?, ?)
```

### Case-Insensitive Search

**PostgreSQL ILIKE:**
```sql
SELECT * FROM items WHERE name ILIKE '%laptop%'
```

**SQLite LIKE (case-insensitive by default):**
```sql
SELECT * FROM items WHERE name LIKE '%laptop%'
```

### Auto-increment

**PostgreSQL:**
```sql
id SERIAL PRIMARY KEY
```

**SQLite:**
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
```

### Returning Data

**PostgreSQL RETURNING clause:**
```sql
INSERT INTO items (name) VALUES ('New Item') RETURNING *;
UPDATE items SET price = 99.99 WHERE id = 1 RETURNING *;
```

**SQLite:**
```javascript
// Must query separately after INSERT
db.run(sql, params, function() {
  const id = this.lastID;
  db.get('SELECT * FROM items WHERE id = ?', [id]);
});
```

## Connection Pooling

PostgreSQL uses connection pooling to manage multiple database connections efficiently.

### Pool Configuration

```javascript
const pool = new Pool({
  max: 20,                    // Max clients in pool
  idleTimeoutMillis: 30000,   // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Timeout for acquiring connection
});
```

### Using the Pool

```javascript
// Automatic release
const result = await pool.query('SELECT * FROM items');

// Manual control
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO items ...');
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
} finally {
  client.release();
}
```

## Advanced PostgreSQL Features

This module demonstrates basics, but PostgreSQL offers much more:

### JSONB Data Type

Store and query JSON data efficiently:

```sql
ALTER TABLE items ADD COLUMN metadata JSONB;

INSERT INTO items (name, metadata) 
VALUES ('Laptop', '{"brand": "Dell", "specs": {"ram": "16GB"}}');

SELECT * FROM items 
WHERE metadata->>'brand' = 'Dell';

SELECT * FROM items 
WHERE metadata->'specs'->>'ram' = '16GB';
```

### Full-Text Search

Built-in text search:

```sql
-- Add tsvector column
ALTER TABLE items ADD COLUMN search_vector tsvector;

-- Update search vector
UPDATE items SET search_vector = 
  to_tsvector('english', name || ' ' || COALESCE(description, ''));

-- Create GIN index for fast search
CREATE INDEX items_search_idx ON items USING GIN(search_vector);

-- Search
SELECT * FROM items 
WHERE search_vector @@ to_tsquery('english', 'laptop & gaming');
```

### Window Functions

Analytical queries:

```sql
-- Rank items by price within each category
SELECT 
  name, 
  category, 
  price,
  RANK() OVER (PARTITION BY category ORDER BY price DESC) as price_rank
FROM items;

-- Running total
SELECT 
  name, 
  price,
  SUM(price) OVER (ORDER BY created_at) as running_total
FROM items;
```

### Common Table Expressions (CTEs)

Complex queries:

```sql
WITH expensive_items AS (
  SELECT * FROM items WHERE price > 1000
),
category_stats AS (
  SELECT 
    category, 
    COUNT(*) as count,
    AVG(price) as avg_price
  FROM expensive_items
  GROUP BY category
)
SELECT * FROM category_stats WHERE count > 5;
```

### Array Types

Store arrays natively:

```sql
ALTER TABLE items ADD COLUMN tags TEXT[];

INSERT INTO items (name, tags) 
VALUES ('Laptop', ARRAY['electronics', 'computers', 'portable']);

SELECT * FROM items WHERE 'electronics' = ANY(tags);
```

### Constraints

Enforce data integrity:

```sql
-- CHECK constraint
ALTER TABLE items ADD CONSTRAINT price_positive CHECK (price >= 0);

-- UNIQUE constraint
ALTER TABLE items ADD CONSTRAINT unique_name UNIQUE (name);

-- Foreign key
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  item_id INTEGER REFERENCES items(id) ON DELETE CASCADE
);
```

## Performance Tips

### Indexes

Already implemented in this module:

```sql
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);
```

For text search, consider GIN or GiST indexes:

```sql
CREATE INDEX idx_items_description_gin ON items 
USING GIN(to_tsvector('english', description));
```

### EXPLAIN ANALYZE

Analyze query performance:

```sql
EXPLAIN ANALYZE SELECT * FROM items WHERE category = 'Electronics';
```

### Vacuuming

PostgreSQL automatically manages this, but for large operations:

```sql
VACUUM ANALYZE items;
```

## Transactions

Ensure data consistency:

```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  await client.query(
    'UPDATE items SET quantity = quantity - 1 WHERE id = $1',
    [itemId]
  );
  
  await client.query(
    'INSERT INTO orders (item_id) VALUES ($1)',
    [itemId]
  );
  
  await client.query('COMMIT');
} catch (err) {
  await client.query('ROLLBACK');
  throw err;
} finally {
  client.release();
}
```

## PostgreSQL vs Other Databases

### vs SQLite
- ✅ Better concurrency
- ✅ More advanced features
- ✅ Better for production
- ❌ Requires server setup

### vs MySQL
- ✅ More SQL standard compliant
- ✅ Better JSON support (JSONB)
- ✅ More advanced features
- ✅ Better for complex queries

### vs MongoDB
- ✅ Strong data consistency (ACID)
- ✅ Structured schema
- ✅ Complex joins
- ✅ JSONB for semi-structured data

## Connection String Format

Alternative to Pool config:

```javascript
const connectionString = 
  'postgresql://username:password@localhost:5432/database_name';

const pool = new Pool({ connectionString });
```

## Best Practices

1. **Use connection pooling** (already implemented)
2. **Always use parameterized queries** (prevents SQL injection)
3. **Create indexes on frequently queried columns**
4. **Use transactions for related operations**
5. **Monitor connection pool usage**
6. **Use NUMERIC for money** (not FLOAT)
7. **Add constraints for data integrity**
8. **Regular VACUUM ANALYZE** (usually automatic)

## Resources

- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [node-postgres Documentation](https://node-postgres.com/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [PostgreSQL Exercises](https://pgexercises.com/)

## Security Notes

- Never store passwords in plain text
- Use parameterized queries (already implemented)
- Limit database user permissions
- Use SSL for remote connections
- Keep PostgreSQL updated
- Regular backups

## Backup and Restore

```bash
# Backup
pg_dump -U postgres learning_db > backup.sql

# Restore
psql -U postgres learning_db < backup.sql

# Backup specific table
pg_dump -U postgres -t items learning_db > items_backup.sql
```
