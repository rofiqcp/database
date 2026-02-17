# Troubleshooting Guide

Common issues and solutions for the Neo4j Learning Module.

## Connection Issues

### Problem: Cannot connect to Neo4j database

**Symptoms:**
```
❌ Failed to connect to Neo4j: ServiceUnavailable: Connection refused
```

**Solutions:**

1. **Verify Neo4j is running**
   ```bash
   # Check if Neo4j is running (Linux/Mac)
   ps aux | grep neo4j
   
   # Or check Neo4j Desktop - database should show "Active"
   ```

2. **Check port availability**
   ```bash
   # Check if port 7687 is open
   nc -zv localhost 7687
   
   # Or
   telnet localhost 7687
   ```

3. **Verify connection URI**
   ```env
   # In .env file
   NEO4J_URI=bolt://localhost:7687  # Not http://
   ```

4. **Check firewall settings**
   - Ensure ports 7687 (Bolt) and 7474 (HTTP) are not blocked

### Problem: Authentication failed

**Symptoms:**
```
Neo.ClientError.Security.Unauthorized: The client is unauthorized due to authentication failure.
```

**Solutions:**

1. **Verify credentials in `.env`**
   ```env
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=your_actual_password
   ```

2. **Reset password in Neo4j Desktop**
   - Stop database
   - Click database options (...)
   - Select "Reset Password"
   - Update `.env` with new password

3. **Reset password via command line**
   ```bash
   neo4j-admin set-initial-password new_password
   ```

### Problem: Connection timeout

**Symptoms:**
```
Failed to connect within timeout of 2 minutes
```

**Solutions:**

1. **Increase timeout in database.js**
   ```javascript
   const driver = neo4j.driver(uri, auth, {
     connectionAcquisitionTimeout: 5 * 60 * 1000 // 5 minutes
   });
   ```

2. **Check network connectivity**
   ```bash
   ping localhost
   ```

3. **Restart Neo4j**
   - Neo4j Desktop: Click "Stop" then "Start"
   - Command line: `neo4j restart`

## Browser Access Issues

### Problem: Cannot access Neo4j Browser

**Symptoms:**
- Browser shows "This site can't be reached"
- http://localhost:7474 doesn't load

**Solutions:**

1. **Verify HTTP port**
   ```bash
   # Check if port 7474 is listening
   netstat -an | grep 7474
   ```

2. **Check Neo4j configuration**
   In `neo4j.conf`:
   ```
   dbms.connector.http.enabled=true
   dbms.connector.http.listen_address=:7474
   ```

3. **Try different browser**
   - Some browsers have strict security settings
   - Try Chrome, Firefox, or Edge

4. **Clear browser cache**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files

### Problem: Browser keeps disconnecting

**Solutions:**

1. **Disable browser extensions**
   - Ad blockers may interfere
   - Try incognito/private mode

2. **Check WebSocket connection**
   In `neo4j.conf`:
   ```
   dbms.connector.bolt.enabled=true
   ```

## Cypher Query Errors

### Problem: Syntax error in Cypher query

**Symptoms:**
```
Neo.ClientError.Statement.SyntaxError: Invalid input
```

**Solutions:**

1. **Check Cypher syntax**
   ```cypher
   -- Correct
   MATCH (i:Item {name: $name}) RETURN i
   
   -- Wrong (no quotes around $name)
   MATCH (i:Item {name: $name}) RETURN i
   ```

2. **Use Cypher linter**
   - Neo4j Browser has built-in syntax checking
   - Type query and look for red underlines

3. **Check parameter format**
   ```javascript
   // Correct
   await session.run('MATCH (i:Item {id: $id}) RETURN i', { id: '123' });
   
   // Wrong
   await session.run('MATCH (i:Item {id: 123}) RETURN i');
   ```

### Problem: Constraint violation

**Symptoms:**
```
Neo.ClientError.Schema.ConstraintValidationFailed: Node already exists with label Item and property id
```

