# MySQL Database Information

## What is MySQL?

MySQL is the world's most popular open-source relational database management system. Originally developed by MySQL AB and now owned by Oracle Corporation, MySQL powers many of the world's largest websites and applications.

### Key Features

- **High Performance**: Fast, reliable, and scalable
- **InnoDB Storage Engine**: ACID-compliant with transactions
- **Replication**: Master-slave and master-master replication
- **Partitioning**: Table partitioning for large datasets
- **Full-Text Search**: Built-in fulltext indexing
- **JSON Support**: Native JSON data type (MySQL 5.7+)
- **Stored Procedures**: Functions, triggers, and events
- **Easy to Use**: Simple installation and management
- **Wide Platform Support**: Runs on Linux, Windows, macOS
- **Large Community**: Extensive documentation and support

## MySQL in This Module

### Database Driver

This module uses **mysql2** - the fast MySQL driver for Node.js with Promise support.

**Why mysql2?**
- Native Promise/async-await support
- Prepared statements for security
- Connection pooling built-in
- Faster than the original mysql driver
- Active development and maintenance
- Excellent performance

### Connection Configuration

```javascript
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'learning_db',
  waitForConnections: true,
  connectionLimit: 20
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_items_category (category),
  INDEX idx_items_name (name),
  FULLTEXT INDEX idx_items_fulltext (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## MySQL Data Types Used

### INT AUTO_INCREMENT
Auto-incrementing integer for primary keys.

```sql
id INT AUTO_INCREMENT PRIMARY KEY
```

### VARCHAR(n)
Variable-length character string with maximum length n.

```sql
name VARCHAR(255) NOT NULL
category VARCHAR(100)
```

### TEXT
Variable unlimited length text. Supports up to 65,535 characters.

```sql
description TEXT
```

### DECIMAL(p, s)
Exact numeric with precision (p) and scale (s). Perfect for money.

```sql
price DECIMAL(10, 2)  -- Up to 10 digits, 2 after decimal point
```

### INT
4-byte integer (-2,147,483,648 to 2,147,483,647).

```sql
quantity INT DEFAULT 0
```

### TIMESTAMP
Date and time with automatic initialization and update.

```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

## Placeholders in Queries

MySQL uses **? (question mark)** as parameter placeholders (similar to SQLite).

```javascript
// Correct - MySQL placeholder
pool.query('SELECT * FROM items WHERE id = ?', [id]);

// Wrong - PostgreSQL style ($1)
pool.query('SELECT * FROM items WHERE id = $1', [id]);
```

### Multiple Placeholders
```javascript
pool.query(
  'INSERT INTO items (name, category, price) VALUES (?, ?, ?)',
  ['Laptop', 'Electronics', 999.99]
);
```

### Named Placeholders (mysql2 extension)
```javascript
pool.query(
  'INSERT INTO items SET ?',
  [{ name: 'Laptop', category: 'Electronics', price: 999.99 }]
);
```

## MySQL-Specific Features

### 1. Storage Engines

**InnoDB** (Default and Recommended):
- ACID-compliant transactions
- Foreign key constraints
- Row-level locking
- Crash recovery

```sql
CREATE TABLE items (...) ENGINE=InnoDB;
```

**MyISAM** (Legacy):
- Table-level locking
- No transactions
- No foreign keys
- Faster for read-heavy operations

### 2. Character Sets and Collation

```sql
-- utf8mb4 supports full Unicode including emojis
CREATE TABLE items (...)
DEFAULT CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci;
```

### 3. Auto-Update Timestamp

MySQL can automatically update timestamp on row modification:

```sql
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 4. Fulltext Indexes

For efficient text searching:

```sql
FULLTEXT INDEX idx_items_fulltext (name, description)
```

Usage:
```sql
SELECT * FROM items 
WHERE MATCH(name, description) AGAINST('laptop' IN NATURAL LANGUAGE MODE);
```

### 5. JSON Support (MySQL 5.7+)

```sql
-- Create JSON column
ALTER TABLE items ADD COLUMN metadata JSON;

-- Insert JSON data
INSERT INTO items (name, metadata) 
VALUES ('Laptop', '{"brand": "Dell", "warranty": 3}');

-- Query JSON data
SELECT * FROM items 
WHERE JSON_EXTRACT(metadata, '$.brand') = 'Dell';
```

## Query Syntax Differences

### Case-Insensitive Search

**MySQL** (LIKE is case-insensitive by default):
```sql
SELECT * FROM items WHERE name LIKE '%laptop%';
```

**PostgreSQL** (needs ILIKE):
```sql
SELECT * FROM items WHERE name ILIKE '%laptop%';
```

### String Concatenation

**MySQL**:
```sql
SELECT CONCAT(name, ' - ', category) FROM items;
```

**PostgreSQL**:
```sql
SELECT name || ' - ' || category FROM items;
```

### Limit with Offset

**MySQL** (two syntaxes):
```sql
SELECT * FROM items LIMIT 10 OFFSET 20;
SELECT * FROM items LIMIT 20, 10;  -- offset, limit
```

**PostgreSQL**:
```sql
SELECT * FROM items LIMIT 10 OFFSET 20;
```

### Date Functions

**MySQL**:
```sql
SELECT NOW(), CURDATE(), DATE_FORMAT(created_at, '%Y-%m-%d');
```

**PostgreSQL**:
```sql
SELECT NOW(), CURRENT_DATE, TO_CHAR(created_at, 'YYYY-MM-DD');
```

## Transactions

MySQL InnoDB supports full ACID transactions:

```javascript
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  
  await connection.query('INSERT INTO items (name, price) VALUES (?, ?)', 
    ['Item 1', 100]);
  await connection.query('UPDATE items SET quantity = quantity - 1 WHERE id = ?', 
    [5]);
  
  await connection.commit();
} catch (err) {
  await connection.rollback();
  throw err;
} finally {
  connection.release();
}
```

## Indexes

### Regular Index
```sql
CREATE INDEX idx_category ON items(category);
```

### Unique Index
```sql
CREATE UNIQUE INDEX idx_email ON users(email);
```

### Composite Index
```sql
CREATE INDEX idx_cat_price ON items(category, price);
```

### Fulltext Index
```sql
CREATE FULLTEXT INDEX idx_search ON items(name, description);
```

## Performance Optimization

### Connection Pooling
```javascript
const pool = mysql.createPool({
  connectionLimit: 20,  // Max connections
  queueLimit: 0,        // Unlimited queued requests
  enableKeepAlive: true
});
```

### Query Optimization
```sql
-- Use EXPLAIN to analyze queries
EXPLAIN SELECT * FROM items WHERE category = 'Electronics';

