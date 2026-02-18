# credentials/

This directory holds sensitive Google OAuth2 files and is **gitignored**.

## Files expected here

| File | Description |
|------|-------------|
| `credentials.json` | OAuth 2.0 client secret downloaded from Google Cloud Console |
| `tokens.json` | Persisted access + refresh token (auto-created on first login) |
| `StoredCredential` | Google API client data-store file (auto-created) |

## How to obtain `credentials.json`

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Choose **Desktop app** as the application type
6. Download the JSON file and rename it to `credentials.json`
7. Place it in this directory

> ⚠️ **Never commit `credentials.json` or `tokens.json` to source control.**
