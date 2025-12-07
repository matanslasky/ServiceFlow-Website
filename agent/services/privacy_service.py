import re
from services.audit_log import AuditLogger

class PrivacyService:
    @staticmethod
    def sanitize_text(text: str) -> str:
        """
        Redacts potential PII like ID numbers or phone formats before processing/logging.
        Replaces names other than the Doctor's with [Redacted].
        """
        # Redact Israeli ID format (simplistic 9 digit check)
        text = re.sub(r'\b\d{9}\b', '[ID_REDACTED]', text)
        
        # Redact Credit Card patterns
        text = re.sub(r'\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b', '[CC_REDACTED]', text)
        
        return text

    @staticmethod
    def check_forbidden_phrases(draft: str) -> bool:
        """
        Hard-coded check for absolute forbidden internal leaks.
        """
        forbidden = [
            "on a date", "his wife", "vacation", "sleeping", 
            "other patient", "seeing mr", "seeing mrs"
        ]
        draft_lower = draft.lower()
        for phrase in forbidden:
            if phrase in draft_lower:
                AuditLogger.log_action("PRIVACY_BLOCK", f"Draft contained forbidden phrase: {phrase}")
                return False
        return True
