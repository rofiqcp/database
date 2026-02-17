# DynamoDB Learning Module - Features

Advanced features, optimizations, and best practices for DynamoDB.

## Core Features

### 1. Global Secondary Index (GSI)

#### Overview
The module implements a GSI for efficient category-based queries.

**Index Name**: `category-createdAt-index`
**Partition Key**: `category`
**Sort Key**: `createdAt`

#### Benefits
- **Fast Queries**: O(1) category lookups instead of full table scans
- **Sorted Results**: Items automatically sorted by creation time
- **Reduced Costs**: Lower RCU consumption compared to Scan
- **Better Performance**: ~10-20ms query latency vs variable scan times

#### Usage Example
```javascript
// Query Electronics sorted by newest first
const result = await db.queryByCategory('Electronics');

// Get specific number of items
const result = await db.queryByCategory('Books', 20);

// Pagination
const result = await db.queryByCategory('Furniture', 10, lastEvaluatedKey);
```

#### Cost Comparison
```
Scan (100 items, 4KB each):
- RCU consumed: ~100 RCUs
- Latency: 100-500ms

Query with GSI (10 matching items):
- RCU consumed: ~10 RCUs
- Latency: 10-20ms

Savings: 90% reduction in RCUs and 80-95% latency improvement
```

### 2. Pagination Support

#### Implementation
Uses DynamoDB's native pagination with `LastEvaluatedKey`.

#### Features
- Efficient cursor-based pagination
- No offset/limit calculations needed
- Consistent performance regardless of page number
- Supports all query operations (Scan, Query)

#### Example Flow
```javascript
// Page 1
const page1 = await db.scanItems(10);
// Returns: { items: [...], lastEvaluatedKey: 'key1' }

// Page 2
const page2 = await db.scanItems(10, page1.lastEvaluatedKey);
// Returns: { items: [...], lastEvaluatedKey: 'key2' }

// Page 3
const page3 = await db.scanItems(10, page2.lastEvaluatedKey);
// Returns: { items: [...], lastEvaluatedKey: null } // No more pages
```

#### Frontend Integration
```javascript
// In Vue component
const loadMore = async () => {
  await store.fetchItems(true); // Pass true for load more
  // Store handles lastEvaluatedKey automatically
}
```

### 3. DocumentClient Integration

#### Benefits of AWS SDK v3 DocumentClient
- **Native JavaScript Types**: No manual marshalling/unmarshalling
- **Simpler Code**: Works with standard JSON objects
- **Type Safety**: Automatic type conversion
- **Error Handling**: Better error messages

#### Without DocumentClient
```javascript
const params = {
  TableName: 'Items',
  Item: {
    id: { S: '123' },
    name: { S: 'Laptop' },
    price: { N: '1299.99' },
    stock: { N: '5' }
  }
};
```

#### With DocumentClient
```javascript
const params = {
  TableName: 'Items',
  Item: {
    id: '123',
    name: 'Laptop',
    price: 1299.99,
    stock: 5
  }
};
```

### 4. Auto-Scaling (Production Feature)

#### Table Auto-Scaling
Automatically adjusts read/write capacity based on traffic.

**Configuration**:
```javascript
{
  MinCapacity: 5,
  MaxCapacity: 100,
  TargetUtilization: 70%
}
```

**Benefits**:
- Handles traffic spikes automatically
- Reduces costs during low traffic
- No manual intervention needed
- Prevents throttling

#### How to Enable (AWS Console)
1. Go to DynamoDB Console
2. Select table → Additional settings
3. Enable "Auto scaling" for reads/writes
4. Set min/max capacity and target utilization
5. Enable for GSI as well

#### CloudFormation Example
```yaml
Resources:
  ItemsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: Items
      BillingMode: PROVISIONED
      ProvisionedThroughput:
        ReadCapacityUnits: 5
        WriteCapacityUnits: 5
      
  ReadScalingPolicy:
    Type: AWS::ApplicationAutoScaling::ScalingPolicy
    Properties:
      PolicyName: ReadAutoScalingPolicy
      PolicyType: TargetTrackingScaling
      ScalingTargetId: !Ref ReadCapacityScalableTarget
      TargetTrackingScalingPolicyConfiguration:
        TargetValue: 70.0
        PredefinedMetricSpecification:
          PredefinedMetricType: DynamoDBReadCapacityUtilization
```

### 5. Search and Filter

#### Multi-Criteria Search
Supports filtering by multiple attributes simultaneously.

**Available Filters**:
- Text search (name, description)
- Category filter
- Price range (min/max)
- Pagination

#### Optimizations
```javascript
// If only category filter → Use GSI Query (fast)
if (category && !query && !minPrice && !maxPrice) {
  return db.queryByCategory(category);
}

// Multiple filters → Use Scan with FilterExpression
return db.searchItems(filters);
```

