# MySQL Backend - Learning Module

Node.js + Express backend server for MySQL database operations with full CRUD API.

## Features

- ✅ RESTful API with Express.js
- ✅ MySQL database with mysql2 driver
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
- **Database**: MySQL (mysql2 driver)
- **Validation**: Validator
- **Environment**: Dotenv
- **Dev Tool**: Nodemon

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- **MySQL 5.7+ or 8.0+ installed and running**

## MySQL Setup

Before running the backend, ensure MySQL is installed and running.

### Create Database

Connect to MySQL and create the database:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS learning_db"
```

## Installation

```bash
npm install
cp .env.example .env
```

## Configuration

Edit `.env` file with your MySQL credentials.

## API Endpoints

Full API documentation available in the main docs folder.
