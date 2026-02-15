# MariaDB Backend - Learning Module

Node.js + Express backend server for MariaDB database operations with full CRUD API.

## Features

- ✅ RESTful API with Express.js
- ✅ MariaDB database with mariadb driver
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
- **Database**: MariaDB (mariadb driver)
- **Validation**: Validator
- **Environment**: Dotenv
- **Dev Tool**: Nodemon

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- **MariaDB 10.5+ installed and running**

## MariaDB Setup

Before running the backend, ensure MariaDB is installed and running.

### Create Database

Connect to MariaDB and create the database:

```bash
mysql -u root -p -e "CREATE DATABASE learning_db;"
```

## Installation

```bash
npm install
cp .env.example .env
```

## Configuration

Edit `.env` file with your MariaDB credentials.

## API Endpoints

Full API documentation available in the main docs folder.
