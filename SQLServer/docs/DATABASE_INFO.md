# SQL Server Database Information

## What is SQL Server?

Microsoft SQL Server is an enterprise-grade relational database management system (RDBMS) developed by Microsoft. It provides robust data storage, processing, and analysis capabilities for mission-critical applications.

### Key Features

- **Enterprise ACID**: Full ACID compliance for reliable transactions
- **T-SQL**: Powerful Transact-SQL query language
- **Business Intelligence**: Built-in analytics and reporting tools
- **High Availability**: Always On availability groups and failover clustering
- **Security**: Row-level security, dynamic data masking, transparent data encryption
- **Scalability**: Handles enterprise-scale workloads efficiently

## SQL Server in This Module

### Database Driver

This module uses **mssql** - the Microsoft SQL Server client for Node.js.

**Why mssql?**
- Official Microsoft-recommended driver
- Connection pooling support
- Parameterized queries for SQL injection prevention
- Streaming support for large datasets
- Promise-based API

### Database Connection

```javascript
// Connection Configuration
const config = {
  user: 'sa',
  password: 'YourStrong!Password',
  server: 'localhost',
  database: 'learning_db',
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  pool: {
    max: 20,
    min: 0,
    idleTimeoutMillis: 30000
  }
};
```

The SQL Server instance must be running before starting the application.

### Schema (Tables)

```sql
-- Items Table Structure
CREATE TABLE items (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  category NVARCHAR(100),
  price DECIMAL(10,2) DEFAULT 0,
  quantity INT DEFAULT 0,
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE()
)
```

### Indexes

```sql
-- Single Field Indexes
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);
```

These indexes improve query performance for filtering, searching, and sorting operations.

## SQL Server Data Types

| Data Type | Description | Example |
|-----------|-------------|---------|
| INT | Integer values | 42, -10, 0 |
| BIGINT | Large integer values | 9223372036854775807 |
| DECIMAL(p,s) | Exact numeric values | 1299.99, 3.14 |
| NVARCHAR(n) | Unicode string (variable) | N'Hello', N'名前' |
| NVARCHAR(MAX) | Unicode string (up to 2GB) | Long text content |
| DATETIME2 | Date and time | '2024-01-01T10:00:00' |
| BIT | Boolean (0 or 1) | 0, 1 |
| UNIQUEIDENTIFIER | GUID/UUID | NEWID() |
| VARBINARY(MAX) | Binary data | Image/file data |

## Advantages of SQL Server

### 1. **Enterprise Grade**
- ACID-compliant transactions
- High availability with Always On
- Enterprise-level security features
- Mission-critical reliability

### 2. **Business Intelligence**
- SQL Server Reporting Services (SSRS)
- SQL Server Analysis Services (SSAS)
- SQL Server Integration Services (SSIS)
- Power BI integration

### 3. **Performance**
- Query optimizer with cost-based optimization
- In-memory OLTP (Hekaton)
- Columnstore indexes for analytics
- Intelligent query processing

### 4. **Developer-Friendly**
- T-SQL with rich syntax
- Stored procedures and functions
- Common Table Expressions (CTEs)
- Window functions
- JSON support

### 5. **Windows Ecosystem Integration**
- Active Directory integration
- .NET Framework support
- Visual Studio integration
- Azure cloud connectivity

## Comparison with Other Databases

| Feature | SQL Server | MySQL | PostgreSQL |
|---------|-----------|-------|------------|
| License | Commercial/Free Dev | Open Source | Open Source |
| ACID | Full | Full (InnoDB) | Full |
| Max DB Size | 524 PB | 256 TB | Unlimited |
| JSON Support | Yes | Yes | Excellent |
| BI Tools | Built-in | Third-party | Third-party |
| Windows Integration | Excellent | Good | Good |
| Linux Support | Yes (2017+) | Yes | Yes |
| Best For | Enterprise, BI | Web apps | Complex queries |

## T-SQL Query Features

SQL Server supports powerful T-SQL for flexible querying:

```sql
-- Comparison Operators
SELECT * FROM items WHERE price >= 100;
SELECT * FROM items WHERE price <= 500;
SELECT * FROM items WHERE quantity > 10;
SELECT * FROM items WHERE price < 50;
SELECT * FROM items WHERE name = N'Laptop';
SELECT * FROM items WHERE category <> N'Books';

-- Logical Operators
SELECT * FROM items WHERE price >= 100 AND category = N'Electronics';
SELECT * FROM items WHERE category = N'Books' OR category = N'Electronics';

-- String Operations
SELECT * FROM items WHERE name LIKE N'%laptop%';
SELECT * FROM items WHERE description LIKE N'%gaming%';

-- IN Operator
SELECT * FROM items WHERE category IN (N'Electronics', N'Books', N'Toys');

-- BETWEEN Operator
SELECT * FROM items WHERE price BETWEEN 100 AND 1000;
```

## Advanced T-SQL Features

### Common Table Expressions (CTEs)
```sql
WITH CategoryStats AS (
  SELECT category,
         COUNT(*) as item_count,
         AVG(price) as avg_price,
         SUM(quantity) as total_quantity
  FROM items
  GROUP BY category
)
SELECT * FROM CategoryStats
WHERE avg_price > 100
ORDER BY avg_price DESC;
```