#### Performance Tips
- Use GSI queries when possible
- Limit scan results with Limit parameter
- Consider caching frequent searches
- Use ElastiCache for complex filters

### 6. Consistent Response Format

All API responses follow a standard structure:

```javascript
{
  success: boolean,
  data: object | array | null,
  error: string | null,
  message: string,
  timestamp: ISO 8601 string
}
```

**Benefits**:
- Predictable error handling
- Easy frontend integration
- Better debugging
- Consistent logging

### 7. Input Validation

#### Server-Side Validation
```javascript
// Required fields
- name: non-empty string

// Type validation
- price: number >= 0
- stock: integer >= 0

// String sanitization
- Trim whitespace
- Validate lengths
```

#### Validator.js Integration
```javascript
const validator = require('validator');

// Check if string is empty
validator.isEmpty(name.trim())

// Validate numeric values
validator.isFloat(String(price), { min: 0 })
validator.isInt(String(stock), { min: 0 })
```

### 8. UUID Generation

Uses UUID v4 for unique, distributed IDs.

**Benefits**:
- No auto-increment conflicts
- Globally unique
- No database coordination needed
- Good partition distribution

**Implementation**:
```javascript
const { v4: uuidv4 } = require('uuid');

const newItem = {
  id: uuidv4(), // Generates: "550e8400-e29b-41d4-a716-446655440000"
  // ... other fields
};
```

### 9. Timestamp Management

Automatic timestamp tracking for audit trail.

**Fields**:
- `createdAt`: Set once on creation
- `updatedAt`: Updated on every modification

**Format**: ISO 8601
```javascript
"2024-01-01T12:00:00.000Z"
```

**Benefits**:
- Track when items were created
- Monitor update frequency
- Sort by date (using GSI)
- Audit and compliance

### 10. Error Handling

#### AWS-Specific Errors
```javascript
try {
  await db.getItem(id);
} catch (error) {
  if (error.name === 'ResourceNotFoundException') {
    // Table doesn't exist
  } else if (error.name === 'ProvisionedThroughputExceededException') {
    // Too many requests, implement backoff
  } else if (error.name === 'ValidationException') {
    // Invalid input
  }
}
```

#### Exponential Backoff (Best Practice)
```javascript
async function retryWithBackoff(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (error.name === 'ProvisionedThroughputExceededException') {
        const delay = Math.pow(2, i) * 100; // 100ms, 200ms, 400ms
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Performance Optimizations

### 1. Use Query Over Scan
```javascript
// ❌ Slow - Scans entire table
const items = await db.scanItems();
const electronics = items.filter(item => item.category === 'Electronics');

// ✅ Fast - Uses GSI to query specific category
const electronics = await db.queryByCategory('Electronics');
```

### 2. Limit Result Sets
```javascript
// Fetch only what you need
const result = await db.scanItems(20); // Limit to 20 items
```

### 3. Parallel Scans (Advanced)
For large tables, split scan into parallel segments:

```javascript
async function parallelScan(segments = 4) {
  const promises = [];
  for (let segment = 0; segment < segments; segment++) {
    promises.push(
      docClient.send(new ScanCommand({
        TableName: TABLE_NAME,
        Segment: segment,
        TotalSegments: segments
      }))
    );
  }
  const results = await Promise.all(promises);
  return results.flatMap(r => r.Items);
}
```

### 4. Batch Operations
```javascript
// ❌ Slow - Multiple individual requests
for (const id of ids) {
  await db.getItem(id);
}

// ✅ Fast - Single batch request
const result = await docClient.send(new BatchGetCommand({
  RequestItems: {
    [TABLE_NAME]: {
      Keys: ids.map(id => ({ id }))
    }
  }
}));
```

### 5. Projection Expressions
Only retrieve attributes you need:

```javascript
const result = await docClient.send(new GetCommand({
  TableName: TABLE_NAME,
  Key: { id },
  ProjectionExpression: 'id, #name, price',
  ExpressionAttributeNames: {
    '#name': 'name'
  }
}));
```

## Advanced Features

### 1. Conditional Writes
Prevent race conditions with condition expressions:

```javascript
// Only update if stock > 0
await docClient.send(new UpdateCommand({
  TableName: TABLE_NAME,
  Key: { id },
  UpdateExpression: 'SET stock = stock - :decrement',
  ConditionExpression: 'stock > :zero',
  ExpressionAttributeValues: {
    ':decrement': 1,
    ':zero': 0
  }
}));
```

### 2. Atomic Counters
Increment/decrement values atomically:

```javascript
// Increment stock by 10
await docClient.send(new UpdateCommand({
  TableName: TABLE_NAME,
  Key: { id },
  UpdateExpression: 'SET stock = stock + :val',
  ExpressionAttributeValues: {
    ':val': 10
  }
}));
```

### 3. Time-to-Live (TTL)
Auto-delete old items:

```javascript
// Add TTL attribute (Unix timestamp)
const item = {
  id: '123',
  name: 'Temporary Item',
  ttl: Math.floor(Date.now() / 1000) + 86400 // Expires in 24 hours
};

