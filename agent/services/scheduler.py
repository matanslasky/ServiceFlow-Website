import asyncio
from config import Config
from services.gmail_service import GmailService
from services.ai_service import AIService
from services.calendar_service import CalendarService
from services.privacy_service import PrivacyService
from services.audit_log import AuditLogger
# from services.telegram_service import TelegramBot # Removed

async def process_emails(db_bridge): # Changed argument
    gmail = GmailService()
    calendar = CalendarService()
    
    print("Checking for new emails...")
    emails = gmail.get_unread_emails()
    
    for email in emails:
        AuditLogger.log_action("EMAIL_FETCHED", f"ID: {email['id']}")
        
        category = AIService.classify_email(email['snippet'])
        AuditLogger.log_action("CLASSIFIED", f"Category: {category}")
        
        cal_info = calendar.get_upcoming_events()
        
        draft_body = AIService.generate_draft(email['sender'], email['snippet'], cal_info)
        
        if not PrivacyService.check_forbidden_phrases(draft_body):
            draft_body = "[SYSTEM BLOCKED DRAFT DUE TO PRIVACY VIOLATION]"
        
        safety_report = AIService.check_safety(draft_body)
        
        if safety_report['status'] == 'unsafe':
             draft_body = f"⚠️ UNSAFE DRAFT DETECTED:\nReasons: {safety_report['reasons']}\n\nSuggested:\n{safety_report.get('suggestion', 'N/A')}"
             AuditLogger.log_action("SAFETY_FLAG", "Draft flagged as unsafe")

        # NEW: Send to Supabase instead of Telegram
        db_bridge.post_draft_for_approval(
            email_id=email['id'],
            sender=email['sender'],
            subject=email['subject'],
            draft_text=draft_body,
            original_snippet=email['snippet']
        )
        
        # Mark email as read so we don't process it again
        gmail.mark_as_read(email['id'])