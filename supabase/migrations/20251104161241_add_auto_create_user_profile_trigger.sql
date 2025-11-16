/*
  # Auto-create User Profile on Signup

  1. Changes
    - Creates a trigger function to automatically create user_profile records
    - Creates trigger on auth.users to auto-populate user_profile
    - Generates friendly_id automatically with format "USER-XXXXX"
    - Backfills existing users who don't have profiles

  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only creates profile if it doesn't exist
*/

-- Function to generate friendly ID (simplified to avoid potential issues)
CREATE OR REPLACE FUNCTION generate_friendly_id()
RETURNS TEXT AS $$
BEGIN
  -- Simple approach: use timestamp-based ID to avoid conflicts
  RETURN 'USER-' || EXTRACT(epoch FROM NOW())::TEXT || '-' || (RANDOM() * 1000)::INT::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-create user profile (simplified and more robust)
CREATE OR REPLACE FUNCTION auto_create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if profile doesn't exist
  IF NOT EXISTS (SELECT 1 FROM user_profile WHERE user_id = NEW.id) THEN
    INSERT INTO user_profile (
      user_id,
      email,
      friendly_id,
      email_verified,
      status,
      created_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      generate_friendly_id(),
      COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
      'active',
      NOW()
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_user_profile();

-- Backfill existing users who don't have profiles
INSERT INTO user_profile (user_id, email, friendly_id, email_verified, status, created_at)
SELECT
  u.id,
  u.email,
  generate_friendly_id(),
  COALESCE(u.email_confirmed_at IS NOT NULL, false),
  'active',
  COALESCE(u.created_at, NOW())
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_profile up WHERE up.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

/*
  # Email Log Table

  Creates the email_log table for tracking email delivery
*/

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
