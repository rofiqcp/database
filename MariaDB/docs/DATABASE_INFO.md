# MariaDB Database Information

## What is MariaDB?

MariaDB is a community-developed, commercially supported fork of the MySQL relational database management system. It was created by the original developers of MySQL after concerns over Oracle's acquisition of MySQL. MariaDB is intended to remain free and open-source under the GNU General Public License.

### Key Features

- **MySQL Compatible**: Drop-in replacement for MySQL with enhanced features
- **ACID Compliant**: Atomic, Consistent, Isolated, Durable transactions
- **Multiple Storage Engines**: InnoDB, Aria, MyRocks, ColumnStore, and more
- **Galera Cluster**: Built-in synchronous multi-master replication
- **Advanced Security**: Role-based access control, data-at-rest encryption
- **JSON Support**: Native JSON data type and functions
- **Window Functions**: Advanced analytical queries
- **Temporal Tables**: System-versioned tables for time-travel queries
- **Open Source**: Free under GNU GPL v2

## MariaDB in This Module

### Database Driver

This module uses **mariadb** - the official MariaDB Node.js connector.

**Why mariadb connector?**
- Official connector maintained by MariaDB Corporation
- Promise-based API with async/await support
- Connection pooling built-in
- High performance with pipelining support
- Full MariaDB and MySQL compatibility

### Connection Configuration

```javascript
const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'learning_db',
  connectionLimit: 20,
  acquireTimeout: 20000,
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
);

CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);
```

## MariaDB Data Types Used

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
Date and time with automatic update support.

```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

## Query Syntax Differences

### Parameterized Queries

**MariaDB/MySQL uses question mark placeholders:**
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

**MariaDB LIKE (case-insensitive by default for non-binary strings):**
```sql
SELECT * FROM items WHERE name LIKE '%laptop%'
```

**PostgreSQL ILIKE:**
```sql
SELECT * FROM items WHERE name ILIKE '%laptop%'
```

### Auto-increment

**MariaDB:**
```sql
id INT AUTO_INCREMENT PRIMARY KEY
```

**PostgreSQL:**
```sql
id SERIAL PRIMARY KEY
```

### Auto-Update Timestamp

**MariaDB ON UPDATE CURRENT_TIMESTAMP:**
```sql
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

**PostgreSQL (requires trigger):**
```sql
-- Needs a trigger function for auto-update
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$ BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
```

## Connection Pooling

MariaDB uses connection pooling to manage multiple database connections efficiently.

### Pool Configuration

```javascript
const pool = mariadb.createPool({
  connectionLimit: 20,        // Max connections in pool
  acquireTimeout: 20000,      // Timeout for acquiring connection (ms)
  idleTimeout: 60000,         // Close idle connections after 60s
});
```

### Using the Pool

```javascript
// Get connection and release manually
let conn;
try {
  conn = await pool.getConnection();
  const rows = await conn.query('SELECT * FROM items');
  return rows;
} finally {
  if (conn) conn.release();
}

// Transaction example
let conn;
try {
  conn = await pool.getConnection();
  await conn.beginTransaction();
  await conn.query('INSERT INTO items ...');
  await conn.query('UPDATE inventory ...');
  await conn.commit();
} catch (err) {
  if (conn) await conn.rollback();
  throw err;
} finally {
  if (conn) conn.release();
}
```

## Advanced MariaDB Features

This module demonstrates basics, but MariaDB offers much more:

### Storage Engines

MariaDB supports multiple storage engines:

- **InnoDB**: Default, ACID-compliant, row-level locking
- **Aria**: Crash-safe MyISAM replacement, default for system tables
- **MyRocks**: Optimized for SSD storage, better compression
- **ColumnStore**: Columnar storage for analytics
- **MEMORY**: In-memory tables for temporary data
- **CONNECT**: Access external data sources

```sql
-- Create table with specific engine
CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255)
) ENGINE=InnoDB;

-- Check table engine
SHOW TABLE STATUS LIKE 'items';
```

### JSON Data Type

Store and query JSON data:

