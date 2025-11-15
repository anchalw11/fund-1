-- Create email_log table for tracking email delivery

-- Email log table
CREATE TABLE IF NOT EXISTS email_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES user_profile(user_id) ON DELETE CASCADE,
    challenge_id uuid REFERENCES user_challenges(id) ON DELETE CASCADE,
    email_type TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    subject TEXT,
    status TEXT DEFAULT 'sent',
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_log_user_email ON email_log(user_id, recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_sent_at ON email_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_email_type ON email_log(email_type);

-- Enable RLS
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own email logs" ON email_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public can insert email logs" ON email_log FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
