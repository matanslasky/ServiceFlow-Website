# OAuth Backend

This Flask server handles Gmail OAuth authentication for the multi-user agent system.

## Setup

1. Install dependencies:
```bash
cd oauth_backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Set environment variables:
```bash
export VITE_SUPABASE_URL="your_supabase_url"
export VITE_SUPABASE_SERVICE_KEY="your_service_key"
export FRONTEND_URL="http://localhost:5173"
```

3. Run the server:
```bash
python app.py
```

The server will run on http://localhost:5000

## Endpoints

- **GET /auth/gmail/connect?user_id={user_id}** - Initiates OAuth flow
- **GET /auth/gmail/callback** - Handles OAuth callback
- **POST /auth/gmail/disconnect** - Disconnects Gmail for a user
- **GET /health** - Health check

## How it works

1. User clicks "Connect Gmail" in Settings
2. Frontend redirects to `/auth/gmail/connect?user_id={user_id}`
3. User authorizes in Google's OAuth consent screen
4. Google redirects to `/auth/gmail/callback` with authorization code
5. Server exchanges code for access token and refresh token
6. Tokens are stored in `gmail_credentials` table in Supabase
7. User is redirected back to Settings page

## Production Deployment

For production, you should:
- Use HTTPS with proper domain
- Update `REDIRECT_URI` to your production callback URL
- Store state in Redis/database instead of URL parameter
- Add proper error handling and logging
- Use environment variables for all configuration
