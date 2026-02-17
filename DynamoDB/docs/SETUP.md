# DynamoDB Learning Module - Setup Guide

Complete step-by-step setup instructions for the DynamoDB learning module with AWS SDK v3.

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **AWS Account**: For production use (optional for local development)
- **AWS CLI**: For AWS operations (optional)
- **DynamoDB Local**: For local development (recommended)
- **Text Editor**: VS Code, Sublime Text, or your preferred editor

### Check Prerequisites
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
```

## AWS Account Setup (Production)

### 1. Create AWS Account
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the registration process
4. Verify your email and payment method

### 2. Create IAM User for DynamoDB Access

1. **Sign in to AWS Console**: https://console.aws.amazon.com/
2. **Navigate to IAM**: Search for "IAM" in the AWS Console
3. **Create User**:
   - Click "Users" → "Add users"
   - Username: `dynamodb-app-user`
   - Access type: "Programmatic access" ✓
   - Click "Next: Permissions"
4. **Attach Policies**:
   - Option A: Click "Attach existing policies directly"
   - Search and select: `AmazonDynamoDBFullAccess`
   - Or Option B: Create custom policy with minimal permissions (see below)
   - Click "Next: Tags" → "Next: Review" → "Create user"
5. **Save Credentials**: 
   - **IMPORTANT**: Download CSV or copy Access Key ID and Secret Access Key
   - You won't be able to see the secret key again!

### 3. Custom IAM Policy (Minimal Permissions)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:CreateTable",
        "dynamodb:DescribeTable",
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/Items"
    }
  ]
}
```

## Local DynamoDB Setup (Development)

### Option 1: Download DynamoDB Local (Recommended)

1. **Download DynamoDB Local**:
```bash
# Create directory for DynamoDB Local
mkdir -p ~/dynamodb-local
cd ~/dynamodb-local

# Download DynamoDB Local
wget https://d1ni2b6xgvw0s0.cloudfront.net/v2.x/dynamodb_local_latest.tar.gz

# Extract
tar -xzf dynamodb_local_latest.tar.gz
```

2. **Run DynamoDB Local**:
```bash
# Start DynamoDB Local on port 8000
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000
```

Expected output:
```
Initializing DynamoDB Local with the following configuration:
Port:	8000
InMemory:	false
DbPath:	null
SharedDb:	true
```

### Option 2: Using Docker
```bash
# Pull DynamoDB Local image
docker pull amazon/dynamodb-local

# Run DynamoDB Local
docker run -p 8000:8000 amazon/dynamodb-local
```

### Option 3: Using Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  dynamodb-local:
    image: amazon/dynamodb-local
    container_name: dynamodb-local
    ports:
      - "8000:8000"
    command: "-jar DynamoDBLocal.jar -sharedDb -dbPath ./data"
    volumes:
      - ./dynamodb-data:/home/dynamodblocal/data
```

Run:
```bash
docker-compose up -d
```

### Verify DynamoDB Local is Running
```bash
# List tables (should be empty initially)
aws dynamodb list-tables --endpoint-url http://localhost:8000 --region us-east-1
```

Or test with curl:
```bash
curl http://localhost:8000
```

## Application Installation

### 1. Navigate to Module Directory
```bash
cd DynamoDB
```

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Backend Environment Variables (.env)

**For Local Development** (DynamoDB Local):
```env
PORT=3000
CORS_ORIGIN=http://localhost:5173

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=fakeMyKeyId
AWS_SECRET_ACCESS_KEY=fakeSecretAccessKey

# DynamoDB Local
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_TABLE_NAME=Items
```

**For Production** (AWS Cloud):
```env
PORT=3000
CORS_ORIGIN=http://localhost:5173

# AWS Configuration - Use your IAM credentials
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_actual_access_key_id
AWS_SECRET_ACCESS_KEY=your_actual_secret_access_key

# Remove or comment out DYNAMODB_ENDPOINT for production
# DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_TABLE_NAME=Items
```

### 3. Frontend Setup

```bash
# Navigate to frontend folder (from backend folder)
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Frontend Environment Variables (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## Running the Application

### Step 1: Start DynamoDB Local (if using local setup)
```bash
# In a separate terminal
cd ~/dynamodb-local
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000
```

### Step 2: Start Backend

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 DynamoDB Backend Server running on http://localhost:3000
📊 Database: DynamoDB
🔗 CORS enabled for: http://localhost:5173
🌐 DynamoDB Endpoint: http://localhost:8000
✓ DynamoDB table 'Items' created successfully with GSI 'category-createdAt-index'
```

### Step 3: Start Frontend

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Accessing the Application

1. **Open Browser**: Navigate to http://localhost:5173
2. **Test Features**:
   - Create a new item
   - View all items
   - Edit an item
   - Delete an item
   - Search and filter items
   - Test category filtering with GSI

## AWS CLI Configuration (Optional)

### Install AWS CLI
```bash
# macOS
brew install awscli

# Linux
pip install awscli

# Windows
# Download from https://aws.amazon.com/cli/
```

### Configure AWS CLI
```bash
aws configure

# Enter when prompted:
AWS Access Key ID: <your-access-key-id>
AWS Secret Access Key: <your-secret-access-key>
Default region name: us-east-1
Default output format: json
```

### Test AWS CLI with DynamoDB Local
```bash
# List tables
aws dynamodb list-tables --endpoint-url http://localhost:8000

# Describe table
aws dynamodb describe-table --table-name Items --endpoint-url http://localhost:8000

# Scan items
aws dynamodb scan --table-name Items --endpoint-url http://localhost:8000
```

## Troubleshooting Setup

### Port Already in Use
```bash
# If port 3000 is taken (backend)
# Edit backend/.env and change PORT=3001

# If port 5173 is taken (frontend)
# Edit frontend/vite.config.js and change server.port

# If port 8000 is taken (DynamoDB Local)
# Start DynamoDB Local on different port:
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8001
# Then update DYNAMODB_ENDPOINT in backend/.env
```

### Java Not Found (DynamoDB Local)
```bash
# Install Java
# macOS
brew install openjdk@11

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install openjdk-11-jdk

# Check Java version
java -version
```

### AWS Credentials Error
```bash
# Make sure credentials are set correctly in .env
# For local development, any fake credentials work with DynamoDB Local
# For production, use real IAM credentials
```

### Module Not Found Errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Review [API_DOCS.md](./API_DOCS.md) for API endpoints
- Check [DATABASE_INFO.md](./DATABASE_INFO.md) for DynamoDB schema
- Explore [FEATURES.md](./FEATURES.md) for advanced features
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues

## Security Best Practices

1. **Never commit .env files** to version control
2. **Use IAM roles** instead of access keys when possible (EC2, Lambda, etc.)
3. **Rotate credentials** regularly
4. **Use least privilege** IAM policies
5. **Enable MFA** for AWS root account
6. **Use AWS Secrets Manager** or Parameter Store for production secrets
7. **Enable DynamoDB encryption** at rest in production
8. **Use VPC endpoints** for private DynamoDB access

## Production Deployment Checklist

- [ ] Create production AWS account
- [ ] Set up IAM user with minimal permissions
- [ ] Configure AWS credentials securely
- [ ] Enable DynamoDB auto-scaling
- [ ] Set up CloudWatch monitoring
- [ ] Enable DynamoDB Point-in-Time Recovery
- [ ] Configure backup strategy
- [ ] Set up AWS WAF for API protection
- [ ] Use HTTPS/SSL certificates
- [ ] Implement rate limiting
- [ ] Set up logging and monitoring
- [ ] Configure environment-specific settings