// Enable TTL on table (AWS Console or CLI)
aws dynamodb update-time-to-live \
  --table-name Items \
  --time-to-live-specification "Enabled=true, AttributeName=ttl"
```

### 4. DynamoDB Streams
Capture table changes in real-time:

**Use Cases**:
- Replicate data to other systems
- Trigger Lambda functions
- Maintain materialized views
- Audit logging

**Enable Streams**:
```javascript
// AWS Console: Table → Exports and streams → DynamoDB stream details → Enable

// Or CloudFormation
StreamSpecification:
  StreamViewType: NEW_AND_OLD_IMAGES
```

### 5. Point-in-Time Recovery (PITR)
Continuous backups:

```bash
# Enable PITR
aws dynamodb update-continuous-backups \
  --table-name Items \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

# Restore to specific time
aws dynamodb restore-table-to-point-in-time \
  --source-table-name Items \
  --target-table-name Items-Restored \
  --restore-date-time 2024-01-01T12:00:00Z
```

## Security Best Practices

### 1. IAM Policies
Use least-privilege access:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:DeleteItem",
      "dynamodb:Query",
      "dynamodb:Scan"
    ],
    "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/Items"
  }]
}
```

### 2. VPC Endpoints
Access DynamoDB privately within VPC:

```bash
# Create VPC endpoint
aws ec2 create-vpc-endpoint \
  --vpc-id vpc-12345678 \
  --service-name com.amazonaws.us-east-1.dynamodb \
  --route-table-ids rtb-12345678
```

### 3. Encryption at Rest
Always enabled by default with AWS managed keys.

**Options**:
- AWS Managed Keys (default, free)
- Customer Managed Keys (KMS, additional cost)

### 4. Encryption in Transit
All communication encrypted with TLS/SSL.

### 5. Fine-Grained Access Control
Use IAM conditions for row-level security:

```json
{
  "Condition": {
    "ForAllValues:StringEquals": {
      "dynamodb:LeadingKeys": ["${aws:username}"]
    }
  }
}
```

## Cost Optimization

### 1. Use On-Demand Billing
For unpredictable workloads:
- No capacity planning
- Pay per request
- No wasted capacity

### 2. Use Provisioned for Steady Workloads
For predictable traffic:
- Lower cost per request
- Reserved capacity discounts available

### 3. Enable Auto-Scaling
Automatically adjust capacity:
- Scale up during peaks
- Scale down during lulls
- 70% target utilization recommended

### 4. Use GSI Wisely
Each GSI consumes additional storage and capacity:
- Only create needed indexes
- Use sparse indexes when possible
- Consider projection type carefully

### 5. Archive Cold Data
Move old data to S3:
- Export to S3
- Use S3 Glacier for long-term storage
- Significant cost savings

## Monitoring and Observability

### 1. CloudWatch Metrics
Monitor key metrics:
- ConsumedReadCapacityUnits
- ConsumedWriteCapacityUnits
- ThrottledRequests
- UserErrors
- SystemErrors

### 2. CloudWatch Alarms
Set up alerts:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name high-read-capacity \
  --metric-name ConsumedReadCapacityUnits \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### 3. X-Ray Integration
Trace requests:
```javascript
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
```

### 4. Application Logging
Log important operations:
```javascript
console.log(`Created item: ${item.id} at ${new Date().toISOString()}`);
```

## Testing Strategies

### 1. Local DynamoDB
Use for development and testing:
- Fast iteration
- No AWS costs
- Offline development

### 2. Separate Test Tables
Use different table names:
- `Items-dev`
- `Items-test`
- `Items-prod`

### 3. Mock DynamoDB
Use aws-sdk-mock for unit tests:
```javascript
const AWS = require('aws-sdk-mock');

AWS.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
  callback(null, { Item: { id: '123', name: 'Test' } });
});
```

## Migration from SQL

### Common Patterns

| SQL | DynamoDB |
|-----|----------|
| `SELECT * FROM items` | `Scan` |
| `SELECT * FROM items WHERE id = ?` | `GetItem` |
| `SELECT * FROM items WHERE category = ?` | `Query` (with GSI) |
| `INSERT INTO items VALUES (...)` | `PutItem` |
| `UPDATE items SET ... WHERE id = ?` | `UpdateItem` |
| `DELETE FROM items WHERE id = ?` | `DeleteItem` |
| `COUNT(*)` | `Scan` with Select: 'COUNT' |

### Key Differences
- No JOINs → Denormalize data
- No complex WHERE → Use GSI or filter client-side
- No ORDER BY → Use sort keys in GSI
- No GROUP BY → Aggregate client-side
