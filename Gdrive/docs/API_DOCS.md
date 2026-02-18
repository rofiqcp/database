# API Documentation

Base URL: `http://localhost:8080/api`

All endpoints return JSON. Error responses have the shape `{ "error": "message" }`.

---

## Authentication

### `GET /api/auth/status`
Returns whether the backend currently holds a valid Google token.

**Response**
```json
{ "authenticated": true, "message": "Authenticated with Google" }
```

---

### `GET /api/auth/url`
Returns the Google OAuth2 consent URL. Redirect the browser to `authUrl`.

**Response**
```json
{ "authUrl": "https://accounts.google.com/o/oauth2/auth?..." }
```

---

### `GET /api/auth/callback?code=<code>`
Called automatically by Google after the user grants access. Exchanges the code
for tokens, persists them to `credentials/tokens.json`, then **redirects** the
browser to `http://localhost:5173?auth=success`.

**Query params**
| Param | Description |
|-------|-------------|
| `code` | Authorisation code from Google |
| `error` | Set by Google when the user denies access |

---

### `POST /api/auth/logout`
Deletes stored tokens. The user must re-authenticate on the next request.

**Response**
```json
{ "message": "Logged out successfully" }
```

---

## Google Drive

### `GET /api/drive/files`
Lists files from Google Drive.

**Query params**
| Param | Default | Description |
|-------|---------|-------------|
| `pageSize` | `30` | Max results to return |
| `pageToken` | — | Pagination token from a previous response |
| `query` | — | Filter by file name (partial match) |

**Response**
```json
{
  "files": [
    {
      "id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
      "name": "My Document",
      "mimeType": "application/vnd.google-apps.document",
      "size": "0",
      "createdTime": "2024-01-15T10:30:00.000Z",
      "modifiedTime": "2024-06-01T14:22:00.000Z",
      "webViewLink": "https://docs.google.com/document/d/.../edit",
      "webContentLink": null,
      "parents": "root",
      "trashed": false
    }
  ],
  "count": 1
}
```

---

### `GET /api/drive/files/{id}`
Returns metadata for a single file.

---

### `GET /api/drive/files/{id}/download`
Downloads the raw file content as `application/octet-stream`.

---

### `POST /api/drive/upload`
Uploads a file to Google Drive using `multipart/form-data`.

**Form fields**
| Field | Required | Description |
|-------|----------|-------------|
| `file` | Yes | The file to upload |
| `folderId` | No | Target folder ID (defaults to Drive root) |

**Response** — the uploaded file's metadata (same shape as `DriveFile`).

---

### `DELETE /api/drive/delete/{id}`
Moves a file to the trash.

**Query params**
| Param | Default | Description |
|-------|---------|-------------|
| `permanent` | `false` | Set `true` to permanently delete |

**Response**
```json
{ "message": "File moved to trash", "fileId": "1Bxi..." }
```

---

## Google Sheets

### `GET /api/sheets/{spreadsheetId}`
Returns spreadsheet metadata (title, list of sheets).

**Response**
```json
{
  "spreadsheetId": "1BxiMVs...",
  "title": "My Spreadsheet",
  "sheets": [
    { "sheetId": 0, "title": "Sheet1", "index": 0 }
  ]
}
```

---

### `GET /api/sheets/{spreadsheetId}/values?range=Sheet1!A1:D10`
Reads cell values from the specified A1-notation range.

**Response**
```json
{
  "range": "Sheet1!A1:D3",
  "values": [
    ["Name", "Age", "City", "Score"],
    ["Alice", "30", "London", "95"],
    ["Bob", "25", "Paris", "88"]
  ],
  "rowCount": 3
}
```

---

### `PUT /api/sheets/{spreadsheetId}/values`
Overwrites values at the specified range.

**Request body**
```json
{
  "range": "Sheet1!A1",
  "values": [
    ["Name", "Age", "City"],
    ["Alice", "30", "London"]
  ]
}
```

**Response**
```json
{
  "updatedRange": "Sheet1!A1:C2",
  "updatedRows": 2,
  "updatedColumns": 3,
  "updatedCells": 6
}
```

---

### `POST /api/sheets/{spreadsheetId}/values`
Appends rows after the last row that contains data.

**Request body** — same shape as PUT.

---

### `DELETE /api/sheets/{spreadsheetId}/values?range=Sheet1!A1:D10`
Clears all values in the specified range (does not delete the rows).

---

## Google Docs

### `GET /api/docs/{documentId}`
Returns document metadata and extracted plain text.

**Response**
```json
{
  "documentId": "1BxiMVs...",
  "title": "My Document",
  "plainText": "Hello, World!\nThis is a paragraph.\n",
  "revisionId": "ABcDeF123"
}
```

---

### `POST /api/docs/create`
Creates a new Google Doc.

**Request body**
```json
{ "title": "My New Document" }
```

**Response**
```json
{
  "documentId": "1BxiMVs...",
  "title": "My New Document",
  "message": "Document created successfully"
}
```

---

### `POST /api/docs/{documentId}/append`
Appends plain text to the end of the document.

**Request body**
```json
{ "text": "A new paragraph added programmatically." }
```

---

### `PUT /api/docs/{documentId}/replace`
Replaces all occurrences of a search string with a replacement string.

**Request body**
```json
{ "search": "Hello", "replacement": "Hi there" }
```