**Solutions:**

1. **Check for duplicate IDs**
   ```cypher
   MATCH (i:Item {id: "duplicate-id"})
   RETURN i
   ```

2. **Use MERGE instead of CREATE**
   ```cypher
   -- Creates only if doesn't exist
   MERGE (i:Item {id: $id})
   ON CREATE SET i.name = $name, i.createdAt = timestamp()
   ON MATCH SET i.updatedAt = timestamp()
   ```

3. **Delete duplicate nodes**
   ```cypher
   MATCH (i:Item {id: "duplicate-id"})
   WITH i
   SKIP 1
   DETACH DELETE i
   ```

### Problem: Query too slow

**Symptoms:**
- Queries take several seconds
- Frontend times out

**Solutions:**

1. **Profile the query**
   ```cypher
   PROFILE MATCH (i:Item) RETURN i
   ```
   Look for "db hits" - lower is better.

2. **Add indexes**
   ```cypher
   CREATE INDEX item_name IF NOT EXISTS
   FOR (i:Item) ON (i.name)
   ```

3. **Use LIMIT**
   ```cypher
   MATCH (i:Item)
   RETURN i
   LIMIT 100
   ```

4. **Optimize pattern matching**
   ```cypher
   -- Faster: Filter in MATCH
   MATCH (i:Item {name: "Laptop"})
   
   -- Slower: Filter in WHERE
   MATCH (i:Item)
   WHERE i.name = "Laptop"
   ```

## Backend Server Issues

### Problem: Server won't start

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

1. **Kill process using port 3000**
   ```bash
   # Find process
   lsof -i :3000
   
   # Kill it (replace PID)
   kill -9 PID
   
   # Or on Windows
   netstat -ano | findstr :3000
   taskkill /PID PID /F
   ```

2. **Use different port**
   ```env
   # In .env
   PORT=3001
   ```

### Problem: Module not found errors

**Symptoms:**
```
Error: Cannot find module 'neo4j-driver'
```

**Solutions:**

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Check package.json**
   Ensure `neo4j-driver` is listed in dependencies.

3. **Clear node_modules and reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Problem: CORS errors

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**

1. **Check CORS_ORIGIN in .env**
   ```env
   CORS_ORIGIN=http://localhost:5173
   ```

2. **Restart backend server**
   ```bash
   npm run dev
   ```

3. **Verify frontend URL matches**
   Frontend should run on http://localhost:5173

## Frontend Issues

### Problem: API calls failing

**Symptoms:**
- Network errors in browser console
- Items not loading

**Solutions:**

