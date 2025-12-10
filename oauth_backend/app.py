"""
OAuth Backend for Gmail Integration
Run this with: python app.py
"""

from flask import Flask, request, redirect, jsonify
from flask_cors import CORS
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from supabase import create_client
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Supabase Setup
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_SERVICE_KEY')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# OAuth Setup
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.send'
]

# Use the same credentials.json from your agent folder
CLIENT_SECRETS_FILE = os.path.join(os.path.dirname(__file__), '..', 'agent', 'credentials.json')
# For production, use environment variable for redirect URI
REDIRECT_URI = os.getenv('REDIRECT_URI', 'http://localhost:5001/auth/gmail/callback')

@app.route('/auth/gmail/connect', methods=['GET'])
def gmail_connect():
    """Initiates the OAuth flow"""
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    # Create OAuth flow
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    
    # Generate authorization URL with user_id in state
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',  # Force consent to get refresh token
        state=user_id  # Pass user_id as state
    )
    
    return redirect(authorization_url)


@app.route('/auth/gmail/callback', methods=['GET'])
def gmail_callback():
    """Handles the OAuth callback"""
    code = request.args.get('code')
    user_id = request.args.get('state')  # Retrieve user_id from state
    
    if not code or not user_id:
        return 'Error: Missing code or user_id', 400
    
    try:
        # Exchange code for tokens
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri=REDIRECT_URI
        )
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Get user's email address using the access token
        from googleapiclient.discovery import build
        service = build('gmail', 'v1', credentials=credentials)
        profile = service.users().getProfile(userId='me').execute()
        email_address = profile['emailAddress']
        
        # Store credentials in database
        token_data = {
            'user_id': user_id,
            'email_address': email_address,
            'access_token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_expiry': credentials.expiry.isoformat() if credentials.expiry else None,
            'is_connected': True
        }
        
        # Upsert to gmail_credentials table
        response = supabase.table('gmail_credentials').upsert(token_data).execute()
        
        # Redirect back to settings page with success
        return redirect(f'{os.getenv("FRONTEND_URL", "http://localhost:5173")}/settings?gmail_connected=true')
        
    except Exception as e:
        print(f"Error in OAuth callback: {e}")
        return redirect(f'{os.getenv("FRONTEND_URL", "http://localhost:5173")}/settings?gmail_connected=false&error={str(e)}')


@app.route('/auth/gmail/disconnect', methods=['POST'])
def gmail_disconnect():
    """Disconnects Gmail for a user"""
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400
    
    try:
        # Update database to mark as disconnected
        supabase.table('gmail_credentials').update({
            'is_connected': False
        }).eq('user_id', user_id).execute()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})


if __name__ == '__main__':
    # Run on port from environment variable (Railway) or 5001 (local)
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
