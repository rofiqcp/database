# MySQL Database Information

## What is MySQL?

MySQL is the world's most popular open-source relational database management system, developed by Oracle Corporation. It powers many of the world's largest websites and applications, including Facebook, Twitter, YouTube, and WordPress.

### Key Features

- **ACID Compliant**: Atomic, Consistent, Isolated, Durable transactions (with InnoDB)
- **High Performance**: Optimized for read-heavy workloads
- **Replication**: Built-in master-slave and group replication
- **Scalability**: Handles large databases and high traffic
- **Cross-Platform**: Runs on Linux, Windows, macOS, and more
- **InnoDB Engine**: Default storage engine with row-level locking
- **Foreign Keys & Constraints**: Strong data integrity (InnoDB)
- **Open Source**: Free under GPL license, with commercial options

## MySQL in This Module

### Database Driver

This module uses **mysql2** - the fastest MySQL client for Node.js with Promise support.

**Why mysql2?**
- Fastest MySQL driver for Node.js
- Built-in Promise/async-await support
- Prepared statements for security
- Connection pooling built-in
- Compatible with mysql module API
- Supports MySQL 5.7+ and 8.0+

### Connection Configuration

```javascript
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'learning_db',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0
});
```

### Schema

```sql
CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2),
  quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);
```

## MySQL Data Types Used

### INT AUTO_INCREMENT
Auto-incrementing integer for primary keys.

```sql
id INT AUTO_INCREMENT PRIMARY KEY
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

### DECIMAL(p, s)
Exact numeric with precision (p) and scale (s). Perfect for money.

```sql
price DECIMAL(10, 2)  -- Up to 10 digits, 2 after decimal
```

### INT
4-byte integer (-2,147,483,648 to 2,147,483,647).

```sql
quantity INT DEFAULT 0
```

### TIMESTAMP
Date and time with automatic timezone conversion.

```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

## Query Syntax Differences

### Parameterized Queries

**MySQL uses question mark placeholders:**
```sql
SELECT * FROM items WHERE id = ?
INSERT INTO items (name, price) VALUES (?, ?)
```

**PostgreSQL uses numbered placeholders:**
```sql
SELECT * FROM items WHERE id = $1
INSERT INTO items (name, price) VALUES ($1, $2)
```

### Case-Insensitive Search

**MySQL LIKE (case-insensitive by default with utf8 collation):**
```sql
SELECT * FROM items WHERE name LIKE '%laptop%'
```

**PostgreSQL ILIKE:**
```sql
SELECT * FROM items WHERE name ILIKE '%laptop%'
```

### Auto-increment

**MySQL:**
```sql
id INT AUTO_INCREMENT PRIMARY KEY
```

**PostgreSQL:**
```sql
id SERIAL PRIMARY KEY
```

### Returning Data After INSERT/UPDATE

**MySQL (no RETURNING clause):**
```javascript
// Must query separately after INSERT
const [result] = await pool.query('INSERT INTO items (name) VALUES (?)', ['New Item']);
const [rows] = await pool.query('SELECT * FROM items WHERE id = ?', [result.insertId]);
```

**PostgreSQL RETURNING clause:**
```sql
INSERT INTO items (name) VALUES ('New Item') RETURNING *;
UPDATE items SET price = 99.99 WHERE id = 1 RETURNING *;
```

## Connection Pooling

MySQL uses connection pooling to manage multiple database connections efficiently.

### Pool Configuration

```javascript
const pool = mysql.createPool({
  waitForConnections: true,   // Wait for available connection
  connectionLimit: 20,        // Max connections in pool
  queueLimit: 0,              // Unlimited queue (0 = no limit)
  idleTimeout: 60000,         // Close idle connections after 60s
  enableKeepAlive: true,      // Keep connections alive
});
```

### Using the Pool

```javascript
// Automatic release with query()
const [rows] = await pool.query('SELECT * FROM items');

// Manual control with getConnection()
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  await connection.query('INSERT INTO items ...');
  await connection.commit();
} catch (err) {
  await connection.rollback();
} finally {
  connection.release();
}
```

## Advanced MySQL Features

This module demonstrates basics, but MySQL offers much more:

### JSON Data Type

Store and query JSON data (MySQL 5.7+):

```sql
ALTER TABLE items ADD COLUMN metadata JSON;

INSERT INTO items (name, metadata) 
VALUES ('Laptop', '{"brand": "Dell", "specs": {"ram": "16GB"}}');

SELECT * FROM items 
WHERE JSON_EXTRACT(metadata, '$.brand') = 'Dell';

SELECT * FROM items 
WHERE metadata->'$.specs.ram' = '"16GB"';

SELECT name, JSON_UNQUOTE(metadata->'$.brand') as brand FROM items;
```

### Full-Text Search

Built-in full-text search:

