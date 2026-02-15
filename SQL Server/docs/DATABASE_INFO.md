# SQL Server Database Information

## What is SQL Server?

Microsoft SQL Server is a relational database management system (RDBMS) developed by Microsoft. It is an enterprise-grade database platform known for its robust ACID compliance, advanced analytics capabilities, and deep integration with the Microsoft ecosystem.

### Key Features

- **Enterprise ACID Compliance**: Full transactional support with advanced isolation levels
- **T-SQL Language**: Powerful Transact-SQL dialect with rich procedural capabilities
- **Business Intelligence**: Built-in BI tools, SSRS, SSAS, and SSIS integration
- **High Availability**: Always On Availability Groups, failover clustering
- **Security**: Row-level security, dynamic data masking, transparent data encryption
- **Cross-Platform**: Runs on Windows and Linux (since SQL Server 2017)

## SQL Server Editions

| Edition | Use Case | Max RAM | Max DB Size |
|---------|----------|---------|-------------|
| **Express** | Learning, small apps | 1 GB | 10 GB |
| **Standard** | Medium workloads | 128 GB | 524 PB |
| **Enterprise** | Mission-critical | OS Max | 524 PB |
| **Developer** | Development/testing | OS Max | 524 PB |

### Express Edition (Free)
- Free to download and use
- Perfect for learning and small applications
- Limited to 1 GB RAM and 10 GB database size
- No SQL Server Agent

### Developer Edition (Free)
- Full Enterprise features
- Free for development and testing
- Cannot be used in production

## SQL Server in This Module

### Database Driver

This module uses **mssql** - a popular Node.js driver for SQL Server.

**Why mssql?**
- Promise-based API
- Connection pooling built-in
- Parameterized queries for security
- Support for stored procedures
- TypeScript support

### Connection

```javascript
const sql = require('mssql');

const config = {
  server: 'localhost',
  port: 1433,
  user: 'sa',
  password: 'YourStrong@Passw0rd',
  database: 'learning_db',
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000
  }
};

const pool = await sql.connect(config);
```

### Schema

```sql
CREATE TABLE items (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  category NVARCHAR(100),
  price DECIMAL(10,2),
  quantity INT DEFAULT 0,
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE()
);
```

### Indexes

```sql
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);
```

## SQL Server Data Types

| SQL Server Type | Description | Example |
|----------------|-------------|---------|
| INT | 32-bit integer | 1, -42, 1000 |
| BIGINT | 64-bit integer | Large numbers |
| DECIMAL(p,s) | Exact numeric | 1299.99 |
| FLOAT | Approximate numeric | 3.14159 |
| NVARCHAR(n) | Unicode variable-length string | N'Hello' |
| NVARCHAR(MAX) | Unicode text up to 2GB | Long text |
| VARCHAR(n) | Non-Unicode variable-length string | 'Hello' |
| BIT | Boolean (0 or 1) | 1 |
| DATETIME2 | Date and time (precision) | 2024-01-01 10:00:00.0000000 |
| DATE | Date only | 2024-01-01 |
| UNIQUEIDENTIFIER | UUID/GUID | NEWID() |
| VARBINARY(MAX) | Binary data | Files, images |

## T-SQL Specifics

### Identity Columns (Auto-Increment)
```sql
-- SQL Server uses IDENTITY
CREATE TABLE items (
  id INT IDENTITY(1,1) PRIMARY KEY
);

-- Get last inserted ID
SELECT SCOPE_IDENTITY();
```

### TOP vs LIMIT
```sql
-- SQL Server uses TOP (not LIMIT)
SELECT TOP 10 * FROM items ORDER BY created_at DESC;

-- With OFFSET-FETCH (SQL Server 2012+)
SELECT * FROM items
ORDER BY created_at DESC
OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;
```

### NULL Handling
```sql
-- SQL Server uses ISNULL (not IFNULL or COALESCE-only)
SELECT ISNULL(description, 'No description') FROM items;

-- COALESCE also works (ANSI standard)
SELECT COALESCE(description, 'No description') FROM items;
```

