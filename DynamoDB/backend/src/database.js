const { 
  DynamoDBClient, 
  CreateTableCommand, 
  DescribeTableCommand,
  ResourceNotFoundException 
} = require('@aws-sdk/client-dynamodb');
const { 
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand
} = require('@aws-sdk/lib-dynamodb');

// Configure DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  credentials: process.env.DYNAMODB_ENDPOINT ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'fakeMyKeyId',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'fakeSecretAccessKey'
  } : undefined
});

// Create DocumentClient for easier JSON handling
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false
  },
  unmarshallOptions: {
    wrapNumbers: false
  }
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'Items';
const GSI_NAME = 'category-createdAt-index';

// Initialize table and GSI if not exists
async function initializeDatabase() {
  try {
    // Check if table exists
    const describeCommand = new DescribeTableCommand({ TableName: TABLE_NAME });
    await client.send(describeCommand);
    console.log(`✓ DynamoDB table '${TABLE_NAME}' already exists`);
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      console.log(`Creating DynamoDB table '${TABLE_NAME}'...`);
      
      const createTableCommand = new CreateTableCommand({
        TableName: TABLE_NAME,
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' } // Partition key
        ],
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' },
          { AttributeName: 'category', AttributeType: 'S' },
          { AttributeName: 'createdAt', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: GSI_NAME,
            KeySchema: [
              { AttributeName: 'category', KeyType: 'HASH' },
              { AttributeName: 'createdAt', KeyType: 'RANGE' }
            ],
            Projection: {
              ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5
            }
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      });
      
      await client.send(createTableCommand);
      
      // Wait for table to be active
      await waitForTableActive();
      console.log(`✓ DynamoDB table '${TABLE_NAME}' created successfully with GSI '${GSI_NAME}'`);
    } else {
      console.error('Error checking/creating table:', error);
      throw error;
    }
  }
}

// Wait for table to become active
async function waitForTableActive() {
  const maxAttempts = 30;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const describeCommand = new DescribeTableCommand({ TableName: TABLE_NAME });
      const response = await client.send(describeCommand);
      
      if (response.Table.TableStatus === 'ACTIVE') {
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    } catch (error) {
      console.error('Error waiting for table:', error);
      throw error;
    }
  }
  
  throw new Error('Table creation timeout');
}

// CRUD operations
const db = {
  // Create item
  async createItem(item) {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    });
    
    await docClient.send(command);
    return item;
  },
  
  // Get item by ID
  async getItem(id) {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    });
    
    const response = await docClient.send(command);
    return response.Item;
  },
  
  // Update item
  async updateItem(id, updates) {
    const updateExpressionParts = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    
    Object.keys(updates).forEach((key, index) => {
      if (key !== 'id') {
        updateExpressionParts.push(`#attr${index} = :val${index}`);
        expressionAttributeNames[`#attr${index}`] = key;
        expressionAttributeValues[`:val${index}`] = updates[key];
      }
    });
    
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });
    
    const response = await docClient.send(command);
    return response.Attributes;
  },
  
  // Delete item
  async deleteItem(id) {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id }
    });
    
    await docClient.send(command);
    return { id };
  },
  
  // Scan all items with pagination
  async scanItems(limit = 50, lastEvaluatedKey = null) {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey || undefined
    });
    
    const response = await docClient.send(command);
    return {
      items: response.Items || [],
      lastEvaluatedKey: response.LastEvaluatedKey
    };
  },
  
  // Query by category using GSI
  async queryByCategory(category, limit = 50, lastEvaluatedKey = null) {
    const command = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_NAME,
      KeyConditionExpression: 'category = :category',
      ExpressionAttributeValues: {
        ':category': category
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey || undefined,
      ScanIndexForward: false // Sort by createdAt descending
    });
    
    const response = await docClient.send(command);
    return {
      items: response.Items || [],
      lastEvaluatedKey: response.LastEvaluatedKey
    };
  },
  
  // Search items with filters (uses scan)
  async searchItems(filters, limit = 50, lastEvaluatedKey = null) {
    let filterExpression = '';
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    const filterParts = [];
    
    if (filters.query) {
      filterParts.push('(contains(#name, :query) OR contains(#description, :query))');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeNames['#description'] = 'description';
      expressionAttributeValues[':query'] = filters.query;
    }
    
    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      filterParts.push('#price >= :minPrice');
      expressionAttributeNames['#price'] = 'price';
      expressionAttributeValues[':minPrice'] = parseFloat(filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      filterParts.push('#price <= :maxPrice');
      expressionAttributeNames['#price'] = 'price';
      expressionAttributeValues[':maxPrice'] = parseFloat(filters.maxPrice);
    }
    
    if (filterParts.length > 0) {
      filterExpression = filterParts.join(' AND ');
    }
    
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: filterExpression || undefined,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey || undefined
    });
    
    const response = await docClient.send(command);
    return {
      items: response.Items || [],
      lastEvaluatedKey: response.LastEvaluatedKey
    };
  }
};

module.exports = { db, initializeDatabase, TABLE_NAME, GSI_NAME };
