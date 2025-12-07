import asyncio
import time
from config import Config
from services.supabase_service import SupabaseService
from services.gmail_service import GmailService
from services.scheduler import process_emails

async def main():
    # Initialize Services
    db_bridge = SupabaseService()
    gmail = GmailService()
    
    print(f"System Started for User ID: {Config.TARGET_USER_ID}...")
    
    # Main Loop
    while True:
        try:
            # 1. INGEST: Read Gmail, AI Generate, Push to DB
            await process_emails(db_bridge)
            
            # 2. EXECUTE: Check DB for approved tasks and Send
            print("Checking for approved tasks...")
            approved_tasks = db_bridge.get_approved_tasks()
            
            if approved_tasks:
                print(f"Found {len(approved_tasks)} approved tasks.")
                
            for task in approved_tasks:
                try:
                    print(f"Sending email to {task['sender']}...")
                    gmail.send_reply(
                        to_email=task['sender'],
                        subject="Re: " + task['subject'],
                        body=task['draft_reply'], 
                        thread_id=task['email_id']
                    )
                    # Mark done
                    db_bridge.mark_as_complete(task['id'])
                    print(f"✅ Successfully sent to {task['sender']}")
                    
                except Exception as e:
                    print(f"❌ Failed to send {task['id']}: {e}")

            # Wait for next cycle
            print(f"Sleeping for {Config.CHECK_INTERVAL} minutes...")
            await asyncio.sleep(Config.CHECK_INTERVAL * 60)
            
        except Exception as e:
            print(f"CRITICAL LOOP ERROR: {e}")
            await asyncio.sleep(60) # Wait 1 min before retrying on crash

if __name__ == "__main__":
    try:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main())
    except KeyboardInterrupt:
        print("Shutting down...")