1. **Check backend is running**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Verify API URL**
   In frontend `.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Check browser console**
   - Open DevTools (F12)
   - Look for error messages
   - Check Network tab for failed requests

### Problem: Dark mode not working

**Solutions:**

1. **Clear browser cache**
   ```
   Ctrl+Shift+Delete
   ```

2. **Check Tailwind configuration**
   In `tailwind.config.js`:
   ```javascript
   darkMode: 'class',
   ```

### Problem: Build fails

**Symptoms:**
```
Failed to resolve import
```

**Solutions:**

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Clear Vite cache**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

## Performance Issues

### Problem: Slow queries

**Solutions:**

1. **Create indexes**
   ```cypher
   CREATE INDEX item_name IF NOT EXISTS
   FOR (i:Item) ON (i.name)
   ```

2. **Use EXPLAIN to analyze**
   ```cypher
   EXPLAIN MATCH (i:Item)-[:HAS_TAG]->(t:Tag)
   WHERE t.name = "tech"
   RETURN i
   ```

3. **Increase heap size**
   In `neo4j.conf`:
   ```
   dbms.memory.heap.initial_size=1g
   dbms.memory.heap.max_size=2g
   ```

4. **Warm up caches**
   ```cypher
   CALL db.warmup()
   ```

### Problem: High memory usage

**Solutions:**

1. **Limit query results**
   ```cypher
   MATCH (i:Item)
   RETURN i
   LIMIT 1000
   ```

2. **Close sessions properly**
   ```javascript
   try {
     const result = await session.run(query);
   } finally {
     await session.close(); // Always close!
   }
   ```

3. **Reduce page cache**
   In `neo4j.conf`:
   ```
   dbms.memory.pagecache.size=512m
   ```

## Data Issues

### Problem: Missing relationships

**Symptoms:**
- Items show no category or tags
- Related items query returns empty

**Solutions:**

1. **Verify relationships exist**
   ```cypher
   MATCH (i:Item)-[r]->(n)
   WHERE i.id = "item-id"
   RETURN type(r), labels(n), n
   ```

2. **Check relationship direction**
   ```cypher
   -- Both directions
   MATCH (i:Item)-[:HAS_TAG]-(t:Tag)
   
   -- Specific direction
   MATCH (i:Item)-[:HAS_TAG]->(t:Tag)
   ```

3. **Recreate relationships**
   ```cypher
   MATCH (i:Item {id: "item-id"})
   MATCH (t:Tag {name: "tech"})
   MERGE (i)-[:HAS_TAG]->(t)
   ```

### Problem: Orphaned nodes

**Symptoms:**
- Categories or tags with no items

**Solutions:**

1. **Find orphaned nodes**
   ```cypher
   MATCH (c:Category)
   WHERE NOT (c)<-[:BELONGS_TO]-()
   RETURN c
   ```

2. **Delete orphaned nodes**
   ```cypher
   MATCH (c:Category)
   WHERE NOT (c)<-[:BELONGS_TO]-()
   DELETE c
   ```

## Environment Issues

### Problem: Environment variables not loading

**Solutions:**

1. **Check .env file location**
   - Must be in backend/ directory
   - Named exactly `.env` (not `env.txt`)

2. **Verify dotenv is loaded**
   In `server.js`:
   ```javascript
   require('dotenv').config(); // At the top!
   ```

3. **Check file permissions**
   ```bash
   chmod 644 .env
   ```

4. **No spaces around =**
   ```env
   # Correct
   NEO4J_PASSWORD=mypassword
   
   # Wrong
   NEO4J_PASSWORD = mypassword
   ```

## Debugging Tips

### Enable Debug Logging

1. **Neo4j Driver**
   ```javascript
   const driver = neo4j.driver(uri, auth, {
     logging: neo4j.logging.console('debug')
   });
   ```

2. **Backend Server**
   Add console.log statements:
   ```javascript
   console.log('Query:', cypher);
   console.log('Params:', params);
   ```

3. **Neo4j Server Logs**
   Check logs in Neo4j Desktop or:
   ```bash
   tail -f $NEO4J_HOME/logs/neo4j.log
   ```

### Test Cypher Queries Directly

Always test queries in Neo4j Browser first:

1. Open http://localhost:7474
2. Run query
3. Verify results
4. Then use in application

### Use Neo4j Browser Developer Tools

1. Enable in Neo4j Browser settings
2. View query plans
3. Monitor performance
4. Export data

## Getting Help

### Resources

1. **Neo4j Community Forum**
   https://community.neo4j.com/

2. **Stack Overflow**
   Tag: `neo4j`

3. **Neo4j Documentation**
   https://neo4j.com/docs/

4. **GitHub Issues**
   https://github.com/neo4j/neo4j

### Provide Information When Asking

Include:
- Neo4j version
- Node.js version
- Error messages (full stack trace)
- Cypher queries that fail
- Configuration settings

### Reset Everything

If all else fails:

1. **Stop Neo4j**
2. **Delete database**
   - Neo4j Desktop: Remove database
   - Or delete data directory
3. **Create new database**
4. **Restart backend**
5. **Clear frontend cache**
