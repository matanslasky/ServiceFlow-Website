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
            "original_snippet": original_snippet,
            "draft_reply": draft_text,
            "status": "PENDING",
            "type": "email_reply"
        }
        try:
            self.supabase.table("agent_queue").insert(data).execute()
            print(f"Draft for {sender} pushed to Supabase queue.")
        except Exception as e:
            print(f"Error pushing to Supabase: {e}")

    def get_approved_tasks(self):
        """Fetches tasks the user approved in the website"""
        try:
            response = self.supabase.table("agent_queue").select("*")\
                .eq("user_id", Config.TARGET_USER_ID)\
                .eq("status", "APPROVED")\
                .execute()
            return response.data
        except Exception as e:
            print(f"Error fetching approvals: {e}")
            return []

    def mark_as_complete(self, row_id):
        """Marks task as done so it doesn't get sent twice"""
        self.supabase.table("agent_queue").update({"status": "COMPLETED"}).eq("id", row_id).execute()