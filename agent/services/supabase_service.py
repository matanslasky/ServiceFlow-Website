from supabase import create_client, Client
from config import Config

class SupabaseService:
    def __init__(self):
        self.supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

    def post_draft_for_approval(self, email_id, sender, subject, draft_text, original_snippet):
        """Pushes a generated draft to the website database"""
        data = {
            "user_id": Config.TARGET_USER_ID,
            "email_id": email_id,
            "sender": sender,
            "subject": subject,
            "body": original_snippet,
            "draft_reply": draft_text,
            "status": "pending"
        }
        try:
            response = self.supabase.table("email_drafts").insert(data).execute()
            print(f"✅ Draft for {sender} pushed to Supabase email_drafts table.")
            print(f"DEBUG: Insert response: {response}")
        except Exception as e:
            print(f"❌ Error pushing to Supabase: {e}")

    def get_approved_tasks(self):
        """Fetches tasks the user approved in the website"""
        try:
            response = self.supabase.table("email_drafts").select("*")\
                .eq("user_id", Config.TARGET_USER_ID)\
                .eq("status", "approved")\
                .execute()
            return response.data
        except Exception as e:
            print(f"Error fetching approvals: {e}")
            return []

    def mark_as_complete(self, row_id):
        """Marks task as done so it doesn't get sent twice"""
        self.supabase.table("email_drafts").update({"status": "sent"}).eq("id", row_id).execute()