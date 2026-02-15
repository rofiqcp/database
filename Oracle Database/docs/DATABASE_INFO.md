# Oracle Database Information

## What is Oracle Database?

Oracle Database is a multi-model relational database management system (RDBMS) developed by Oracle Corporation. It is the world's most widely used enterprise database, known for its reliability, scalability, and comprehensive feature set. Oracle Database is the industry standard for mission-critical applications in financial services, healthcare, government, and large enterprises.

### Key Features

- **Enterprise ACID**: Full ACID compliance with advanced transaction management
- **Scalability**: Supports databases from gigabytes to petabytes
- **High Availability**: Real Application Clusters (RAC), Data Guard, GoldenGate
- **Security**: Advanced security features including encryption, auditing, and fine-grained access control
- **Multi-Model**: Supports relational, JSON, XML, spatial, graph, and key-value data
- **PL/SQL**: Powerful procedural language extension for SQL
- **Partitioning**: Table and index partitioning for massive datasets
- **Mature Ecosystem**: 40+ years of development and enterprise support

## Oracle Database Architecture

### System Global Area (SGA)

The SGA is a shared memory region that contains data and control information for the Oracle instance:

- **Database Buffer Cache**: Caches data blocks read from disk
- **Shared Pool**: Caches SQL statements, PL/SQL code, and data dictionary
- **Redo Log Buffer**: Records all changes made to the database
- **Large Pool**: Optional area for large memory allocations (backup, parallel queries)
- **Java Pool**: Memory for Java Virtual Machine operations
- **Streams Pool**: Memory for Oracle Streams operations

### Program Global Area (PGA)

The PGA is a non-shared memory region for each server process:

- **Sort Area**: Memory for sorting operations
- **Hash Area**: Memory for hash joins
- **Session Memory**: Session-specific information
- **Private SQL Area**: Runtime memory for SQL statements

### Tablespaces and Data Files

Oracle organizes data into logical structures:

```
Database
  └── Tablespace (logical container)
       └── Segment (table, index, etc.)
            └── Extent (contiguous blocks)
                 └── Data Block (smallest unit)
```

- **SYSTEM/SYSAUX**: System tablespaces for internal objects
- **USERS**: Default tablespace for user data
- **TEMP**: Temporary tablespace for sorting operations
- **UNDO**: Undo tablespace for transaction rollback

### Background Processes

- **DBWR (Database Writer)**: Writes dirty buffers to data files
- **LGWR (Log Writer)**: Writes redo log entries to disk
- **CKPT (Checkpoint)**: Signals DBWR and updates data file headers
- **SMON (System Monitor)**: Instance recovery and space management
- **PMON (Process Monitor)**: Cleans up failed processes
- **ARCH (Archiver)**: Copies redo log files for recovery
- **LREG (Listener Registration)**: Registers with the Oracle listener

## Oracle Database in This Module

### Database Driver

This module uses **oracledb** (node-oracledb) - the official Oracle Database driver for Node.js.

**Why oracledb?**
- Official Oracle-maintained driver
- Connection pooling built-in
- Support for all Oracle data types
- Both Thin and Thick client modes
- Excellent performance

### Connection Configuration

```javascript
const dbConfig = {
  user: 'system',
  password: 'oracle',
  connectString: 'localhost:1521/XEPDB1',
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1
};
```

### Schema

```sql
-- Sequence for auto-increment
CREATE SEQUENCE items_seq START WITH 1 INCREMENT BY 1;

-- Table definition
CREATE TABLE items (
  id NUMBER PRIMARY KEY,
  name VARCHAR2(255) NOT NULL,
  description CLOB,
  category VARCHAR2(100),
  price NUMBER(10,2),
  quantity NUMBER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for auto-increment
CREATE OR REPLACE TRIGGER items_bi
BEFORE INSERT ON items
FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT items_seq.NEXTVAL INTO :NEW.id FROM DUAL;
  END IF;
END;
/

-- Indexes
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_name ON items(name);
```

> **Note (Oracle 12c+):** You can also use `GENERATED ALWAYS AS IDENTITY` for auto-increment columns, removing the need for sequences and triggers.

## Oracle Data Types

