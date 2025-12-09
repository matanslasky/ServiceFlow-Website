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
    
    print(f"Multi-User Agent System Started...")
    
    # Main Loop
    while True:
        try:
            # Get all users with email_secretary agent enabled
            active_users = db_bridge.get_active_users()
            
            if not active_users:
                print("No active users found. Sleeping...")
                await asyncio.sleep(Config.CHECK_INTERVAL * 60)
                continue
            
            # Process each user
            for user_id in active_users:
                print(f"\n{'='*60}")
                print(f"Processing user: {user_id}")
                print(f"{'='*60}")
                
                try:
                    # 1. INGEST: Read Gmail, AI Generate, Push to DB
                    await process_emails(db_bridge, user_id)
                    
                    # 2. EXECUTE: Check DB for approved tasks and Send
                    print(f"Checking for approved tasks for user {user_id}...")
                    approved_tasks = db_bridge.get_approved_tasks(user_id)
                    
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
                
                except Exception as e:
                    print(f"❌ Error processing user {user_id}: {e}")
                    continue

            # Wait for next cycle
            print(f"\n{'='*60}")
            print(f"Completed processing {len(active_users)} users. Sleeping for {Config.CHECK_INTERVAL} minutes...")
            print(f"{'='*60}\n")
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