```sql
-- Add FULLTEXT index
ALTER TABLE items ADD FULLTEXT INDEX ft_items(name, description);

-- Natural language search
SELECT * FROM items 
WHERE MATCH(name, description) AGAINST('laptop gaming' IN NATURAL LANGUAGE MODE);

-- Boolean mode search
SELECT * FROM items 
WHERE MATCH(name, description) AGAINST('+laptop -cheap' IN BOOLEAN MODE);

-- With relevance score
SELECT name, MATCH(name, description) AGAINST('laptop') as relevance
FROM items
WHERE MATCH(name, description) AGAINST('laptop')
ORDER BY relevance DESC;
```

### Window Functions (MySQL 8.0+)

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

### Common Table Expressions (MySQL 8.0+)

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

### Stored Procedures

Reusable server-side logic:

```sql
DELIMITER //
CREATE PROCEDURE GetItemsByCategory(IN cat VARCHAR(100))
BEGIN
  SELECT * FROM items WHERE category = cat ORDER BY price DESC;
END //
DELIMITER ;

CALL GetItemsByCategory('Electronics');
```

### Triggers

Automatic actions on data changes:

```sql
DELIMITER //
CREATE TRIGGER before_item_update
BEFORE UPDATE ON items
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;
```

### Constraints

Enforce data integrity:

```sql
-- CHECK constraint (MySQL 8.0.16+)
ALTER TABLE items ADD CONSTRAINT price_positive CHECK (price >= 0);

-- UNIQUE constraint
ALTER TABLE items ADD CONSTRAINT unique_name UNIQUE (name);

-- Foreign key (InnoDB)
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

## Performance Tips

### Indexes

Already implemented in this module:

```sql
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);
```

For full-text search, use FULLTEXT indexes:

```sql
ALTER TABLE items ADD FULLTEXT INDEX ft_name_desc(name, description);
```

### EXPLAIN

Analyze query performance:

```sql
EXPLAIN SELECT * FROM items WHERE category = 'Electronics';
EXPLAIN ANALYZE SELECT * FROM items WHERE price > 1000;
```

### Query Cache & Buffer Pool

MySQL InnoDB uses a buffer pool for caching:

```sql
-- Check buffer pool size
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';

-- Check query cache (deprecated in MySQL 8.0)
SHOW VARIABLES LIKE 'query_cache%';
```

## Transactions

Ensure data consistency:

```javascript
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  
  await connection.query(
    'UPDATE items SET quantity = quantity - 1 WHERE id = ?',
    [itemId]
  );
  
  await connection.query(
    'INSERT INTO orders (item_id) VALUES (?)',
    [itemId]
  );
  
  await connection.commit();
} catch (err) {
  await connection.rollback();
  throw err;
} finally {
  connection.release();
}
```

## MySQL vs Other Databases

### vs SQLite
- ✅ Better concurrency (multi-user)
- ✅ Client-server architecture
- ✅ Better for production
- ✅ Replication support
- ❌ Requires server setup

### vs PostgreSQL
- ✅ Easier to set up and manage
- ✅ Faster for simple read queries
- ✅ Larger community and ecosystem
- ✅ Better replication out of the box
- ❌ Fewer advanced SQL features
- ❌ No JSONB (uses JSON)

### vs MongoDB
- ✅ Strong data consistency (ACID)
- ✅ Structured schema
- ✅ Complex joins
- ✅ Mature and battle-tested
- ❌ Less flexible schema

## Storage Engines

### InnoDB (Default)
- ACID compliant
- Row-level locking
- Foreign key support
- Crash recovery
- Best for most applications

### MyISAM
- Table-level locking
- Full-text search (legacy)
- Faster for read-only workloads
- No foreign key support
- Not recommended for new applications

## Best Practices

1. **Use connection pooling** (already implemented)
2. **Always use parameterized queries** (prevents SQL injection)
3. **Create indexes on frequently queried columns**
4. **Use transactions for related operations**
5. **Use InnoDB engine** (default in MySQL 5.5+)
6. **Use DECIMAL for money** (not FLOAT)
7. **Add constraints for data integrity**
8. **Use utf8mb4 charset** (supports full Unicode including emojis)

## Resources

- [MySQL Official Docs](https://dev.mysql.com/doc/)
- [mysql2 Documentation](https://github.com/sidorares/node-mysql2)
- [MySQL Tutorial](https://www.mysqltutorial.org/)
- [MySQL Workbench](https://www.mysql.com/products/workbench/)

## Security Notes

- Never store passwords in plain text
- Use parameterized queries (already implemented)
- Limit database user permissions
- Use SSL for remote connections
- Keep MySQL updated
- Regular backups

## Backup and Restore

```bash
# Backup
mysqldump -u root -p learning_db > backup.sql

# Restore
mysql -u root -p learning_db < backup.sql

# Backup specific table
mysqldump -u root -p learning_db items > items_backup.sql

# Backup with compression
mysqldump -u root -p learning_db | gzip > backup.sql.gz
```