| Oracle Type | Description | Example |
|------------|-------------|---------|
| NUMBER(p,s) | Fixed-point or floating-point number | NUMBER(10,2) for currency |
| VARCHAR2(n) | Variable-length string (up to 4000 bytes) | VARCHAR2(255) |
| CHAR(n) | Fixed-length string | CHAR(10) |
| CLOB | Character Large Object (up to 4GB) | Long text content |
| BLOB | Binary Large Object (up to 4GB) | Image files |
| DATE | Date and time (to the second) | SYSDATE |
| TIMESTAMP | Date and time with fractional seconds | SYSTIMESTAMP |
| RAW(n) | Raw binary data | RAW(16) for UUIDs |
| XMLTYPE | XML data | Structured XML storage |
| JSON | JSON data (21c+) | Native JSON support |

## PL/SQL Basics

PL/SQL (Procedural Language for SQL) is Oracle's procedural extension to SQL:

### Anonymous Block
```sql
DECLARE
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM items;
  DBMS_OUTPUT.PUT_LINE('Total items: ' || v_count);
EXCEPTION
  WHEN OTHERS THEN
    DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/
```

### Stored Procedure
```sql
CREATE OR REPLACE PROCEDURE add_item(
  p_name IN VARCHAR2,
  p_price IN NUMBER,
  p_category IN VARCHAR2
) AS
BEGIN
  INSERT INTO items (name, price, category)
  VALUES (p_name, p_price, p_category);
  COMMIT;
END;
/
```

### Function
```sql
CREATE OR REPLACE FUNCTION get_item_count(
  p_category IN VARCHAR2
) RETURN NUMBER AS
  v_count NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM items WHERE category = p_category;
  RETURN v_count;
END;
/
```

### Package
```sql
CREATE OR REPLACE PACKAGE item_pkg AS
  PROCEDURE add_item(p_name VARCHAR2, p_price NUMBER);
  FUNCTION get_total_value RETURN NUMBER;
END item_pkg;
/

CREATE OR REPLACE PACKAGE BODY item_pkg AS
  PROCEDURE add_item(p_name VARCHAR2, p_price NUMBER) AS
  BEGIN
    INSERT INTO items (name, price) VALUES (p_name, p_price);
    COMMIT;
  END;

  FUNCTION get_total_value RETURN NUMBER AS
    v_total NUMBER;
  BEGIN
    SELECT SUM(price * quantity) INTO v_total FROM items;
    RETURN NVL(v_total, 0);
  END;
END item_pkg;
/
```

## Sequences and Triggers

### Sequences

Sequences generate unique numeric values:

```sql
-- Create sequence
CREATE SEQUENCE order_seq
  START WITH 1000
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;

-- Use sequence
SELECT order_seq.NEXTVAL FROM DUAL;  -- Next value
SELECT order_seq.CURRVAL FROM DUAL;  -- Current value

-- In INSERT
INSERT INTO orders (id, customer)
VALUES (order_seq.NEXTVAL, 'John');
```

### Triggers

Triggers execute automatically on table events:

```sql
-- Before Insert trigger
CREATE OR REPLACE TRIGGER items_bi
BEFORE INSERT ON items
FOR EACH ROW
BEGIN
  IF :NEW.id IS NULL THEN
    SELECT items_seq.NEXTVAL INTO :NEW.id FROM DUAL;
  END IF;
  :NEW.created_at := SYSTIMESTAMP;
  :NEW.updated_at := SYSTIMESTAMP;
END;
/

-- Before Update trigger
CREATE OR REPLACE TRIGGER items_bu
BEFORE UPDATE ON items
FOR EACH ROW
BEGIN
  :NEW.updated_at := SYSTIMESTAMP;
END;
/

-- After Delete trigger (audit)
CREATE OR REPLACE TRIGGER items_ad
AFTER DELETE ON items
FOR EACH ROW
BEGIN
  INSERT INTO items_audit (item_id, deleted_at, deleted_by)
  VALUES (:OLD.id, SYSTIMESTAMP, USER);
END;
/
```

## Oracle vs MySQL/PostgreSQL

| Feature | Oracle | MySQL | PostgreSQL |
|---------|--------|-------|------------|
| License | Commercial (XE is free) | Open Source (GPL) | Open Source (PostgreSQL) |
| ACID Compliance | Full | InnoDB only | Full |
| Auto-Increment | SEQUENCE + TRIGGER / IDENTITY (12c+) | AUTO_INCREMENT | SERIAL / IDENTITY |
| NULL handling | NVL(), NVL2() | IFNULL(), COALESCE() | COALESCE() |
| String concat | \|\| operator | CONCAT() | \|\| operator |
| Current date | SYSDATE, SYSTIMESTAMP | NOW(), CURRENT_TIMESTAMP | NOW(), CURRENT_TIMESTAMP |
| LIMIT/OFFSET | FETCH FIRST (12c+) / ROWNUM | LIMIT/OFFSET | LIMIT/OFFSET |
| Stored Procedures | PL/SQL | Stored procedures | PL/pgSQL |
| Partitioning | Built-in (Enterprise) | Built-in (8.0+) | Built-in (10+) |
| JSON Support | 12c+ native | 5.7+ | 9.2+ (excellent) |
| RAC / Clustering | RAC (unique) | Group Replication | Patroni/Citus |
| Max DB Size | Unlimited | 256 TB | Unlimited |
| Community | Enterprise-focused | Largest | Growing rapidly |

