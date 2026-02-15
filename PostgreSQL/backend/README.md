# PostgreSQL Backend - Learning Module

Node.js + Express backend server for PostgreSQL database operations with full CRUD API.

## Features

- ✅ RESTful API with Express.js
- ✅ PostgreSQL database with node-postgres (pg)
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
- **Database**: PostgreSQL (pg driver)
- **Validation**: Validator
- **Environment**: Dotenv
- **Dev Tool**: Nodemon

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- **PostgreSQL 12+ installed and running**

## PostgreSQL Setup

Before running the backend, ensure PostgreSQL is installed and running.

### Create Database

Connect to PostgreSQL and create the database:

\`\`\`bash
createdb -U postgres learning_db
\`\`\`

## Installation

\`\`\`bash
npm install
cp .env.example .env
\`\`\`

## Configuration

Edit \`.env\` file with your PostgreSQL credentials.

## API Endpoints

Full API documentation available in the main docs folder.
