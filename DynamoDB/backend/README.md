# DynamoDB Backend - Node.js + Express + AWS SDK v3

Backend server for the DynamoDB Learning Module.

## Features

- Express.js REST API
- AWS SDK v3 for DynamoDB
- DocumentClient for simplified JSON handling
- Input validation with validator.js
- CRUD operations
- Global Secondary Index (GSI) queries
- Pagination support
- Error handling
- CORS enabled

## Prerequisites

- Node.js 18+
- npm 9+
- DynamoDB Local (for development) or AWS Account (for production)

## Installation

```bash
npm install
```

## Configuration

Create `.env` file from example:

```bash
cp .env.example .env
```

### Environment Variables

```env
# Server
PORT=3000
CORS_ORIGIN=http://localhost:5173

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=fakeMyKeyId
AWS_SECRET_ACCESS_KEY=fakeSecretAccessKey

# DynamoDB
DYNAMODB_ENDPOINT=http://localhost:8000  # For local, remove for AWS
DYNAMODB_TABLE_NAME=Items
```

## Running

### Development (with auto-reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/data` | Get all items (paginated) |
| GET | `/api/data/:id` | Get item by ID |
| POST | `/api/data` | Create new item |
| PUT | `/api/data/:id` | Update item |
| DELETE | `/api/data/:id` | Delete item |
| GET | `/api/category/:category` | Query by category (GSI) |
| POST | `/api/search` | Search with filters |
| GET | `/api/categories` | Get all categories |

## Project Structure

```
backend/
├── src/
│   ├── server.js       # Express server setup
│   ├── database.js     # DynamoDB operations
│   └── routes.js       # API routes
├── package.json
├── .env.example
└── README.md
```

## Dependencies

- **express**: Web framework
- **cors**: CORS middleware
- **dotenv**: Environment variable management
- **@aws-sdk/client-dynamodb**: DynamoDB client
- **@aws-sdk/lib-dynamodb**: DocumentClient for JSON
- **validator**: Input validation
- **uuid**: UUID generation

## Development Dependencies

- **nodemon**: Auto-reload during development

## Testing

```bash
# Test health endpoint
curl http://localhost:3000/health

# Create item
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","price":99.99,"stock":10}'

# Get all items
curl http://localhost:3000/api/data
```

## Database Schema

See [DATABASE_INFO.md](../docs/DATABASE_INFO.md) for complete schema documentation.

## License

MIT