### Oracle-Specific SQL

```sql
-- DUAL table (Oracle-specific pseudo-table)
SELECT SYSDATE FROM DUAL;
SELECT 1 + 1 FROM DUAL;

-- NVL instead of COALESCE (Oracle-specific)
SELECT NVL(description, 'No description') FROM items;

-- ROWNUM (pre-12c pagination)
SELECT * FROM (
  SELECT t.*, ROWNUM rn FROM items t WHERE ROWNUM <= 20
) WHERE rn > 10;

-- FETCH FIRST (12c+ pagination, ANSI SQL)
SELECT * FROM items
ORDER BY created_at DESC
FETCH FIRST 10 ROWS ONLY;

-- DECODE (Oracle-specific CASE alternative)
SELECT DECODE(category, 'Electronics', 'Tech', 'Other') FROM items;

-- CONNECT BY (hierarchical queries)
SELECT LEVEL, name FROM items
CONNECT BY PRIOR id = parent_id
START WITH parent_id IS NULL;
```

## Enterprise Features

### Real Application Clusters (RAC)

Oracle RAC allows multiple instances to access a single database simultaneously:
- **Active-Active clustering**: All nodes handle requests
- **Automatic failover**: If one node fails, others take over
- **Linear scalability**: Add nodes to increase capacity
- **Shared everything**: All nodes access the same storage

### Data Guard

Oracle Data Guard provides disaster recovery:
- **Physical standby**: Block-for-block copy of primary
- **Logical standby**: SQL-level replication
- **Active Data Guard**: Read-only queries on standby
- **Far Sync**: Zero data loss over long distances
- **Automatic failover**: Fast Role Transition

### Partitioning

Table and index partitioning for large datasets:

```sql
-- Range partitioning
CREATE TABLE sales (
  id NUMBER,
  sale_date DATE,
  amount NUMBER
)
PARTITION BY RANGE (sale_date) (
  PARTITION p_2023 VALUES LESS THAN (DATE '2024-01-01'),
  PARTITION p_2024 VALUES LESS THAN (DATE '2025-01-01'),
  PARTITION p_future VALUES LESS THAN (MAXVALUE)
);

-- List partitioning
CREATE TABLE customers (
  id NUMBER,
  region VARCHAR2(50),
  name VARCHAR2(100)
)
PARTITION BY LIST (region) (
  PARTITION p_east VALUES ('East', 'Northeast'),
  PARTITION p_west VALUES ('West', 'Southwest'),
  PARTITION p_other VALUES (DEFAULT)
);
```

### Advanced Security

- **Transparent Data Encryption (TDE)**: Encrypt data at rest
- **Database Vault**: Restrict privileged user access
- **Audit Vault**: Centralized audit management
- **Label Security**: Row-level security based on labels
- **Virtual Private Database (VPD)**: Row-level access control

## Memory Requirements

| Configuration | RAM | Use Case |
|--------------|-----|----------|
| Minimum (XE) | 2 GB | Learning, development |
| Small | 4-8 GB | Small applications, testing |
| Medium | 16-32 GB | Production workloads |
| Large | 64-128 GB | Enterprise applications |
| Very Large | 256+ GB | Data warehousing, OLTP |

### SGA/PGA Sizing Guidelines
- **SGA**: 40-60% of total RAM
- **PGA**: 10-20% of total RAM
- **OS Reserve**: 20-30% for operating system

## Use Cases

### Best For
- **Financial Services**: Banking, trading, insurance
- **Healthcare**: Patient records, clinical data
- **Government**: Tax systems, regulatory compliance
- **Telecommunications**: Billing, subscriber management
- **Retail**: ERP, inventory management
- **Manufacturing**: Supply chain, MES systems
- **Data Warehousing**: Large-scale analytics

