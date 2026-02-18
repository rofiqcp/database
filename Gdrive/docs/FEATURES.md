# Features

## Authentication
- **Persistent OAuth2** — authenticate once, tokens are saved to disk permanently
- **Automatic token refresh** — access tokens are refreshed silently using the stored refresh token
- **Secure credential storage** — credentials directory is gitignored and never committed
- **Logout** — clears stored tokens, requiring re-authentication on next use

## Google Drive
- **Browse files** — lists all non-trashed files with name, type, size, and modification date
- **Search files** — filter files by name with live search
- **View file metadata** — retrieve detailed file information
- **Download files** — download any Drive file by ID
- **Upload files** — upload any file via drag-and-drop or file picker (up to 100 MB)
- **Folder upload** — upload files directly into a specific Drive folder by ID
- **Soft delete** — move files to trash (recoverable)
- **Permanent delete** — permanently remove files from Drive

## Google Sheets
- **Read spreadsheet metadata** — get title and list of sheets
- **Switch between sheets** — tab navigation for all sheets in a workbook
- **Read cell values** — load any A1-notation range as a table
- **Write values** — overwrite a range with new data (USER_ENTERED mode)
- **Append rows** — insert new rows after the last row of data
- **Clear range** — remove all values from a range without deleting rows

## Google Docs
- **Read documents** — retrieve title, revision ID, and full plain-text content
- **Create documents** — create new Google Docs with a custom title
- **Append text** — insert new paragraphs at the end of any document
- **Find and replace** — replace all occurrences of a string in a document

## Frontend (Vue 3)
- **Tabbed interface** — Files, Upload, Sheets, Docs views
- **Responsive layout** — works on desktop, tablet, and mobile
- **Loading states** — skeleton loaders and spinners during API calls
- **Error messages** — inline error display for every failed operation
- **Drag-and-drop upload** — drop files directly onto the upload zone
- **Multi-file upload** — queue multiple files and upload them sequentially
- **Upload progress** — per-file progress bars with real-time percentage

## Backend (Spring Boot)
- **RESTful API** — clean JSON responses with proper HTTP status codes
- **CORS** — configured for http://localhost:5173 (frontend dev server)
- **File size limit** — configurable (default 100 MB)
- **Comprehensive logging** — DEBUG-level logs for all Google API interactions
