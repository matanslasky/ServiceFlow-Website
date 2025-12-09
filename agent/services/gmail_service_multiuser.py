"""
Updated Gmail Service with Per-User OAuth Support

This version loads Gmail credentials from the database for each user
instead of using shared credentials.json/token.json files.
"""

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import datetime, timedelta
from supabase import create_client
from config import Config

class GmailService:
    def __init__(self, user_id):
        """Initialize Gmail service with user-specific credentials"""
        self.user_id = user_id
        self.supabase = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
        self.service = None
        self._load_credentials()
    
    def _load_credentials(self):
        """Load OAuth credentials from database for this user"""
        try:
            response = self.supabase.table('gmail_credentials')\
                .select('*')\
                .eq('user_id', self.user_id)\
                .eq('is_connected', True)\
                .single()\
                .execute()
            
            if not response.data:
                raise Exception(f"No Gmail credentials found for user {self.user_id}")
            
            creds_data = response.data
            
            # Create credentials object
            creds = Credentials(
                token=creds_data['access_token'],
                refresh_token=creds_data['refresh_token'],
                token_uri='https://oauth2.googleapis.com/token',
                client_id=Config.GMAIL_CLIENT_ID,  # Add to config
                client_secret=Config.GMAIL_CLIENT_SECRET,  # Add to config
                scopes=[
                    'https://www.googleapis.com/auth/gmail.readonly',
                    'https://www.googleapis.com/auth/gmail.modify',
                    'https://www.googleapis.com/auth/gmail.send'
                ]
            )
            
            # Check if token is expired and refresh if needed
            if creds_data['token_expiry']:
                expiry = datetime.fromisoformat(creds_data['token_expiry'])
                if expiry < datetime.now():
                    creds.refresh(None)
                    self._update_tokens(creds)
            
            # Build Gmail service
            self.service = build('gmail', 'v1', credentials=creds)
            print(f"✅ Gmail service initialized for user {self.user_id}")
            
        except Exception as e:
            print(f"❌ Error loading Gmail credentials for user {self.user_id}: {e}")
            raise
    
    def _update_tokens(self, creds):
        """Update tokens in database after refresh"""
        try:
            self.supabase.table('gmail_credentials').update({
                'access_token': creds.token,
                'token_expiry': creds.expiry.isoformat() if creds.expiry else None
            }).eq('user_id', self.user_id).execute()
        except Exception as e:
            print(f"Warning: Failed to update tokens in database: {e}")
    
    def get_unread_emails(self, max_results=10):
        """Fetch unread emails from user's Gmail account"""
        if not self.service:
            return []
        
        try:
            # Get today's date for filtering
            today = datetime.now().strftime('%Y/%m/%d')
            
            results = self.service.users().messages().list(
                userId='me',
                q=f'is:unread after:{today}',
                maxResults=max_results
            ).execute()
            
            messages = results.get('messages', [])
            emails = []
            
            for msg in messages:
                msg_data = self.service.users().messages().get(
                    userId='me', 
                    id=msg['id'],
                    format='full'
                ).execute()
                
                headers = msg_data.get('payload', {}).get('headers', [])
                sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
                subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '(No Subject)')
                
                emails.append({
                    'id': msg_data['id'],
                    'sender': sender,
                    'subject': subject,
                    'snippet': msg_data.get('snippet', ''),
                    'thread_id': msg_data.get('threadId')
                })
            
            return emails
            
        except Exception as e:
            print(f"Error fetching emails for user {self.user_id}: {e}")
            return []
    
    def mark_as_read(self, email_id):
        """Mark an email as read"""
        if not self.service:
            return
        
        try:
            self.service.users().messages().modify(
                userId='me',
                id=email_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
            print(f"Marked email {email_id} as read for user {self.user_id}")
        except Exception as e:
            print(f"Error marking email as read: {e}")
    
    def send_reply(self, to_email, subject, body, thread_id=None):
        """Send an email reply"""
        if not self.service:
            return
        
        try:
            import base64
            from email.mime.text import MIMEText
            
            message = MIMEText(body)
            message['to'] = to_email
            message['subject'] = subject
            
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            send_params = {
                'userId': 'me',
                'body': {'raw': raw_message}
            }
            
            if thread_id:
                send_params['body']['threadId'] = thread_id
            
            self.service.users().messages().send(**send_params).execute()
            print(f"✅ Email sent successfully to {to_email} from user {self.user_id}")
            
        except Exception as e:
            print(f"❌ Error sending email for user {self.user_id}: {e}")
            raise