```sql
ALTER TABLE items ADD COLUMN metadata JSON;

INSERT INTO items (name, metadata) 
VALUES ('Laptop', '{"brand": "Dell", "specs": {"ram": "16GB"}}');

SELECT * FROM items 
WHERE JSON_EXTRACT(metadata, '$.brand') = 'Dell';

SELECT * FROM items 
WHERE JSON_VALUE(metadata, '$.specs.ram') = '16GB';

SELECT name, JSON_VALUE(metadata, '$.brand') as brand FROM items;
```

### Galera Cluster

MariaDB Galera Cluster provides synchronous multi-master replication:

- **Synchronous Replication**: All nodes have the same data
- **Multi-Master**: Read and write on any node
- **Automatic Node Joining**: New nodes sync automatically
- **No Slave Lag**: Data is consistent across all nodes

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

### System-Versioned (Temporal) Tables

Track historical data changes:

```sql
CREATE TABLE items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10,2)
) WITH SYSTEM VERSIONING;

-- Query historical data
SELECT * FROM items FOR SYSTEM_TIME AS OF '2024-01-01 00:00:00';

-- Query all versions
SELECT * FROM items FOR SYSTEM_TIME ALL;
```

### Sequences

MariaDB 10.3+ supports sequences:

```sql
CREATE SEQUENCE item_seq START WITH 1 INCREMENT BY 1;

SELECT NEXT VALUE FOR item_seq;
```

## Performance Tips

### Indexes

Already implemented in this module:

```sql
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);
```

For full-text search:

```sql
ALTER TABLE items ADD FULLTEXT INDEX idx_items_fulltext (name, description);

SELECT * FROM items WHERE MATCH(name, description) AGAINST('laptop' IN NATURAL LANGUAGE MODE);
```

### EXPLAIN

Analyze query performance:

```sql
EXPLAIN SELECT * FROM items WHERE category = 'Electronics';
EXPLAIN ANALYZE SELECT * FROM items WHERE price > 1000;
```

### OPTIMIZE TABLE

Reclaim unused space:

```sql
OPTIMIZE TABLE items;
```

## Transactions

Ensure data consistency:

```javascript
let conn;
try {
  conn = await pool.getConnection();
  await conn.beginTransaction();
  
  await conn.query(
    'UPDATE items SET quantity = quantity - 1 WHERE id = ?',
    [itemId]
  );
  
  await conn.query(
    'INSERT INTO orders (item_id) VALUES (?)',
    [itemId]
  );
  
  await conn.commit();
} catch (err) {
  if (conn) await conn.rollback();
  throw err;
} finally {
  if (conn) conn.release();
}
```

## MariaDB vs Other Databases

### vs MySQL
- ✅ More storage engines (Aria, MyRocks, ColumnStore)
- ✅ Galera Cluster built-in
- ✅ System-versioned tables
- ✅ More active open-source development
- ✅ Better optimizer and query execution

### vs PostgreSQL
- ✅ Easier setup and administration
- ✅ MySQL ecosystem compatibility
- ✅ ON UPDATE CURRENT_TIMESTAMP
- ✅ Multiple storage engines
- ❌ Less advanced SQL features

### vs SQLite
- ✅ Better concurrency
- ✅ Client-server architecture
- ✅ Better for production
- ✅ User management and security
- ❌ Requires server setup

## Connection String Format

Alternative connection format:

```javascript
const pool = mariadb.createPool(
  'mariadb://user:password@localhost:3306/database_name'
);
```

## Best Practices

1. **Use connection pooling** (already implemented)
2. **Always use parameterized queries** (prevents SQL injection)
3. **Create indexes on frequently queried columns**
4. **Use transactions for related operations**
5. **Monitor connection pool usage**
6. **Use DECIMAL for money** (not FLOAT)
7. **Add constraints for data integrity**
8. **Use InnoDB engine** (default, ACID-compliant)

## Resources

- [MariaDB Official Docs](https://mariadb.com/kb/en/)
- [MariaDB Node.js Connector](https://mariadb.com/kb/en/mariadb-connector-nodejs/)
- [MariaDB Tutorial](https://www.mariadbtutorial.com/)
- [MariaDB Foundation](https://mariadb.org/)

## Security Notes

- Never store passwords in plain text
- Use parameterized queries (already implemented)
- Limit database user permissions
- Use SSL for remote connections
- Keep MariaDB updated
- Run `mysql_secure_installation` after installation
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
