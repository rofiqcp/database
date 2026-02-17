# Elasticsearch Backend - Learning Module

Node.js + Express backend server for Elasticsearch database operations with full CRUD API.

## Features

- ✅ RESTful API with Express.js
- ✅ Elasticsearch integration with @elastic/elasticsearch client
- ✅ Full CRUD operations
- ✅ Input validation
- ✅ Error handling
- ✅ CORS support
- ✅ Full-text search with fuzzy matching
- ✅ Automatic index initialization
- ✅ Search and filter functionality

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: Elasticsearch (@elastic/elasticsearch driver)
- **Validation**: Validator
- **Environment**: Dotenv
- **Dev Tool**: Nodemon

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- **Elasticsearch 7+ installed and running**

## Elasticsearch Setup

Before running the backend, ensure Elasticsearch is installed and running.

### Start Elasticsearch

```bash
# Start Elasticsearch
# Check cluster health
curl http://localhost:9200/_cluster/health
```

## Installation

```bash
npm install
cp .env.example .env
```

## Configuration

Edit `.env` file with your Elasticsearch settings.

## API Endpoints

Full API documentation available in the main docs folder.
