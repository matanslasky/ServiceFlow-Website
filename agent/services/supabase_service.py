from supabase import create_client, Client
from config import Config

class SupabaseService:
    def __init__(self):
        self.supabase: Client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

    def get_active_users(self):
        """Get all users who have email_secretary agent enabled"""
        try:
            response = self.supabase.table("agent_settings").select("user_id, active_agents").execute()
            active_users = [
                row['user_id'] for row in response.data 
                if row.get('active_agents') and 'email_secretary' in row['active_agents']
            ]
            print(f"Found {len(active_users)} active users with email_secretary enabled")
            return active_users
        except Exception as e:
            print(f"Error fetching active users: {e}")
            return []

    def post_draft_for_approval(self, user_id, email_id, sender, subject, draft_text, original_snippet):
        """Pushes a generated draft to the website database"""
        data = {
            "user_id": user_id,
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
        except Exception as e:
            print(f"❌ Error pushing to Supabase: {e}")

    def get_approved_tasks(self, user_id):
        """Fetches tasks the user approved in the website"""
        try:
            response = self.supabase.table("email_drafts").select("*")\
                .eq("user_id", user_id)\
                .eq("status", "approved")\
                .execute()
            return response.data
        except Exception as e:
            print(f"Error fetching approvals: {e}")
            return []

    def mark_as_complete(self, row_id):
        """Marks task as done so it doesn't get sent twice"""
        self.supabase.table("email_drafts").update({"status": "sent"}).eq("id", row_id).execute()