# DynamoDB Learning Module - Troubleshooting Guide

Common issues, errors, and solutions for the DynamoDB learning module.

## Table of Contents
1. [AWS Credential Issues](#aws-credential-issues)
2. [DynamoDB Local Problems](#dynamodb-local-problems)
3. [Connection Errors](#connection-errors)
4. [Performance Issues](#performance-issues)
5. [Data Issues](#data-issues)
6. [Frontend Problems](#frontend-problems)
7. [Backend Errors](#backend-errors)
8. [AWS-Specific Errors](#aws-specific-errors)

## AWS Credential Issues

### Error: "Missing credentials in config"

**Symptoms**:
```
Error: Missing credentials in config, if using AWS_CONFIG_FILE, set AWS_SDK_LOAD_CONFIG=1
```

**Solutions**:

1. **Check .env file exists**:
```bash
cd backend
ls -la .env  # Should exist
cat .env     # Check credentials are set
```

2. **Verify environment variables**:
```bash
# For local DynamoDB (fake credentials are fine)
AWS_ACCESS_KEY_ID=fakeMyKeyId
AWS_SECRET_ACCESS_KEY=fakeSecretAccessKey
DYNAMODB_ENDPOINT=http://localhost:8000

# For AWS cloud (use real credentials)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
# Remove or comment out DYNAMODB_ENDPOINT
```

3. **Restart backend server**:
```bash
npm run dev
```

### Error: "The security token included in the request is invalid"

**Cause**: Using real AWS but credentials are wrong.

**Solutions**:
1. Verify IAM credentials in AWS Console
2. Generate new access keys if needed
3. Update `.env` with correct credentials
4. Check AWS region matches in `.env`

### Error: "Access Denied" / "UnauthorizedOperation"

**Cause**: IAM user lacks DynamoDB permissions.

**Solutions**:
1. **Attach DynamoDB policy to IAM user**:
   - Go to IAM Console → Users → Your User
   - Add permissions → Attach policies
   - Select `AmazonDynamoDBFullAccess`

2. **Or create custom policy** (see SETUP.md)

3. **Verify permissions**:
```bash
aws dynamodb list-tables --region us-east-1
```

## DynamoDB Local Problems

### Error: "Cannot connect to DynamoDB Local"

**Symptoms**:
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```

**Solutions**:

1. **Check if DynamoDB Local is running**:
```bash
curl http://localhost:8000
# Should return: "healthy: \"Running DynamoDB Local\""
```

2. **Start DynamoDB Local**:
```bash
cd ~/dynamodb-local
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000
```

3. **Check port 8000 is not in use**:
```bash
lsof -i :8000
# or
netstat -an | grep 8000
```

4. **If port is taken, use different port**:
```bash
# Start on port 8001
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8001

# Update backend/.env
DYNAMODB_ENDPOINT=http://localhost:8001
```

### Error: "Java not found"

**Symptoms**:
```
bash: java: command not found
```

**Solutions**:

1. **Install Java** (macOS):
```bash
brew install openjdk@11
```

2. **Install Java** (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install openjdk-11-jdk
```

3. **Install Java** (Windows):
- Download from https://adoptium.net/
- Install and add to PATH

4. **Verify installation**:
```bash
java -version
```

### Error: "DynamoDB Local data corrupted"

**Symptoms**:
- Unexpected errors
- Missing tables
- Inconsistent data

**Solutions**:

1. **Delete local database and restart**:
```bash
cd ~/dynamodb-local
rm -rf shared-local-instance.db
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000
```

2. **Restart backend to recreate table**:
```bash
cd backend
npm run dev
```

## Connection Errors

### Error: "CORS policy blocked"

**Symptoms**:
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solutions**:

1. **Check backend CORS_ORIGIN**:
```bash
# In backend/.env
CORS_ORIGIN=http://localhost:5173
```

2. **Verify frontend is running on correct port**:
```bash
# Frontend should show:
Local: http://localhost:5173/
```

3. **If frontend uses different port, update backend/.env**:
```env
CORS_ORIGIN=http://localhost:5174  # Match frontend port
```

4. **Restart backend server**

### Error: "Network Error" / "ERR_CONNECTION_REFUSED"

**Symptoms**:
- Frontend can't reach backend
- API calls fail

**Solutions**:

1. **Check backend is running**:
```bash
curl http://localhost:3000/health
# Should return: {"status":"OK","database":"DynamoDB",...}
```

2. **Check backend port**:
```bash
# In backend/.env
PORT=3000
```

3. **Check frontend API URL**:
```bash
# In frontend/.env
VITE_API_URL=http://localhost:3000/api
```

4. **Restart both servers**

### Error: "Timeout" / "ETIMEDOUT"

**Symptoms**:
- Requests take too long
- Eventually timeout

**Solutions**:

1. **For DynamoDB Local**: Restart DynamoDB Local

2. **For AWS**: Check internet connection and AWS region

3. **Increase timeout** (backend):
```javascript
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000  // 10 seconds
});
```

## Performance Issues

### Issue: "Slow queries"

**Solutions**:

1. **Use Query instead of Scan**:
```javascript
// ❌ Slow
const result = await db.scanItems();
const electronics = result.items.filter(i => i.category === 'Electronics');

// ✅ Fast
const result = await db.queryByCategory('Electronics');
```

2. **Add pagination**:
```javascript
// Limit results
const result = await db.scanItems(20);  // Only fetch 20 items
```

3. **Use GSI for common queries**:
```javascript
// Already implemented: category-createdAt-index
```

### Issue: "High AWS costs"

**Solutions**:

1. **Switch to On-Demand billing**:
   - AWS Console → DynamoDB → Tables → Items → Additional settings
   - Change to "On-demand" capacity mode

2. **Enable auto-scaling** (for provisioned mode)

3. **Reduce scan operations**:
   - Use Query with GSI
   - Implement caching
   - Limit result sets

4. **Archive old data to S3**

### Error: "ProvisionedThroughputExceededException"

**Symptoms**:
```
The level of configured provisioned throughput for the table was exceeded
```

**Solutions**:

1. **Implement exponential backoff** (already in SDK)

2. **Increase provisioned capacity**:
   - AWS Console → Table → Additional settings → Read/Write capacity
   - Increase values

3. **Enable auto-scaling**

4. **Switch to On-Demand billing**

5. **Optimize queries to reduce RCU/WCU usage**

## Data Issues

### Issue: "Items not showing up"

**Solutions**:

1. **Check if table was created**:
```bash
# DynamoDB Local
aws dynamodb list-tables --endpoint-url http://localhost:8000

# AWS
aws dynamodb list-tables --region us-east-1
```

2. **Check table name in .env**:
```env
DYNAMODB_TABLE_NAME=Items
```

3. **Verify items exist**:
```bash
# DynamoDB Local
aws dynamodb scan --table-name Items --endpoint-url http://localhost:8000

# AWS
aws dynamodb scan --table-name Items --region us-east-1
```

4. **Check frontend is fetching from correct endpoint**

### Issue: "Duplicate IDs"

**Cause**: UUID collision (extremely rare) or logic error.

**Solutions**:

1. **Verify UUID generation**:
```javascript
const { v4: uuidv4 } = require('uuid');
console.log(uuidv4());  // Should generate unique ID each time
```

2. **Check for accidental ID reuse in code**

3. **Use DynamoDB's conditional writes**:
```javascript
await docClient.send(new PutCommand({
  TableName: TABLE_NAME,
  Item: newItem,
  ConditionExpression: 'attribute_not_exists(id)'
}));
```

### Issue: "Data type errors"

**Symptoms**:
- "ValidationException: One or more parameter values were invalid"
- Numbers stored as strings

**Solutions**:

1. **Ensure proper type conversion**:
```javascript
// ✅ Correct
price: parseFloat(req.body.price)
stock: parseInt(req.body.stock)

// ❌ Wrong
price: req.body.price  // Might be string
```

2. **Use validator.js**:
```javascript
if (!validator.isFloat(String(price), { min: 0 })) {
  throw new Error('Price must be a positive number');
}
```

3. **Check DocumentClient configuration**:
```javascript
DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false
  }
});
```

## Frontend Problems

### Issue: "Dark mode not working"

**Solutions**:

1. **Check Tailwind dark mode configuration**:
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // Should be 'class' not 'media'
  // ...
}
```

2. **Verify dark class is toggled**:
```javascript
// In browser console
document.documentElement.classList.contains('dark')  // Should be true in dark mode
```

3. **Clear browser cache and rebuild**:
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Issue: "Items not updating in real-time"

**Solutions**:

1. **Check Pinia store is updating**:
```javascript
// After create/update/delete
store.fetchItems()  // Refresh list
```

2. **Verify API response format**:
```javascript
// Should return updated item
{ success: true, data: { id, name, ... } }
```

3. **Check Vue reactivity**:
```javascript
// Use computed for reactive data
const items = computed(() => store.items)
```

### Issue: "Pagination not working"

**Solutions**:

1. **Check hasMore flag**:
```javascript
const hasMore = computed(() => store.hasMore)
```

2. **Verify lastEvaluatedKey is passed**:
```javascript
await store.fetchItems(true)  // Pass true for loadMore
```

3. **Check backend pagination logic**:
```javascript
const lastKey = req.query.lastKey ? 
  JSON.parse(decodeURIComponent(req.query.lastKey)) : null;
```

## Backend Errors

### Error: "Table already exists"

**Symptoms**:
```
ResourceInUseException: Table already exists: Items
```

**Cause**: Normal - table creation is attempted but table exists.

**Solution**: Ignore this error, it's handled in code:
```javascript
try {
  await createTable();
} catch (error) {
  if (error instanceof ResourceNotFoundException) {
    // Create table
  } else {
    // Table exists, continue
  }
}
```

### Error: "Module not found"

**Symptoms**:
```
Error: Cannot find module '@aws-sdk/client-dynamodb'
```

**Solutions**:

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Check package.json**:
```json
{
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.478.0",
    "@aws-sdk/lib-dynamodb": "^3.478.0"
  }
}
```

3. **Delete and reinstall**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"

**Symptoms**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions**:

1. **Find and kill process**:
```bash
# macOS/Linux
lsof -ti :3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

2. **Use different port**:
```bash
# In backend/.env
PORT=3001
```

## AWS-Specific Errors

### Error: "ResourceNotFoundException: Requested resource not found"

**Cause**: Table doesn't exist in AWS.

**Solutions**:

1. **For DynamoDB Local**: Restart backend to create table

2. **For AWS**: Verify region and table name:
```bash
aws dynamodb list-tables --region us-east-1
```

3. **Create table manually**:
```bash
aws dynamodb create-table \
  --table-name Items \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=category,AttributeType=S \
    AttributeName=createdAt,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes ... \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### Error: "ValidationException: Invalid UpdateExpression"

**Cause**: Reserved words or invalid syntax in update expression.

**Solutions**:

1. **Use ExpressionAttributeNames for reserved words**:
```javascript
UpdateExpression: 'SET #name = :name',
ExpressionAttributeNames: {
  '#name': 'name'  // 'name' is a reserved word
}
```

2. **Check expression syntax**:
```javascript
// ✅ Correct
UpdateExpression: 'SET price = :price, stock = :stock'

// ❌ Wrong
UpdateExpression: 'SET price = :price stock = :stock'  // Missing comma
```

### Error: "ConditionalCheckFailedException"

**Cause**: Condition expression failed (e.g., item doesn't exist).

**Solutions**:

1. **Check if item exists before update**:
```javascript
const item = await db.getItem(id);
if (!item) {
  throw new Error('Item not found');
}
```

2. **Handle conditional write failures**:
```javascript
try {
  await conditionalUpdate();
} catch (error) {
  if (error.name === 'ConditionalCheckFailedException') {
    // Handle failed condition
  }
}
```

### Error: "ItemCollectionSizeLimitExceededException"

**Cause**: Item collection (same partition key) exceeds 10GB.

**Solution**: Use better partition key distribution (already using UUID).

## Debugging Tips

### Enable Debug Logging

1. **Backend**:
```javascript
// Add to server.js
console.log('Request:', req.method, req.path, req.body);
```

2. **AWS SDK**:
```bash
# Set environment variable
AWS_LOG_LEVEL=debug npm run dev
```

3. **Frontend**:
```javascript
// In Pinia store
console.log('API Request:', endpoint, payload);
console.log('API Response:', response);
```

### Check DynamoDB Local Admin UI

DynamoDB Local doesn't have a built-in UI, but you can use:

1. **AWS CLI**:
```bash
aws dynamodb scan --table-name Items --endpoint-url http://localhost:8000
```

2. **DynamoDB Admin** (third-party):
```bash
npm install -g dynamodb-admin
DYNAMO_ENDPOINT=http://localhost:8000 dynamodb-admin
# Open http://localhost:8001
```

### Test API Endpoints

```bash
# Test health check
curl http://localhost:3000/health

# Create item
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":10,"stock":5}'

# Get all items
curl http://localhost:3000/api/data

# Check logs
tail -f backend/logs/error.log
```

## Getting Help

### Check Documentation
1. [SETUP.md](./SETUP.md) - Installation and configuration
2. [API_DOCS.md](./API_DOCS.md) - API reference
3. [DATABASE_INFO.md](./DATABASE_INFO.md) - Database schema
4. [FEATURES.md](./FEATURES.md) - Advanced features

### AWS Resources
- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [DynamoDB Local Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)

### Common Questions

**Q: Can I use this with real AWS DynamoDB?**
A: Yes! Just remove `DYNAMODB_ENDPOINT` from .env and use real AWS credentials.

**Q: How do I reset the database?**
A: For local, delete `shared-local-instance.db` and restart. For AWS, delete and recreate the table.

**Q: Why are my queries slow?**
A: Use Query with GSI instead of Scan. See FEATURES.md for optimization tips.

**Q: How do I backup data?**
A: For AWS, use On-Demand Backups or PITR. For local, backup the .db file.

**Q: Can I change the table schema?**
A: DynamoDB is schema-less. Just start using new attributes. See DATABASE_INFO.md for migration strategies.