-- Add appropriate indexes
CREATE INDEX idx_category ON items(category);

-- Use LIMIT for large datasets
SELECT * FROM items LIMIT 100;
```

### Buffer Pool Size
```sql
-- Increase InnoDB buffer pool (75% of RAM for dedicated server)
SET GLOBAL innodb_buffer_pool_size = 2147483648; -- 2GB
```

## Advanced Features

### Stored Procedures
```sql
DELIMITER //
CREATE PROCEDURE GetItemsByCategory(IN cat VARCHAR(100))
BEGIN
  SELECT * FROM items WHERE category = cat;
END //
DELIMITER ;

CALL GetItemsByCategory('Electronics');
```

### Triggers
```sql
DELIMITER //
CREATE TRIGGER update_timestamp
BEFORE UPDATE ON items
FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END //
DELIMITER ;
```

### Views
```sql
CREATE VIEW expensive_items AS
SELECT id, name, price FROM items WHERE price > 1000;

SELECT * FROM expensive_items;
```

### Window Functions (MySQL 8.0+)
```sql
SELECT 
  name,
  price,
  ROW_NUMBER() OVER (ORDER BY price DESC) as rank
FROM items;
```

## Database Normalization

### First Normal Form (1NF)
- Each column contains atomic values
- Each row is unique
- No repeating groups

### Second Normal Form (2NF)
- Meets 1NF requirements
- No partial dependencies on composite keys

### Third Normal Form (3NF)
- Meets 2NF requirements
- No transitive dependencies

### Example: Normalizing Items

**Denormalized** (Bad):
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_info VARCHAR(500),  -- "John Doe, john@example.com, 555-1234"
  items VARCHAR(1000)          -- "Laptop, Mouse, Keyboard"
);
```

**Normalized** (Good):
```sql
CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50)
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT,
  order_date TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE order_items (
  order_id INT,
  item_id INT,
  quantity INT,
  PRIMARY KEY (order_id, item_id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (item_id) REFERENCES items(id)
);
```

## Backup and Recovery

### Backup
```bash
# Full database backup
mysqldump -u root -p learning_db > backup.sql

# With compression
mysqldump -u root -p learning_db | gzip > backup.sql.gz

# Specific table
mysqldump -u root -p learning_db items > items_backup.sql
```

### Restore
```bash
# Restore database
mysql -u root -p learning_db < backup.sql

# Restore from compressed backup
gunzip < backup.sql.gz | mysql -u root -p learning_db
```

## Security Best Practices

1. **Use Prepared Statements** (prevents SQL injection)
2. **Limit User Privileges** (principle of least privilege)
3. **Use SSL/TLS** for connections
4. **Regular Updates** (keep MySQL updated)
5. **Strong Passwords** (use complex passwords)
6. **Firewall Rules** (restrict database access)
7. **Audit Logging** (track database changes)

## Common Pitfalls

### 1. String Comparison Case Sensitivity
By default, MySQL string comparison is case-insensitive with utf8mb4_unicode_ci collation.

### 2. Silent Data Truncation
MySQL may truncate data that exceeds column length. Enable strict mode:
```sql
SET sql_mode = 'STRICT_ALL_TABLES';
```

### 3. Implicit Type Conversion
MySQL converts types automatically, which can be slow:
```sql
-- Slow (converts numbers to strings)
SELECT * FROM items WHERE id = '123';

-- Fast (uses index)
SELECT * FROM items WHERE id = 123;
```

## Resources

- **Official Documentation**: https://dev.mysql.com/doc/
- **MySQL Tutorial**: https://www.mysqltutorial.org/
- **mysql2 Driver**: https://github.com/sidorares/node-mysql2
- **Performance Tuning**: https://dev.mysql.com/doc/refman/8.0/en/optimization.html
- **SQL Best Practices**: https://use-the-index-luke.com/

## Comparison with Other Databases

| Feature | MySQL | PostgreSQL | SQLite |
|---------|-------|------------|--------|
| Type | Client-Server | Client-Server | File-based |
| ACID | Yes (InnoDB) | Yes | Yes |
| Replication | Yes | Yes | No |
| JSON Support | Yes (5.7+) | Yes (better) | Yes (3.38+) |
| Fulltext | Yes | Yes | Yes (FTS5) |
| Performance | Very Fast | Fast | Fastest (read) |
| Concurrency | Good | Excellent | Limited |
| Use Case | Web apps | Complex queries | Embedded |

## Next Steps

1. Explore `examples/query_examples.txt` for 150+ MySQL queries
2. Try the CRUD operations in the frontend
3. Experiment with stored procedures and triggers
4. Practice database normalization
5. Learn about replication and scaling

Happy learning with MySQL! 🐬
