# ServiceFlow

AI-powered virtual assistant platform for service professionals.

## Project Structure

```
.
├── website/          # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   └── App.jsx       # Main app component
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
│
├── agent/            # Backend Python AI agent
│   ├── services/         # Business logic services
│   │   ├── gmail_service.py
│   │   ├── supabase_service.py
│   │   └── scheduler.py
│   ├── utils/            # Helper utilities
│   ├── main.py           # Entry point
│   └── config.py         # Configuration
│
└── .env              # Environment variables (not in git)
```

## Getting Started

### Website (Frontend)
\`\`\`bash
cd website
npm install
npm run dev
\`\`\`

### Agent (Backend)
\`\`\`bash
cd agent
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
\`\`\`

## Environment Variables

Create a `.env` file in the root:
\`\`\`
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GEMINI_API_KEY=your_gemini_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_key
\`\`\`

## Deployment

- **Frontend**: Deployed on Vercel (auto-deploys from `main` branch)
- **Backend**: Run on server or cloud platform (AWS, GCP, etc.)