### Date Functions
```sql
-- Current date/time
SELECT GETDATE();           -- DATETIME
SELECT SYSDATETIME();       -- DATETIME2 (higher precision)
SELECT GETUTCDATE();        -- UTC time

-- Date formatting
SELECT FORMAT(GETDATE(), 'yyyy-MM-dd HH:mm:ss');

-- Date arithmetic
SELECT DATEADD(DAY, 7, GETDATE());     -- Add 7 days
SELECT DATEDIFF(DAY, created_at, GETDATE());  -- Days difference
```

### Stored Procedures
```sql
CREATE PROCEDURE sp_GetItemsByCategory
  @Category NVARCHAR(100)
AS
BEGIN
  SELECT * FROM items WHERE category = @Category
  ORDER BY created_at DESC;
END;

-- Execute
EXEC sp_GetItemsByCategory @Category = 'Electronics';
```

### Common Table Expressions (CTEs)
```sql
WITH CategoryStats AS (
  SELECT 
    category,
    COUNT(*) as item_count,
    AVG(price) as avg_price,
    SUM(price * quantity) as total_value
  FROM items
  GROUP BY category
)
SELECT * FROM CategoryStats
WHERE item_count > 1
ORDER BY total_value DESC;
```

### Window Functions
```sql
-- Row number
SELECT 
  ROW_NUMBER() OVER (ORDER BY price DESC) as rank,
  name, price, category
FROM items;

-- Running total
SELECT 
  name, price,
  SUM(price) OVER (ORDER BY created_at) as running_total
FROM items;

-- Rank within category
SELECT 
  name, category, price,
  RANK() OVER (PARTITION BY category ORDER BY price DESC) as category_rank
FROM items;
```

## Advantages of SQL Server

### 1. **Enterprise-Grade**
- Mission-critical workloads
- Advanced security features
- High availability options
- Built-in encryption

### 2. **Business Intelligence**
- SQL Server Reporting Services (SSRS)
- SQL Server Analysis Services (SSAS)
- SQL Server Integration Services (SSIS)
- Power BI integration

### 3. **Performance**
- Advanced query optimizer
- Columnstore indexes
- In-memory OLTP
- Query Store for performance monitoring

### 4. **Developer Experience**
- SQL Server Management Studio (SSMS)
- Azure Data Studio
- Visual Studio integration
- Excellent debugging tools

### 5. **Windows Ecosystem**
- Active Directory integration
- .NET Framework integration
- Windows authentication
- IIS integration

## Limitations

### 1. **Cost**
- Enterprise edition is expensive
- Standard edition has limitations
- Express edition has resource limits
- Per-core licensing model

### 2. **Platform History**
- Historically Windows-only (Linux support since 2017)
- Some features Windows-only
- SSMS only available on Windows
- Best experience on Windows

### 3. **Resource Usage**
- Higher memory requirements than lightweight databases
- Minimum 1 GB RAM (Express)
- Recommended 8-32 GB RAM for production
- Larger disk footprint

## SQL Server vs Other Databases

| Feature | SQL Server | PostgreSQL | MySQL | SQLite |
|---------|-----------|------------|-------|--------|
| Type | Enterprise RDBMS | Open Source RDBMS | Open Source RDBMS | Embedded |
| License | Commercial/Free | Open Source | Open Source | Public Domain |
| Cost | Free (Express) to $$$ | Free | Free | Free |
| Max DB Size | 524 PB | Unlimited | Large | 281 TB |
| Stored Procedures | T-SQL | PL/pgSQL | MySQL Proc | Limited |
| JSON Support | Good | Excellent | Good | Basic |
| BI Integration | Excellent | Good | Good | None |
| Windows Integration | Excellent | Good | Good | N/A |
| Linux Support | Yes (2017+) | Yes | Yes | Yes |
| Cloud | Azure SQL | Various | Various | N/A |

## System Requirements

### Minimum (Express Edition)
- **RAM**: 1 GB
- **Disk**: 6 GB
- **CPU**: 1 GHz x64
- **OS**: Windows 10+ / Linux

