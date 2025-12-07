# AI Secretary for Benjamin ENT Clinic

An automated AI agent that reads Gmail, classifies medical vs. non-medical emails, drafts professional replies (using GPT-4), and sends them to Dr. Elliot Benjamin via Telegram for one-click approval.

## ⚡ Features
- **Zero Medical Advice:** Automatically flags medical questions and drafts a "Doctor will review" response.
- **Privacy Guard:** Regex and AI checks to prevent leaking internal schedules.
- **Human-in-the-Loop:** Nothing is sent without Dr. Benjamin's click in Telegram.
- **Google Calendar Aware:** Checks availability before drafting scheduling replies.

## 🛠 Setup
1. Install dependencies: `pip install -r requirements.txt`
2. Rename `.env.example` to `.env` and add your API keys.
3. Add `credentials.json` from Google Cloud.
4. Run `python main.py`.
