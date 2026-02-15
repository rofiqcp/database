# MySQL Learning Module - Setup Guide

Complete step-by-step setup instructions for the MySQL learning module.

## Prerequisites

### Required Software
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **MySQL**: Version 8.0 or higher (or MariaDB 10.5+)
- **Text Editor**: VS Code, Sublime Text, or your preferred editor

### Check Prerequisites
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be 9.x or higher
mysql --version # Should be 8.0.x or higher
```

### Install MySQL

**macOS (Homebrew):**
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

**Windows:**
Download and install from [mysql.com](https://dev.mysql.com/downloads/mysql/)

### Create Database
```bash
mysql -u root -p

CREATE DATABASE learning_db;
CREATE USER 'learning_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON learning_db.* TO 'learning_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Installation Steps

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

#### Backend Environment Variables (.env)
```env
PORT=3000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=learning_db
CORS_ORIGIN=http://localhost:5173
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

## Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Verify Installation

- Backend: `http://localhost:3000/health`
- Frontend: `http://localhost:5173`

## Troubleshooting

### MySQL Connection Issues
- Check credentials in `.env`
- Ensure MySQL is running
- Verify database exists

### Authentication Plugin Error
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
FLUSH PRIVILEGES;
```

See `docs/TROUBLESHOOTING.md` for more help.
