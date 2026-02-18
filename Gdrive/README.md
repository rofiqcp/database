# Google Drive Integration

A full-stack application for managing Google Drive files, Sheets, and Docs through a clean web UI.
Built with **Java Spring Boot 3** on the backend and **Vue 3 + Vite** on the frontend.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2, Maven |
| Google APIs | Drive v3, Sheets v4, Docs v1 |
| Auth | Google OAuth 2.0 (persisted tokens) |
| Frontend | Vue 3, Vite 5, Pinia, TailwindCSS |
| HTTP client | Axios |

---

## Quick Start

### 1. Set up Google credentials

Follow **[docs/GOOGLE_DRIVE_SETUP.md](docs/GOOGLE_DRIVE_SETUP.md)** for the full walkthrough.

In brief:
1. Create a Google Cloud project at https://console.cloud.google.com/
2. Enable **Drive API**, **Sheets API**, and **Docs API**
3. Create an **OAuth 2.0 Client ID** (Desktop app type)
4. Download `credentials.json` → place at `backend/credentials/credentials.json`

### 2. Start the backend

```bash
cd backend
mvn spring-boot:run
# Server runs on http://localhost:8080
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### 4. Authenticate (one-time)

Open http://localhost:5173, click **Sign in with Google**, grant permissions.
Tokens are saved to `backend/credentials/tokens.json` — you won't be asked again.

---

## Project Structure

```
Gdrive/
├── backend/                        # Spring Boot application
│   ├── src/main/java/com/example/gdrive/
│   │   ├── GdriveApplication.java  # Entry point
│   │   ├── config/
│   │   │   └── GoogleConfig.java   # OAuth2 config & CORS
│   │   ├── controller/
│   │   │   ├── AuthController.java     # /api/auth/*
│   │   │   ├── DriveController.java    # /api/drive/*
│   │   │   ├── SheetsController.java   # /api/sheets/*
│   │   │   └── DocsController.java     # /api/docs/*
│   │   ├── service/
│   │   │   ├── GoogleAuthService.java  # Token management
│   │   │   ├── GoogleDriveService.java # Drive operations
│   │   │   ├── GoogleSheetsService.java
│   │   │   └── GoogleDocsService.java
│   │   └── model/
│   │       └── DriveFile.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── credentials/                # GITIGNORED — put credentials.json here
│   │   └── README.md
│   └── pom.xml
│
├── frontend/                       # Vue 3 application
│   ├── src/
│   │   ├── App.vue                 # Root component with tab navigation
│   │   ├── main.js
│   │   ├── api.js                  # Axios instance
│   │   ├── style.css
│   │   ├── stores/
│   │   │   ├── authStore.js        # Auth state (Pinia)
│   │   │   └── driveStore.js       # Drive file state (Pinia)
│   │   └── components/
│   │       ├── AuthLogin.vue       # Google login button
│   │       ├── FileBrowser.vue     # Browse/download/delete files
│   │       ├── FileUpload.vue      # Drag-and-drop upload
│   │       ├── SheetsViewer.vue    # Read/write spreadsheets
│   │       └── DocsViewer.vue      # Read/write documents
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── SETUP.md
│   ├── API_DOCS.md
│   ├── GOOGLE_DRIVE_SETUP.md
│   ├── FEATURES.md
│   └── TROUBLESHOOTING.md
│
└── examples/
    ├── sample_queries.md           # curl examples for every endpoint
    └── sample_data.json            # Example API responses
```

---

## API Endpoints

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/status` | Check if authenticated |
| GET | `/api/auth/url` | Get Google OAuth2 consent URL |
| GET | `/api/auth/callback` | OAuth2 callback (called by Google) |
| POST | `/api/auth/logout` | Delete stored tokens |

### Google Drive

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/drive/files` | List files (`pageSize`, `query`, `pageToken`) |
| GET | `/api/drive/files/{id}` | Get file metadata |
| GET | `/api/drive/files/{id}/download` | Download file content |
| POST | `/api/drive/upload` | Upload file (multipart/form-data) |
| DELETE | `/api/drive/delete/{id}` | Trash or permanently delete |

### Google Sheets

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/sheets/{id}` | Get spreadsheet metadata |
| GET | `/api/sheets/{id}/values` | Read values (`range` param) |
| PUT | `/api/sheets/{id}/values` | Overwrite values |
| POST | `/api/sheets/{id}/values` | Append rows |
| DELETE | `/api/sheets/{id}/values` | Clear range |

### Google Docs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/docs/{id}` | Get document content |
| POST | `/api/docs/create` | Create new document |
| POST | `/api/docs/{id}/append` | Append text |
| PUT | `/api/docs/{id}/replace` | Find and replace text |

See **[docs/API_DOCS.md](docs/API_DOCS.md)** for full request/response examples.

---

## Configuration

### Backend (`backend/src/main/resources/application.properties`)

```properties
server.port=8080
google.credentials.file-path=credentials/credentials.json
google.tokens.file-path=credentials/tokens.json
google.redirect-uri=http://localhost:8080/api/auth/callback
app.frontend.url=http://localhost:5173
spring.servlet.multipart.max-file-size=100MB
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8080/api
```

---

## OAuth2 Flow

```
Browser            Frontend           Backend            Google
  │                   │                  │                  │
  │  open app         │                  │                  │
  │──────────────────>│                  │                  │
  │                   │  GET /auth/status│                  │
  │                   │─────────────────>│                  │
  │                   │ {authenticated:  │                  │
  │                   │   false}         │                  │
  │                   │<─────────────────│                  │
  │  show login button│                  │                  │
  │<──────────────────│                  │                  │
  │  click login      │                  │                  │
  │──────────────────>│  GET /auth/url   │                  │
  │                   │─────────────────>│                  │
  │                   │  {authUrl:...}   │                  │
  │  redirect ────────│────────────────────────────────────>│
  │                   │                  │  consent screen  │
  │  grant access ────│────────────────────────────────────>│
  │                   │      GET /auth/callback?code=...    │
  │                   │                  │<─────────────────│
  │                   │                  │ save tokens.json │
  │  redirect to /?auth=success          │                  │
  │<─────────────────────────────────────│                  │
  │  show main app    │                  │                  │
```

---

## Security Notes

- **`credentials/credentials.json`** — OAuth client secret. Keep it private. Never commit it.
- **`credentials/tokens.json`** — Access + refresh tokens for your Google account. Never commit it.
- Both files are excluded from git via `.gitignore`.
- The `credentials/` directory has a `README.md` committed to explain what belongs there.
- CORS is restricted to `http://localhost:5173` in development. Update for production.
- In production, use environment variables or a secrets manager instead of files on disk.

---

## Documentation

- [Setup Guide](docs/SETUP.md)
- [API Reference](docs/API_DOCS.md)
- [Google Cloud Console Setup](docs/GOOGLE_DRIVE_SETUP.md)
- [Features](docs/FEATURES.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