### Window Functions
```sql
SELECT name, category, price,
  ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) as rank_in_category,
  AVG(price) OVER (PARTITION BY category) as avg_category_price
FROM items;
```

### MERGE Statement
```sql
MERGE INTO items AS target
USING (SELECT @name as name, @price as price) AS source
ON target.name = source.name
WHEN MATCHED THEN
  UPDATE SET price = source.price, updated_at = GETDATE()
WHEN NOT MATCHED THEN
  INSERT (name, price) VALUES (source.name, source.price);
```

## Connection Configuration

```javascript
// Local SQL Server
const config = {
  server: 'localhost',
  port: 1433,
  user: 'sa',
  password: 'YourStrong!Password',
  database: 'learning_db'
};

// Azure SQL Database
const config = {
  server: 'your-server.database.windows.net',
  user: 'your-username',
  password: 'your-password',
  database: 'your-database',
  options: { encrypt: true }
};

// Connection Pool Options
const config = {
  pool: {
    max: 20,
    min: 0,
    idleTimeoutMillis: 30000
  }
};
```

## Backup and Maintenance

### Backup Database
```sql
-- Full backup
BACKUP DATABASE learning_db
TO DISK = 'C:\Backup\learning_db.bak'
WITH FORMAT, INIT;

-- Differential backup
BACKUP DATABASE learning_db
TO DISK = 'C:\Backup\learning_db_diff.bak'
WITH DIFFERENTIAL;

-- Transaction log backup
BACKUP LOG learning_db
TO DISK = 'C:\Backup\learning_db_log.trn';
```

### Restore Database
```sql
-- Restore from full backup
RESTORE DATABASE learning_db
FROM DISK = 'C:\Backup\learning_db.bak'
WITH REPLACE;
```

### Analyze Database Performance
```sql
-- View execution plan
SET SHOWPLAN_XML ON;
SELECT * FROM items WHERE category = N'Electronics';
SET SHOWPLAN_XML OFF;

-- Check index usage
SELECT * FROM sys.dm_db_index_usage_stats
WHERE database_id = DB_ID('learning_db');
```

## SQL Server Tools

### 1. **SQL Server Management Studio (SSMS)**
Official GUI tool for SQL Server management.
- Visual database explorer
- Query editor with IntelliSense
- Performance monitoring
- Database administration

Download: https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms

### 2. **Azure Data Studio**
Cross-platform database tool.
- Works on Windows, macOS, Linux
- Built-in Jupyter notebooks
- Extension marketplace
- Source control integration

Download: https://docs.microsoft.com/en-us/sql/azure-data-studio/

### 3. **sqlcmd**
Command-line tool for SQL Server.
```bash
sqlcmd -S localhost -U sa -P "YourStrong!Password" -d learning_db
```

## Performance Tips

### 1. **Use Parameterized Queries**
```javascript
// Prevents SQL injection and improves performance
const result = await pool.request()
  .input('category', sql.NVarChar(100), 'Electronics')
  .query('SELECT * FROM items WHERE category = @category');
```

### 2. **Leverage Indexes**
```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_price ON items(price);
```

### 3. **Use Connection Pooling**
```javascript
const config = {
  pool: {
    max: 20,
    min: 0,
    idleTimeoutMillis: 30000
  }
};
```

### 4. **Use OUTPUT Clause**
```sql
-- Return inserted/updated data without additional SELECT
INSERT INTO items (name, price)
OUTPUT INSERTED.*
VALUES (@name, @price);
```

## Security Considerations

### 1. **Parameterized Queries**
Always use parameterized queries to prevent SQL injection:

```javascript
// Safe - parameterized query
const result = await pool.request()
  .input('name', sql.NVarChar(255), userInput)
  .query('SELECT * FROM items WHERE name = @name');
```

### 2. **Authentication**
Use Windows Authentication or strong SQL Authentication:

```javascript
// SQL Authentication
const config = {
  user: 'app_user',
  password: 'StrongPassword!123',
  server: 'localhost'
};
```

### 3. **Encryption**
Enable encrypted connections:

```javascript
const config = {
  options: {
    encrypt: true,
    trustServerCertificate: false // Use true only in development
  }
};
```

### 4. **Principle of Least Privilege**
Create users with minimal required permissions:

```sql
CREATE LOGIN app_user WITH PASSWORD = 'StrongPassword!123';
CREATE USER app_user FOR LOGIN app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON items TO app_user;
```

## Resources

- **Official SQL Server Website**: https://www.microsoft.com/en-us/sql-server/
- **SQL Server Documentation**: https://docs.microsoft.com/en-us/sql/sql-server/
- **mssql Node.js Driver**: https://www.npmjs.com/package/mssql
- **Azure SQL Database**: https://azure.microsoft.com/en-us/products/azure-sql/database/
- **SQL Server on Docker**: https://hub.docker.com/_/microsoft-mssql-server

## Conclusion

SQL Server is excellent for enterprise application development because:
- Enterprise-grade ACID compliance
- Built-in business intelligence tools
- Excellent Windows ecosystem integration
- Powerful T-SQL query language
- High availability and disaster recovery

Perfect for:
- Enterprise applications
- Business intelligence and analytics
- Windows-based ecosystems
- Mission-critical systems
- Data warehousing
