import datetime
import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from config import Config

class CalendarService:
    def __init__(self):
        self.creds = Credentials.from_authorized_user_file(Config.TOKEN_PATH)
        self.service = build('calendar', 'v3', credentials=self.creds)

    def get_upcoming_events(self, max_results=10):
        now = datetime.datetime.utcnow().isoformat() + 'Z'
        events_result = self.service.events().list(
            calendarId='primary', timeMin=now,
            maxResults=max_results, singleEvents=True,
            orderBy='startTime').execute()
        events = events_result.get('items', [])
        
        if not events:
            return "No upcoming events found."
            
        summary = "Upcoming Availability Conflicts:\n"
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            summary += f"- Busy at {start}\n"
        
        return summary
