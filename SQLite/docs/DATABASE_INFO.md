# SQLite Database Information

## What is SQLite?

SQLite is a C-language library that implements a small, fast, self-contained, high-reliability, full-featured SQL database engine. SQLite is the most used database engine in the world.

### Key Features

- **Serverless**: No separate server process needed
- **Zero Configuration**: No setup or administration needed
- **Self-Contained**: Single file database
- **Cross-Platform**: Works on Windows, macOS, Linux, iOS, Android
- **ACID Compliant**: Atomic, Consistent, Isolated, Durable transactions
- **Public Domain**: Free for any use, commercial or private

## SQLite in This Module

### Database Driver

This module uses **better-sqlite3** - a fast, synchronous Node.js driver for SQLite3.

**Why better-sqlite3?**
- Faster than asynchronous alternatives
- Simpler API
- Better performance for most use cases
- Synchronous operations are easier to reason about

### Database Location

```
backend/data/database.db
```

The database file is automatically created on first run.

### Schema

```sql
CREATE TABLE items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price REAL,
  quantity INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);
```

These indexes improve query performance for filtering and searching operations.

## SQLite Data Types

| SQLite Type | Description | Example |
|------------|-------------|---------|
| INTEGER | Signed integer | 1, -42, 1000 |
| REAL | Floating point | 3.14, -0.5, 1299.99 |
| TEXT | Text string | 'Hello', 'Description' |
| BLOB | Binary data | Image files, documents |
| NULL | Null value | NULL |

## Advantages of SQLite

### 1. **Simplicity**
- No server to configure
- No network protocols
- No user management
- Single file database

### 2. **Performance**
- Very fast for read operations
- Good for <100K rows
- Low memory footprint
- Quick database creation

### 3. **Portability**
- Database is a single file
- Copy file = backup database
- Works across platforms
- Easy to distribute

### 4. **Reliability**
- ACID transactions
- Atomic commits
- Crash recovery
- Well tested

### 5. **Perfect for Learning**
- No installation complexity
- Immediate start
- Full SQL support
- Easy to understand

## Limitations

### 1. **Concurrency**
- Limited concurrent writes
- Good for single-user applications
- Not ideal for high-write scenarios

### 2. **Scale**
- Works best for <1GB databases
- Performance degrades with very large datasets
- Not designed for heavy concurrent access

### 3. **Features**
- No user management
- No network access
- Limited stored procedures
- No RIGHT JOIN or FULL OUTER JOIN

### 4. **Use Cases**
Best for:
- Mobile apps
- Desktop applications
- Small web applications
- Embedded systems
- Testing and development
- Learning SQL

Not ideal for:
- Large-scale web applications
- High-concurrency scenarios
- Multiple simultaneous writers
- Geographic distribution

## SQLite vs Other Databases

| Feature | SQLite | PostgreSQL | MySQL | MongoDB |
|---------|--------|------------|-------|---------|
| Server Required | No | Yes | Yes | Yes |
| Network Access | No | Yes | Yes | Yes |
| Concurrent Writes | Limited | Excellent | Good | Excellent |
| Max DB Size | 281 TB* | Unlimited | Large | Large |
| Setup Complexity | None | Medium | Medium | Medium |
| SQL Support | Full | Full | Full | No (NoSQL) |
| Best For | Local, Embedded | Web apps, Analytics | Web apps | Document storage |

*Theoretical limit; practical limit is much lower

## SQLite Configuration

This module uses these pragmas:

```javascript
db.pragma('foreign_keys = ON')
```

Enables foreign key constraints (off by default in SQLite).

### Other Useful Pragmas

```sql
-- Journal mode (default: DELETE)
PRAGMA journal_mode = WAL;  -- Write-Ahead Logging for better concurrency

-- Synchronous mode (default: FULL)
PRAGMA synchronous = NORMAL;  -- Balance between safety and speed

-- Temp storage (default: DEFAULT)
PRAGMA temp_store = MEMORY;  -- Store temp tables in memory

-- Cache size (default: -2000 = 2MB)
PRAGMA cache_size = -4000;  -- Use 4MB cache
```

## Backup and Maintenance

### Backup Database
```bash
# Simple copy (when database is not in use)
cp database.db database-backup.db

# Using sqlite3 CLI
sqlite3 database.db ".backup backup.db"
```

### Compact Database
```sql
VACUUM;  -- Rebuilds database, reclaims space
```

### Analyze for Optimization
```sql
ANALYZE;  -- Updates query optimizer statistics
```

## SQLite Tools

### 1. **sqlite3 CLI**
Command-line interface for SQLite.

```bash
# Open database
sqlite3 database.db

# Common commands
.tables          # List tables
.schema items    # Show table schema
.headers on      # Show column headers
.mode column     # Column output mode
```

### 2. **DB Browser for SQLite**
Free, open-source GUI tool for SQLite databases.
- Visual database browser
- Query editor
- Data editing
- Import/export

Download: https://sqlitebrowser.org/

### 3. **SQLite Viewer (VS Code Extension)**
View SQLite databases directly in VS Code.

## Performance Tips

### 1. **Use Transactions for Bulk Operations**
```javascript
const insert = db.prepare('INSERT INTO items (name, price) VALUES (?, ?)')

const insertMany = db.transaction((items) => {
  for (const item of items) insert.run(item.name, item.price)
})

insertMany(arrayOfItems)  // Much faster than individual inserts
```

### 2. **Use Prepared Statements**
```javascript
// Good - prepared statement
const stmt = db.prepare('SELECT * FROM items WHERE category = ?')
const items = stmt.all(category)

// Avoid - string concatenation
const items = db.prepare(`SELECT * FROM items WHERE category = '${category}'`).all()
```

### 3. **Create Appropriate Indexes**
```sql
CREATE INDEX idx_category ON items(category);
```

### 4. **Use WAL Mode for Concurrency**
```sql
PRAGMA journal_mode = WAL;
```

## Security Considerations

### 1. **SQL Injection Prevention**
Always use prepared statements (parameterized queries):

```javascript
// Safe
db.prepare('SELECT * FROM items WHERE name = ?').get(userInput)

// UNSAFE - vulnerable to SQL injection
db.prepare(`SELECT * FROM items WHERE name = '${userInput}'`).get()
```

### 2. **File Permissions**
Ensure proper file permissions on the database file:
```bash
chmod 600 database.db  # Read/write for owner only
```

### 3. **Input Validation**
Validate all user input before database operations (done in routes.js using validator library).

## Resources

- **Official SQLite Website**: https://www.sqlite.org/
- **better-sqlite3 Documentation**: https://github.com/WiseLibs/better-sqlite3
- **SQL Tutorial**: https://www.sqlitetutorial.net/
- **SQLite Browser**: https://sqlitebrowser.org/

## Conclusion

SQLite is an excellent choice for learning database concepts because:
- No setup required
- Full SQL support
- Easy to understand
- Perfect for small to medium applications
- Great for prototyping and development

For production applications with high concurrency needs, consider PostgreSQL or MySQL.
