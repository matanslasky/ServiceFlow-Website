import openai
import os
from config import Config
import json

client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)

def load_prompt(filename):
    path = os.path.join(Config.PROMPTS_DIR, filename)
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

class AIService:
    @staticmethod
    def classify_email(body):
        system_prompt = load_prompt('classifier_prompt.txt')
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using cost-effective model
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": body}
            ],
            temperature=0
        )
        return response.choices[0].message.content.strip().lower()

    @staticmethod
    def generate_draft(sender, body, calendar_info="Unknown", business_name=None, professional_name=None):
        system_prompt = load_prompt('draft_prompt.txt')
        
        # Use provided names or fall back to config defaults
        if business_name is None:
            business_name = Config.BUSINESS_NAME
        if professional_name is None:
            professional_name = Config.PROFESSIONAL_NAME
            
        user_content = system_prompt.format(
            sender_name=sender,
            email_body=body,
            calendar_info=calendar_info,
            business_name=business_name,
            professional_name=professional_name
        )
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": user_content}],
            temperature=0.7
        )
        return response.choices[0].message.content

    @staticmethod
    def check_safety(draft):
        system_prompt = load_prompt('safety_prompt.txt')
        user_content = system_prompt.format(draft_text=draft)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": user_content}],
            temperature=0,
            response_format={"type": "json_object"}
        )
        
        return json.loads(response.choices[0].message.content)
