# Per-User Gmail OAuth Setup Guide

## Overview
This guide will help you set up per-user Gmail OAuth so each user can connect their own Gmail account to the agent.

---

## Step 1: Extract OAuth Credentials from credentials.json

1. Open your `agent/credentials.json` file
2. Extract these values:
   - `client_id` (under `installed` or `web`)
   - `client_secret`

3. Add them to `agent/.env`:
```bash
GMAIL_CLIENT_ID="your_client_id_here.apps.googleusercontent.com"
GMAIL_CLIENT_SECRET="your_client_secret_here"
```

---

## Step 2: Update Google Cloud Console Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   - `http://localhost:5000/auth/gmail/callback` (for development)
   - `https://your-domain.com/auth/gmail/callback` (for production)
6. Click **Save**

---

## Step 3: Set Up OAuth Backend

1. Install dependencies:
```bash
cd oauth_backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Set environment variables (or add to `oauth_backend/.env`):
```bash
export VITE_SUPABASE_URL="your_supabase_url"
export VITE_SUPABASE_SERVICE_KEY="your_service_role_key"
export FRONTEND_URL="http://localhost:5173"
```

3. Start the OAuth server:
```bash
python app.py
```

The server will run on http://localhost:5000

---

## Step 4: Update Frontend Environment Variables

Add to `website/.env`:
```bash
VITE_OAUTH_BACKEND_URL=http://localhost:5000
```

For production:
```bash
VITE_OAUTH_BACKEND_URL=https://your-oauth-backend.com
```

---

## Step 5: Update Agent to Use Per-User Credentials

### Option A: Quick Test (Recommended First)

Just test the OAuth flow works before updating the agent:

1. Start OAuth backend: `cd oauth_backend && python app.py`
2. Start frontend: `cd website && npm run dev`
3. Go to Settings page
4. Click "Connect Gmail"
5. Authorize with Google
6. Check Supabase `gmail_credentials` table to verify tokens are stored

### Option B: Full Implementation

Replace the GmailService in main.py:

1. Backup current gmail_service.py:
```bash
cd agent/services
cp gmail_service.py gmail_service_old.py
```

2. Replace with new version:
```bash
cp gmail_service_multiuser.py gmail_service.py
```

3. Update `main.py` to pass user_id to GmailService:

**Before:**
```python
async def main():
    db_bridge = SupabaseService()
    gmail = GmailService()  # Shared for all users
    
    while True:
        active_users = db_bridge.get_active_users()
        for user_id in active_users:
            await process_emails(db_bridge, user_id)
```

**After:**
```python
async def main():
    db_bridge = SupabaseService()
    
    while True:
        active_users = db_bridge.get_active_users()
        for user_id in active_users:
            try:
                # Create per-user Gmail service
                gmail = GmailService(user_id)
                await process_emails(db_bridge, gmail, user_id)
            except Exception as e:
                print(f"Skipping user {user_id}: {e}")
```

4. Update `scheduler.py` to accept gmail parameter:

**Before:**
```python
async def process_emails(db_bridge, user_id):
    gmail = GmailService()  # Creates shared instance
    emails = gmail.get_unread_emails()
```

**After:**
```python
async def process_emails(db_bridge, gmail, user_id):
    # Use the gmail instance passed in (already user-specific)
    emails = gmail.get_unread_emails()
```

---

## Step 6: Testing Multi-User OAuth

1. **Create a second test user:**
   - Sign up with a different email in your app
   - Note the user_id from Supabase auth.users table

2. **Connect Gmail for both users:**
   - Login as User 1 → Settings → Connect Gmail → Authorize
   - Login as User 2 → Settings → Connect Gmail → Authorize
   - Check `gmail_credentials` table - should have 2 rows

3. **Enable email agent for both users:**
   - Each user: Settings → Toggle "Email Secretary Agent" ON

4. **Run the agent:**
```bash
cd agent
source .venv/bin/activate
python main.py
```

5. **Verify in logs:**
   - Should see "Processing user: {user_id_1}"
   - Should see "Gmail service initialized for user {user_id_1}"
   - Should see "Processing user: {user_id_2}"
   - Should see "Gmail service initialized for user {user_id_2}"

6. **Send test emails:**
   - Send email to User 1's Gmail
   - Send email to User 2's Gmail
   - Each should appear in their respective Dashboard pending approvals

---

## Troubleshooting

### "No Gmail credentials found for user"
- User hasn't connected Gmail yet
- Check `gmail_credentials` table in Supabase
- Make sure `is_connected = true`

### "Token expired" errors
- The refresh token should auto-refresh
- If it fails, user needs to disconnect and reconnect Gmail
- Make sure `token_uri` is set correctly in GmailService

### OAuth callback fails
- Check redirect URI matches Google Cloud Console exactly
- Make sure OAuth backend is running on correct port
- Check browser console for CORS errors

### Agent can't read credentials.json client_id/client_secret
- Extract values from credentials.json to .env file
- Make sure GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET are set
- Restart agent after adding to .env

---

## Production Deployment Checklist

- [ ] Deploy OAuth backend to production server (Heroku, Railway, etc.)
- [ ] Update Google Cloud Console redirect URIs with production URL
- [ ] Set production environment variables
- [ ] Use HTTPS for all OAuth endpoints
- [ ] Enable proper CORS settings
- [ ] Add rate limiting to OAuth endpoints
- [ ] Monitor token refresh failures
- [ ] Set up alerts for OAuth errors
- [ ] Consider using Redis for state management instead of URL params
- [ ] Encrypt tokens at rest in database (optional but recommended)

---

## Architecture Summary

```
User Browser → Frontend (React)
                  ↓
            [Click "Connect Gmail"]
                  ↓
          OAuth Backend (Flask) → Google OAuth
                  ↓
         [Get tokens from Google]
                  ↓
          Store in Supabase
          (gmail_credentials table)
                  ↓
          Redirect back to Frontend
                  ↓
          [User sees "Connected ✅"]

Later:
Agent Main Loop
    ↓
Get active users from DB
    ↓
For each user:
    ↓
Load their tokens from gmail_credentials
    ↓
Create GmailService(user_id)
    ↓
Read THEIR emails
    ↓
Generate drafts
    ↓
Save to email_drafts (user_id scoped)
```

---

## Next Steps After Setup

1. **Test with real users** - Have colleagues test the OAuth flow
2. **Monitor logs** - Watch for token refresh issues
3. **Add error handling** - Gracefully handle disconnected Gmail accounts
4. **Build onboarding** - Guide new users through Gmail connection
5. **Add notifications** - Alert users if their Gmail connection fails