### Recommended (Production)
- **RAM**: 8-32 GB
- **Disk**: SSD recommended, 50+ GB
- **CPU**: 4+ cores
- **OS**: Windows Server / Linux

## SQL Server Tools

### 1. **SQL Server Management Studio (SSMS)**
The primary GUI tool for SQL Server (Windows only).
- Query editor with IntelliSense
- Object Explorer
- Visual query designer
- Performance monitoring
- Database administration
- Download: https://aka.ms/ssmsfullsetup

### 2. **Azure Data Studio**
Cross-platform (Windows, macOS, Linux).
- Modern interface
- Built-in terminal
- Extensions marketplace
- Jupyter notebook support
- Download: https://aka.ms/azuredatastudio

### 3. **sqlcmd**
Command-line tool for SQL Server.
```bash
# Connect to SQL Server
sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd"

# Run a query
sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "SELECT @@VERSION"

# Run a script
sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -i script.sql
```

## Security Considerations

### 1. **Parameterized Queries**
Always use parameterized queries to prevent SQL injection:

```javascript
// Safe - parameterized query
const result = await pool.request()
  .input('name', sql.NVarChar, userInput)
  .query('SELECT * FROM items WHERE name = @name');

// UNSAFE - string concatenation
const result = await pool.request()
  .query(`SELECT * FROM items WHERE name = '${userInput}'`);
```

### 2. **Connection Security**
- Use strong passwords for the `sa` account
- Consider Windows Authentication when possible
- Enable encrypted connections in production
- Use firewall rules to restrict access

### 3. **Input Validation**
Validate all user input before database operations (done in routes.js using validator library).

### 4. **Principle of Least Privilege**
- Create application-specific database users
- Grant only necessary permissions
- Avoid using `sa` account in production

## Performance Tips

### 1. **Use Connection Pooling**
```javascript
const config = {
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000
  }
};
```

### 2. **Create Appropriate Indexes**
```sql
CREATE INDEX idx_category ON items(category);
CREATE INDEX idx_name ON items(name);
```

### 3. **Use Query Store**
```sql
ALTER DATABASE learning_db SET QUERY_STORE = ON;
```

### 4. **Monitor with DMVs**
```sql
-- Top queries by CPU
SELECT TOP 10
  qs.total_worker_time / qs.execution_count AS avg_cpu,
  SUBSTRING(st.text, 1, 100) AS query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) st
ORDER BY avg_cpu DESC;
```

## Backup and Maintenance

### Backup Database
```sql
-- Full backup
BACKUP DATABASE learning_db
TO DISK = '/var/opt/mssql/backup/learning_db.bak'
WITH FORMAT, COMPRESSION;

-- Restore
RESTORE DATABASE learning_db
FROM DISK = '/var/opt/mssql/backup/learning_db.bak'
WITH REPLACE;
```

### Maintenance Tasks
```sql
-- Update statistics
UPDATE STATISTICS items;

-- Rebuild indexes
ALTER INDEX ALL ON items REBUILD;

-- Check database integrity
DBCC CHECKDB('learning_db');
```

## Resources

- **Official Documentation**: https://learn.microsoft.com/en-us/sql/sql-server/
- **mssql Node.js Driver**: https://github.com/tediousjs/node-mssql
- **SSMS Download**: https://aka.ms/ssmsfullsetup
- **Azure Data Studio**: https://aka.ms/azuredatastudio
- **SQL Server Docker**: https://hub.docker.com/_/microsoft-mssql-server
- **T-SQL Reference**: https://learn.microsoft.com/en-us/sql/t-sql/

## Conclusion

SQL Server is an excellent choice for:
- Enterprise applications with high reliability requirements
- Business intelligence and analytics workloads
- Windows ecosystem integration
- Organizations already using Microsoft technologies
- Applications requiring advanced security features

For lightweight or embedded use cases, consider SQLite. For open-source alternatives, consider PostgreSQL or MySQL.
