# DynamoDB Learning Module

A comprehensive full-stack learning module demonstrating AWS DynamoDB integration with Node.js/Express backend and Vue 3 frontend.

## 🎯 Overview

This module provides a complete CRUD (Create, Read, Update, Delete) application using Amazon DynamoDB as the database. It's designed for learning DynamoDB concepts, AWS SDK v3, and modern web development practices.

### Key Features

- ✅ **AWS SDK v3** - Latest AWS SDK for JavaScript
- ✅ **DynamoDB Integration** - Full CRUD operations with DynamoDB
- ✅ **Global Secondary Index (GSI)** - Efficient category-based queries
- ✅ **Pagination Support** - Handle large datasets efficiently
- ✅ **Local Development** - DynamoDB Local for offline development
- ✅ **Vue 3 Frontend** - Modern reactive UI with Composition API
- ✅ **Pinia State Management** - Centralized state management
- ✅ **TailwindCSS** - Beautiful, responsive design
- ✅ **Dark Mode** - Toggle between light and dark themes
- ✅ **Input Validation** - Server-side and client-side validation
- ✅ **Error Handling** - Comprehensive error handling for AWS operations

## 📁 Project Structure

```
DynamoDB/
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── server.js       # Express server setup
│   │   ├── database.js     # DynamoDB client and operations
│   │   └── routes.js       # API route definitions
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/                # Vue 3 frontend
│   ├── src/
│   │   ├── components/     # Vue components
│   │   ├── stores/         # Pinia stores
│   │   ├── App.vue         # Main app component
│   │   ├── main.js         # App entry point
│   │   ├── api.js          # API client
│   │   └── style.css       # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── docs/                    # Documentation
│   ├── SETUP.md            # Setup instructions
│   ├── API_DOCS.md         # API documentation
│   ├── DATABASE_INFO.md    # Database schema and concepts
│   ├── FEATURES.md         # Advanced features guide
│   └── TROUBLESHOOTING.md  # Common issues and solutions
├── examples/                # Example data and queries
│   ├── sample_data.json    # 50+ sample items
│   └── query_examples.txt  # 55+ query examples
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Java 11+ (for DynamoDB Local)
- AWS Account (optional, for production)

### 1. Setup DynamoDB Local

```bash
# Download and extract DynamoDB Local
mkdir ~/dynamodb-local && cd ~/dynamodb-local
wget https://d1ni2b6xgvw0s0.cloudfront.net/v2.x/dynamodb_local_latest.tar.gz
tar -xzf dynamodb_local_latest.tar.gz

# Start DynamoDB Local
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start backend server
npm run dev
```

Backend will start on http://localhost:3000

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start frontend dev server
npm run dev
```

Frontend will start on http://localhost:5173

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 📚 Documentation

- **[SETUP.md](docs/SETUP.md)** - Complete installation and setup guide
- **[API_DOCS.md](docs/API_DOCS.md)** - API endpoints and examples
- **[DATABASE_INFO.md](docs/DATABASE_INFO.md)** - DynamoDB schema and concepts
- **[FEATURES.md](docs/FEATURES.md)** - Advanced features and optimizations
- **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🔑 Key Concepts

### DynamoDB Table: Items

**Primary Key**: `id` (String - UUID)

**Attributes**:
- `id` - Unique identifier (UUID v4)
- `name` - Item name
- `description` - Item description
- `category` - Item category (used in GSI)
- `price` - Item price (Number)
- `stock` - Stock quantity (Number)
- `createdAt` - Creation timestamp (ISO 8601)
- `updatedAt` - Last update timestamp (ISO 8601)

### Global Secondary Index

**Index Name**: `category-createdAt-index`
- **Partition Key**: `category`
- **Sort Key**: `createdAt`
- **Purpose**: Efficient category-based queries with date sorting

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: Amazon DynamoDB
- **AWS SDK**: @aws-sdk/client-dynamodb v3
- **Validation**: Validator.js
- **UUID**: uuid v9

### Frontend
- **Framework**: Vue 3.3 (Composition API)
- **Build Tool**: Vite 5
- **State Management**: Pinia 2.1
- **HTTP Client**: Axios 1.6
- **Styling**: TailwindCSS 3.4
- **CSS Processing**: PostCSS, Autoprefixer

## 📊 Features Overview

### CRUD Operations
- ✅ Create new items
- ✅ Read single item by ID
- ✅ Read all items with pagination
- ✅ Update existing items
- ✅ Delete items

### Advanced Features
- 🔍 Search by name/description
- 🏷️ Filter by category (using GSI)
- 💰 Filter by price range
- 📄 Pagination for large datasets
- 🌓 Dark mode support
- ✅ Input validation
- 🚨 Error handling
- 📱 Responsive design

