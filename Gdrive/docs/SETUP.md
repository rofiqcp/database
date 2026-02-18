# Setup Guide

## Prerequisites

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Java JDK | 17+ | OpenJDK or Oracle JDK |
| Apache Maven | 3.8+ | `mvn --version` to verify |
| Node.js | 18+ | For the Vue frontend |
| npm | 9+ | Bundled with Node.js |
| Google Cloud account | — | Free tier is sufficient |

---

## Step 1 — Google Cloud Console Setup

See [GOOGLE_DRIVE_SETUP.md](GOOGLE_DRIVE_SETUP.md) for the full step-by-step guide.

**Quick summary:**
1. Create a Google Cloud project at https://console.cloud.google.com/
2. Enable the **Drive API**, **Sheets API**, and **Docs API**
3. Create an **OAuth 2.0 Client ID** (Desktop app type)
4. Download `credentials.json` and place it at `backend/credentials/credentials.json`

---

## Step 2 — Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Ensure credentials.json is in place
ls credentials/credentials.json

# Build and run
mvn spring-boot:run
```

The server starts on **http://localhost:8080**.

On the very first run (or after clearing tokens) the backend will be in an
unauthenticated state. Proceed to the frontend and click **Sign in with Google**
to complete the one-time OAuth2 flow.

### Configuration

All settings live in `src/main/resources/application.properties`:

| Property | Default | Description |
|----------|---------|-------------|
| `server.port` | `8080` | HTTP port |
| `google.credentials.file-path` | `credentials/credentials.json` | Path to OAuth client secret |
| `google.tokens.file-path` | `credentials/tokens.json` | Where tokens are persisted |
| `google.redirect-uri` | `http://localhost:8080/api/auth/callback` | Must match Google Cloud Console |
| `app.frontend.url` | `http://localhost:5173` | Post-OAuth redirect target |

---

## Step 3 — Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app is available at **http://localhost:5173**.

---

## Step 4 — First Authentication

1. Open http://localhost:5173 in your browser
2. You will see the **Sign in with Google** screen
3. Click the button — you are redirected to Google's consent page
4. Grant the requested permissions
5. Google redirects to `http://localhost:8080/api/auth/callback`
6. The backend saves tokens to `backend/credentials/tokens.json`
7. You are redirected back to `http://localhost:5173?auth=success`
8. The app shows the main interface — **you never need to log in again**

---

## Production Deployment Notes

- Change `google.redirect-uri` and `app.frontend.url` to your production domains
- Update the redirect URI in Google Cloud Console to match
- Secure the `credentials/` directory (file permissions, secrets manager, etc.)
- Consider running the backend behind a reverse proxy (nginx/caddy) with HTTPS
- Set `logging.level.com.example.gdrive=INFO` for production logging

---

## Running Tests

```bash
cd backend
mvn test
```
