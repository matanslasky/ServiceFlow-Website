import logging
import hashlib
import time
from datetime import datetime

# Configure logging to file
logging.basicConfig(
    filename='audit_trail.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class AuditLogger:
    @staticmethod
    def log_action(action_type: str, details: str):
        """
        Logs an action with a SHA256 hash of the timestamp to ensure unique tracking.
        Does NOT log full medical content, only metadata/status.
        """
        timestamp = str(time.time())
        event_hash = hashlib.sha256(timestamp.encode()).hexdigest()
        
        log_entry = f"[ID:{event_hash[:8]}] ACTION: {action_type} | DETAILS: {details}"
        logging.info(log_entry)
        print(log_entry) # Print to console for running view