### Not Ideal For
- Simple applications (overkill)
- Cost-sensitive projects (licensing)
- Microservices needing lightweight databases
- NoSQL-native workloads
- Small personal projects

## Oracle XE (Express Edition)

Oracle XE is the free edition, perfect for learning:

### Limitations
- **CPU**: Up to 2 CPU threads
- **RAM**: Up to 2 GB of user data in SGA
- **Storage**: Up to 12 GB of user data on disk
- **Single instance**: No RAC support

### Installation

```bash
# Docker (recommended for learning)
docker pull container-registry.oracle.com/database/express:latest
docker run -d -p 1521:1521 -e ORACLE_PWD=oracle \
  --name oracle-xe container-registry.oracle.com/database/express:latest

# Or use Oracle's pre-built VM from oracle.com/database/technologies
```

### Default Connection
```
Host: localhost
Port: 1521
Service: XEPDB1 (pluggable database)
SID: XE (container database)
User: system
Password: (set during installation)
```

## Oracle Tools

### 1. **SQL*Plus**
Command-line interface for Oracle Database:

```bash
# Connect
sqlplus system/oracle@localhost:1521/XEPDB1

# Common commands
DESC items;           -- Describe table
SET LINESIZE 200;     -- Set line width
SET PAGESIZE 50;      -- Set page size
COLUMN name FORMAT A30;  -- Format column
```

### 2. **SQL Developer**
Free GUI tool from Oracle:
- Visual query builder
- Database object browser
- PL/SQL debugger
- Data modeling
- Import/export

Download: https://www.oracle.com/database/sqldeveloper/

### 3. **Oracle Enterprise Manager**
Web-based management console for Oracle Database.

### 4. **Oracle APEX**
Low-code development platform built into Oracle Database.

## Performance Tips

### 1. **Use Bind Variables**
```javascript
// Good - bind variables (parsed once, executed many)
await connection.execute(
  'SELECT * FROM items WHERE category = :cat',
  { cat: 'Electronics' }
);

// Avoid - literal values (parsed every time)
await connection.execute(
  `SELECT * FROM items WHERE category = '${category}'`
);
```

### 2. **Use Connection Pooling**
```javascript
// Good - connection pool
const pool = await oracledb.createPool(dbConfig);
const conn = await pool.getConnection();
// ... use connection
await conn.close(); // Returns to pool

// Avoid - individual connections
const conn = await oracledb.getConnection(dbConfig); // Expensive!
```

### 3. **Create Appropriate Indexes**
```sql
CREATE INDEX idx_category ON items(category);
CREATE INDEX idx_name_category ON items(name, category); -- Composite
```

### 4. **Analyze Execution Plans**
```sql
EXPLAIN PLAN FOR
SELECT * FROM items WHERE category = 'Electronics';

SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
```

### 5. **Use AWR/ASH Reports**
Automatic Workload Repository and Active Session History provide deep performance insights.

## Security Considerations

### 1. **SQL Injection Prevention**
Always use bind variables (parameterized queries):
```javascript
// Safe
await connection.execute(
  'SELECT * FROM items WHERE name = :name',
  { name: userInput }
);

// UNSAFE - vulnerable to SQL injection
await connection.execute(
  `SELECT * FROM items WHERE name = '${userInput}'`
);
```

### 2. **Principle of Least Privilege**
```sql
-- Create application user with minimal permissions
CREATE USER app_user IDENTIFIED BY password;
GRANT CREATE SESSION TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON items TO app_user;
```

### 3. **Input Validation**
Validate all user input before database operations (done in routes.js using validator library).

## Resources

- **Official Oracle Documentation**: https://docs.oracle.com/en/database/
- **node-oracledb Documentation**: https://oracle.github.io/node-oracledb/
- **Oracle Live SQL**: https://livesql.oracle.com/
- **Oracle XE Download**: https://www.oracle.com/database/technologies/xe-downloads.html
- **Oracle SQL Developer**: https://www.oracle.com/database/sqldeveloper/
- **Ask Tom (Oracle Q&A)**: https://asktom.oracle.com/

## Conclusion

Oracle Database is the gold standard for enterprise database management:
- Unmatched reliability and feature set
- Industry-leading performance and scalability
- Comprehensive security and compliance features
- Oracle XE provides a free path for learning
- Rich ecosystem of tools and documentation
- 40+ years of enterprise-proven technology

For learning purposes, Oracle XE provides a fully functional database with all core features. For production enterprise workloads, Oracle Database Standard Edition or Enterprise Edition is recommended.
