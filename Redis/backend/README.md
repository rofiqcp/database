# Redis Backend - Learning Module

Node.js + Express backend server for Redis database operations with full CRUD API.

## Features

- ✅ RESTful API with Express.js
- ✅ Redis database with node-redis (pg)
- ✅ Full CRUD operations
- ✅ Input validation
- ✅ Error handling
- ✅ CORS support
- ✅ Search and filter functionality
- ✅ Connection pooling for better performance
- ✅ Automatic database initialization

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: Redis (pg driver)
- **Validation**: Validator
- **Environment**: Dotenv
- **Dev Tool**: Nodemon

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- **Redis 12+ installed and running**

## Redis Setup

Before running the backend, ensure Redis is installed and running.

### Create Database

Connect to Redis and create the database:

\`\`\`bash
createdb -U redis learning_db
\`\`\`

## Installation

\`\`\`bash
npm install
cp .env.example .env
\`\`\`

## Configuration

Edit \`.env\` file with your Redis credentials.

## API Endpoints

Full API documentation available in the main docs folder.
