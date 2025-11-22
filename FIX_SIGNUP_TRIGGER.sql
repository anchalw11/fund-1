-- RUN THIS IN: https://supabase.com/dashboard/project/cjjobdopkkbwexfxwosb/sql/new

-- ============================================================
-- FIX SIGNUP TRIGGER FUNCTION - RUN THIS SQL IN SUPABASE
-- ============================================================

-- Function to generate friendly ID
CREATE OR REPLACE FUNCTION generate_friendly_id()
RETURNS TEXT AS $$
BEGIN
  -- Simple approach: use timestamp-based ID to avoid conflicts
  RETURN 'USER-' || EXTRACT(epoch FROM NOW())::TEXT || '-' || (RANDOM() * 1000)::INT::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-create user profile (updated to include all required fields)
CREATE OR REPLACE FUNCTION auto_create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if profile doesn't exist
  IF NOT EXISTS (SELECT 1 FROM user_profile WHERE user_id = NEW.id) THEN
    INSERT INTO user_profile (
      user_id,
      email,
      first_name,
      last_name,
      friendly_id,
      email_verified,
      status,
      kyc_status,
      created_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      generate_friendly_id(),
      COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
      'active',
      'pending',
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
INSERT INTO user_profile (user_id, email, friendly_id, email_verified, status, kyc_status, created_at)
SELECT
  u.id,
  u.email,
  generate_friendly_id(),
  COALESCE(u.email_confirmed_at IS NOT NULL, false),
  'active',
  'pending',
  COALESCE(u.created_at, NOW())
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_profile up WHERE up.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;

