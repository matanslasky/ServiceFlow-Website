import os.path
import base64
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from config import Config
from email.mime.text import MIMEText

SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify',  # Required for reading/marking emails
    'https://www.googleapis.com/auth/calendar.readonly' # Required for checking free/busy times
]

class GmailService:
    def __init__(self):
        self.creds = None
        if os.path.exists(Config.TOKEN_PATH):
            self.creds = Credentials.from_authorized_user_file(Config.TOKEN_PATH, SCOPES)
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    Config.GOOGLE_CREDENTIALS, SCOPES)
                self.creds = flow.run_local_server(port=0)
            with open(Config.TOKEN_PATH, 'w') as token:
                token.write(self.creds.to_json())
        
        self.service = build('gmail', 'v1', credentials=self.creds)

    def get_unread_emails(self):
        """Fetch unread emails from Inbox"""
        results = self.service.users().messages().list(userId='me', labelIds=['INBOX', 'UNREAD']).execute()
        messages = results.get('messages', [])
        email_data = []

        for msg in messages:
            full_msg = self.service.users().messages().get(userId='me', id=msg['id']).execute()
            headers = full_msg['payload']['headers']
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), "No Subject")
            sender = next((h['value'] for h in headers if h['name'] == 'From'), "Unknown")
            snippet = full_msg.get('snippet', '')
            
            email_data.append({
                'id': msg['id'],
                'subject': subject,
                'sender': sender,
                'snippet': snippet,
                'threadId': full_msg['threadId']
            })
        return email_data

    def create_draft(self, to_email, subject, body, thread_id=None):
        message = MIMEText(body)
        message['to'] = to_email
        message['subject'] = subject
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        body = {'message': {'raw': raw}}
        if thread_id:
            body['message']['threadId'] = thread_id
            
        draft = self.service.users().drafts().create(userId='me', body=body).execute()
        return draft['id']

    def send_reply(self, to_email, subject, body, thread_id):
        message = MIMEText(body)
        message['to'] = to_email
        message['subject'] = subject
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        body_payload = {'raw': raw, 'threadId': thread_id}
        sent_msg = self.service.users().messages().send(userId='me', body=body_payload).execute()
        
        # Mark as read
        self.service.users().messages().modify(
            userId='me', 
            id=thread_id, 
            body={'removeLabelIds': ['UNREAD']}
        ).execute()
        
        return sent_msg