### API Endpoints

```
GET    /health                    # Health check
GET    /api/data                  # Get all items (paginated)
GET    /api/data/:id              # Get item by ID
POST   /api/data                  # Create new item
PUT    /api/data/:id              # Update item
DELETE /api/data/:id              # Delete item
GET    /api/category/:category    # Query by category (GSI)
POST   /api/search                # Search with filters
GET    /api/categories            # Get all categories
```

## 🧪 Sample Data

Load 50+ sample items:

```bash
# See examples/sample_data.json for sample data structure
# Items include: Electronics, Books, Furniture, Home & Kitchen, Sports, etc.
```

## 🔐 Security Best Practices

- ✅ Input validation on server and client
- ✅ Environment variables for sensitive data
- ✅ CORS configuration
- ✅ IAM least-privilege policies
- ✅ No credentials in code
- ✅ .gitignore for .env files

## 📈 Performance Optimizations

- **Use Query over Scan** - GSI for category queries
- **Pagination** - Handle large datasets efficiently
- **DocumentClient** - Simplified JSON handling
- **Projection Expressions** - Fetch only needed attributes
- **Batch Operations** - Process multiple items efficiently
- **Connection Pooling** - Reuse DynamoDB connections

## 🌍 Production Deployment

### AWS DynamoDB (Production)

1. Create AWS account and IAM user
2. Set up DynamoDB table with GSI
3. Configure environment variables:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   # Remove DYNAMODB_ENDPOINT for production
   ```
4. Enable auto-scaling
5. Set up CloudWatch monitoring
6. Enable Point-in-Time Recovery

See [SETUP.md](docs/SETUP.md) for detailed production deployment guide.

## 🧑‍💻 Development

### Backend Development
```bash
cd backend
npm run dev        # Start with auto-reload (nodemon)
npm start          # Start without auto-reload
```

### Frontend Development
```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Testing Workflow

1. Start DynamoDB Local
2. Start backend server
3. Start frontend dev server
4. Test CRUD operations in browser
5. Check backend logs for errors
6. Use browser DevTools for frontend debugging

## 🎓 Learning Objectives

This module helps you learn:

1. **DynamoDB Fundamentals**
   - NoSQL database concepts
   - Primary keys and secondary indexes
   - Query vs Scan operations
   - Pagination strategies

2. **AWS SDK v3**
   - Client configuration
   - DocumentClient usage
   - Error handling
   - Batch operations

3. **Full-Stack Development**
   - RESTful API design
   - State management with Pinia
   - Reactive programming with Vue 3
   - Modern CSS with TailwindCSS

4. **Best Practices**
   - Input validation
   - Error handling
   - Security considerations
   - Performance optimization

## 🔧 Troubleshooting

Common issues and solutions:

- **DynamoDB Local won't start**: Check if Java is installed and port 8000 is available
- **Connection refused**: Ensure DynamoDB Local is running and endpoint is correct
- **CORS errors**: Verify CORS_ORIGIN in backend .env matches frontend URL
- **Items not showing**: Check if table was created and items were added

See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for comprehensive troubleshooting guide.

## 📝 Example Queries

See [examples/query_examples.txt](examples/query_examples.txt) for 55+ DynamoDB query examples including:
- AWS CLI commands
- AWS SDK (JavaScript) examples
- PartiQL queries
- Advanced query patterns

## 🤝 Contributing

This is a learning module. Feel free to:
- Add more features
- Improve documentation
- Fix bugs
- Suggest optimizations

## 📄 License

MIT License - Feel free to use this module for learning and educational purposes.

## 🔗 Resources

### Official Documentation
- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [DynamoDB Local Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)

### Learning Resources
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

## 🎯 Next Steps

After completing this module, consider:

1. **Add Authentication** - Implement user authentication with AWS Cognito
2. **Add More Tables** - Create related tables (Orders, Customers)
3. **Implement Caching** - Use DynamoDB Accelerator (DAX) or ElastiCache
4. **Add Search** - Integrate AWS CloudSearch or Elasticsearch
5. **Deploy to Cloud** - Deploy backend to AWS Lambda and frontend to S3/CloudFront
6. **Add Monitoring** - Set up CloudWatch dashboards and alarms
7. **Implement CI/CD** - Automate deployment with GitHub Actions or AWS CodePipeline

## 💡 Tips

- Start with DynamoDB Local for development to avoid AWS charges
- Use the AWS SDK Documentation extensively
- Monitor DynamoDB capacity units in production
- Always implement pagination for production applications
- Use GSI for common query patterns
- Consider using On-Demand billing for variable workloads
- Enable Point-in-Time Recovery for production tables

---

**Happy Learning! 🚀**

For questions or issues, refer to the documentation or create an issue in the repository.
