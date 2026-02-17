# Firebase Backend

Backend server for the Firebase Learning Module built with Node.js, Express, and Firebase Admin SDK.

## Features

- 🔥 Firebase Firestore database integration
- 🚀 RESTful API with Express.js
- 🔌 WebSocket support for real-time updates
- 🔐 API key authentication
- ✅ Input validation
- 📝 Comprehensive error handling
- 🔄 CRUD operations

## Prerequisites

- Node.js 16+ and npm
- Firebase project with Firestore enabled
- Firebase service account credentials

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials.

3. Set up Firebase service account (optional):
   - Download your service account JSON from Firebase Console
   - Save as `firebase-adminsdk.json` in the backend directory
   - Or use individual environment variables

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on http://localhost:3000

## API Endpoints

### Items

- `GET /api/data` - Get all items
- `GET /api/data/:id` - Get item by ID
- `POST /api/data` - Create new item (requires API key)
- `PUT /api/data/:id` - Update item (requires API key)
- `DELETE /api/data/:id` - Delete item (requires API key)
- `GET /api/category/:category` - Get items by category
- `POST /api/search` - Search items with filters

### WebSocket

- `ws://localhost:3000/ws` - Real-time data updates

### Health Check

- `GET /health` - Server health status

## Environment Variables

See `.env.example` for all available configuration options.

## Project Structure

```
backend/
├── src/
│   ├── server.js      # Express server with WebSocket
│   ├── database.js    # Firebase Firestore operations
│   └── routes.js      # API route handlers
├── package.json
└── .env.example
```

## Testing

Test the API using curl, Postman, or the included frontend application.

Example:
```bash
curl http://localhost:3000/api/data
```

## License

MIT
