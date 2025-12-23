# AI Assistant Agent

An automated AI agent that reads Gmail, classifies sensitive vs. general emails, drafts professional replies (using GPT-4), and sends them for approval via your preferred notification method.

## ⚡ Features
- **Smart Classification:** Automatically flags sensitive matters requiring professional review.
- **Privacy Guard:** Regex and AI checks to prevent leaking internal schedules or sensitive information.
- **Human-in-the-Loop:** Nothing is sent without your explicit approval.
- **Google Calendar Aware:** Checks availability before drafting scheduling replies.

## 🛠 Setup
1. Install dependencies: `pip install -r requirements.txt`
2. Rename `.env.example` to `.env` and add your API keys.
3. Add `credentials.json` from Google Cloud.
4. Run `python main.py`.
