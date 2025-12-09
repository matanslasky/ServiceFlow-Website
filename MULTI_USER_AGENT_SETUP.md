# Multi-User Agent Architecture

## Overview
The system now supports multiple users, each with their own Gmail account and agent configuration.

## Architecture

### Current Status
- ✅ Database schema updated with `gmail_credentials` table
- ✅ Settings page shows Gmail connection status
- ✅ Agent toggle requires Gmail to be connected
- ⚠️ Gmail OAuth flow needs backend implementation
- ⚠️ Agent needs to be refactored to handle multiple users

### Database Tables

**gmail_credentials**
- Stores OAuth tokens per user (encrypted in production)
- Fields: user_id, email_address, access_token, refresh_token, token_expiry, is_connected

**agent_settings**
- Per-user agent configuration
- Fields: user_id, active_agents[], email_draft_mode, business_hours_only

**email_drafts**
- Drafts are scoped to user_id

## Implementation Options

### Option 1: Single Agent Process (Recommended for MVP)
**How it works:**
1. One Python agent process runs continuously
2. Agent queries all users where `active_agents` contains 'email_secretary'
3. For each active user:
   - Load their Gmail credentials from database
   - Check their inbox using their OAuth tokens
   - Generate drafts and save to their email_drafts table
4. Loop every CHECK_INTERVAL minutes

**Pros:**
- Simple deployment (one process)
- Easy to manage and monitor
- Scales to ~100 users

**Cons:**
- Single point of failure
- All users share same check interval

**Files to modify:**
- `agent/main.py` - Loop through all active users
- `agent/services/gmail_service.py` - Accept user credentials as parameter
- `agent/services/supabase_service.py` - Add method to get all active users

### Option 2: Per-User Agent Processes
**How it works:**
1. Web app spawns/manages individual agent processes per user
2. Each agent only monitors one user's Gmail
3. Processes managed via PM2, Supervisor, or Kubernetes

**Pros:**
- Isolated failures
- Per-user customization (different intervals, etc.)
- Better for high-volume users

**Cons:**
- Complex process management
- Higher resource usage
- Harder to deploy

## Gmail OAuth Implementation

### Backend Requirements
You need a backend API endpoint (Flask/FastAPI) to handle OAuth:

```python
# Example OAuth flow endpoint
@app.route('/auth/gmail/connect')
def gmail_connect():
    user_id = get_current_user_id()  # From session
    
    flow = Flow.from_client_secrets_file(
        'credentials.json',
        scopes=['https://www.googleapis.com/auth/gmail.modify'],
        redirect_uri='https://yourapp.com/auth/gmail/callback'
    )
    
    authorization_url, state = flow.authorization_url()
    session['state'] = state
    session['user_id'] = user_id
    
    return redirect(authorization_url)

@app.route('/auth/gmail/callback')
def gmail_callback():
    flow = Flow.from_client_secrets_file(
        'credentials.json',
        scopes=['https://www.googleapis.com/auth/gmail.modify'],
        redirect_uri='https://yourapp.com/auth/gmail/callback',
        state=session['state']
    )
    
    flow.fetch_token(authorization_response=request.url)
    credentials = flow.credentials
    
    # Save to database
    supabase.table('gmail_credentials').upsert({
        'user_id': session['user_id'],
        'email_address': get_email_from_token(credentials),
        'access_token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_expiry': credentials.expiry,
        'is_connected': True
    })
    
    return redirect('/settings?gmail_connected=true')
```

### Frontend Updates
Update Settings.jsx `handleConnectGmail`:
```javascript
const handleConnectGmail = () => {
  window.location.href = 'https://your-backend-api.com/auth/gmail/connect';
};
```

## Quick Start for Testing

### Temporary Solution (Single User)
For now, you can test with the current setup:

1. Run SQL in Supabase to mark Gmail as connected:
```sql
INSERT INTO gmail_credentials (user_id, email_address, is_connected)
VALUES ('your-user-id', 'your@gmail.com', true)
ON CONFLICT (user_id) DO UPDATE SET is_connected = true;
```

2. The agent will continue using the credentials.json and token.json files in the agent/ folder

### Full Multi-User Implementation
See `agent/REFACTORING_PLAN.md` for step-by-step guide to refactor the agent.

## Security Considerations

1. **Never commit OAuth tokens** - Add to .gitignore
2. **Encrypt tokens at rest** - Use Supabase encryption or application-level encryption
3. **Use service role key securely** - Never expose in frontend
4. **Implement token refresh** - Gmail tokens expire, refresh them automatically
5. **Rate limiting** - Respect Gmail API quotas per user

## Next Steps

1. ✅ Run the SQL to create `gmail_credentials` table
2. ✅ Test Settings page UI changes
3. ⬜ Implement OAuth backend endpoints
4. ⬜ Refactor agent to support multiple users (see Option 1)
5. ⬜ Deploy and test end-to-end flow
