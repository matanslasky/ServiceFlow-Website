-- ServiceFlow Database Schema
-- Run these SQL commands in your Supabase SQL Editor

-- 1. Agent Settings Table
CREATE TABLE IF NOT EXISTS agent_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  active_agents TEXT[] DEFAULT ARRAY[]::TEXT[],
  email_draft_mode TEXT DEFAULT 'review_all',
  auto_send_enabled BOOLEAN DEFAULT false,
  business_hours_only BOOLEAN DEFAULT true,
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Enable Row Level Security
ALTER TABLE agent_settings ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can view own agent settings"
  ON agent_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own agent settings"
  ON agent_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agent settings"
  ON agent_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Clients Table (if not exists)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'New Lead',
  next_follow_up TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own clients"
  ON clients FOR ALL
  USING (auth.uid() = user_id);

-- 5. Email Drafts Table
CREATE TABLE IF NOT EXISTS email_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  draft_reply TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own email drafts"
  ON email_drafts FOR ALL
  USING (auth.uid() = user_id);

-- 6. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Apply triggers
CREATE TRIGGER update_agent_settings_updated_at
  BEFORE UPDATE ON agent_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
