import re

def clean_email_body(text):
    """Removes HTML tags and excessive whitespace"""
    text = re.sub('<[^<]+?>', '', text)
    text = re.sub('\s+', ' ', text).strip()
    return text
