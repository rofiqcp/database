# Firebase Setup Guide

This guide will walk you through setting up Firebase and Firestore for the Firebase Learning Module.

## Prerequisites

- Google account
- Node.js 16+ installed
- Basic knowledge of Firebase Console

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter your project name (e.g., "firebase-learning-module")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database

1. In Firebase Console, navigate to **Build** → **Firestore Database**
2. Click "Create database"
3. Choose **Production mode** or **Test mode**:
   - **Test mode**: Allows all reads/writes (good for development)
   - **Production mode**: Requires authentication rules
4. Select a location for your database (choose closest to your users)
5. Click "Enable"

## Step 3: Create Service Account

1. In Firebase Console, click the gear icon ⚙️ → **Project settings**
2. Navigate to **Service accounts** tab
3. Click **Generate new private key**
4. A JSON file will download - **keep this secure!**
5. Rename the file to `firebase-adminsdk.json`
6. Place it in the `backend/` directory (already gitignored)

## Step 4: Configure Environment Variables

### Option 1: Using Service Account File

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and set:
```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-adminsdk.json
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
API_KEY=your-secret-api-key-here
```

### Option 2: Using Individual Environment Variables

1. Open your `firebase-adminsdk.json` file
2. Extract the values and set in `.env`:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
API_KEY=your-secret-api-key-here
```

**Important**: Keep the quotes around `FIREBASE_PRIVATE_KEY` and make sure `\n` characters are preserved.

## Step 5: Set Up Firestore Security Rules

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. For development, use test mode rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. For production, use secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /items/{itemId} {
      // Allow read access to all
      allow read: if true;
      
      // Allow write only with valid API key (implement in Cloud Functions)
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

4. Click **Publish** to apply the rules

## Step 6: Create Firestore Indexes

For optimal query performance, create a composite index:

1. Go to **Firestore Database** → **Indexes**
2. Click **Create Index**
3. Configure:
   - **Collection ID**: `items`
   - **Fields**:
     - `category` (Ascending)
     - `createdAt` (Descending)
   - **Query scope**: Collection
4. Click **Create**

Alternatively, run a query and Firebase will suggest creating the index automatically.

## Step 7: Verify Setup

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Start the backend server:
```bash
npm run dev
```

3. Check for successful connection:
```
✓ Connected to Firebase Firestore
🚀 Firebase Backend Server running on http://localhost:3000
```

4. Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "database": "Firebase Firestore",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Step 8: Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

4. Edit `.env`:
```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000/ws
VITE_API_KEY=your-secret-api-key-here
```

Make sure `VITE_API_KEY` matches the `API_KEY` in backend `.env`.

5. Start the frontend:
```bash
npm run dev
```

6. Open http://localhost:5173 in your browser

## Troubleshooting

### Error: "Error loading service account file"
- Verify the path to `firebase-adminsdk.json` is correct
- Ensure the file has proper JSON formatting

### Error: "Permission denied"
- Check Firestore Security Rules
- Verify API key is set correctly
- Ensure service account has proper permissions

### Error: "Database URL not found"
- Verify `FIREBASE_DATABASE_URL` is set
- Use format: `https://your-project-id.firebaseio.com`

### WebSocket Connection Failed
- Ensure backend server is running
- Check CORS settings in backend
- Verify `VITE_WS_URL` is correct

## Next Steps

- Review [API_DOCS.md](./API_DOCS.md) for API endpoints
- Check [DATABASE_INFO.md](./DATABASE_INFO.md) for database structure
- Explore [FEATURES.md](./FEATURES.md) for Firebase features
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues

## Security Best Practices

1. **Never commit** `firebase-adminsdk.json` or `.env` files
2. Use environment variables in production
3. Implement proper security rules
4. Rotate API keys regularly
5. Enable Firebase App Check for additional security
6. Use Firebase Authentication for user management
7. Monitor usage in Firebase Console

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
