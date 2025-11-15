-- Competition System Tables Migration

-- 1. Create competition_user_details table
CREATE TABLE IF NOT EXISTS competition_user_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Social Media Links
  instagram_url TEXT,
  twitter_url TEXT,
  youtube_url TEXT,
  tiktok_url TEXT,
  
  -- Proof Screenshots
  screenshot_urls TEXT[] DEFAULT '{}',
  screenshots_verified BOOLEAN DEFAULT false,
  
  -- Video Introduction
  video_url TEXT,
  video_transcript TEXT,
  has_video BOOLEAN DEFAULT false,
  
  -- Written Introduction (if no video)
  written_intro TEXT,
  
  -- Metadata
  submission_date TIMESTAMPTZ DEFAULT NOW(),
  approved BOOLEAN DEFAULT false,
  admin_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create competition_contracts table
CREATE TABLE IF NOT EXISTS competition_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contract Details
  contract_version TEXT NOT NULL DEFAULT 'v2.0',
  contract_text TEXT NOT NULL,
  
  -- Signature Information
  signed_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  
  -- User Information at Time of Signing
  user_full_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  
  -- Verification
  signature_hash TEXT,
  is_valid BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, contract_version)
);

-- 3. Add has_addon column to challenges table
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS has_addon BOOLEAN DEFAULT false;

ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS addon_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS total_tries INTEGER DEFAULT 1;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_competition_user_details_user_id 
ON competition_user_details(user_id);

CREATE INDEX IF NOT EXISTS idx_competition_user_details_approved 
ON competition_user_details(approved);

CREATE INDEX IF NOT EXISTS idx_competition_contracts_user_id 
ON competition_contracts(user_id);

CREATE INDEX IF NOT EXISTS idx_competition_contracts_signed_at 
ON competition_contracts(signed_at);

CREATE INDEX IF NOT EXISTS idx_challenges_has_addon 
ON challenges(has_addon);

-- 5. Create RLS policies
ALTER TABLE competition_user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_contracts ENABLE ROW LEVEL SECURITY;

-- Users can read their own details
CREATE POLICY "Users can view own competition details"
ON competition_user_details FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own details
CREATE POLICY "Users can insert own competition details"
ON competition_user_details FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own details
CREATE POLICY "Users can update own competition details"
ON competition_user_details FOR UPDATE
USING (auth.uid() = user_id);

-- Users can view their own contracts
CREATE POLICY "Users can view own contracts"
ON competition_contracts FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own contracts
CREATE POLICY "Users can insert own contracts"
ON competition_contracts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admin policies (assuming there's an admin role)
CREATE POLICY "Admins can view all competition details"
ON competition_user_details FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update all competition details"
ON competition_user_details FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can view all contracts"
ON competition_contracts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- 6. Create functions for competition statistics
CREATE OR REPLACE FUNCTION get_competition_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_participants', (SELECT COUNT(*) FROM competition_user_details),
    'approved_participants', (SELECT COUNT(*) FROM competition_user_details WHERE approved = true),
    'pending_approval', (SELECT COUNT(*) FROM competition_user_details WHERE approved = false),
    'with_video', (SELECT COUNT(*) FROM competition_user_details WHERE has_video = true),
    'contracts_signed', (SELECT COUNT(*) FROM competition_contracts),
    'addon_purchases', (SELECT COUNT(*) FROM challenges WHERE has_addon = true),
    'total_addon_revenue', (SELECT COALESCE(SUM(addon_amount), 0) FROM challenges WHERE has_addon = true)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create view for admin dashboard
CREATE OR REPLACE VIEW competition_user_profiles_view AS
SELECT 
  cud.id,
  cud.user_id,
  up.email,
  up.first_name,
  up.last_name,
  cud.instagram_url,
  cud.twitter_url,
  cud.youtube_url,
  cud.tiktok_url,
  cud.screenshot_urls,
  cud.screenshots_verified,
  cud.video_url,
  cud.has_video,
  cud.written_intro,
  cud.submission_date,
  cud.approved,
  cud.admin_notes,
  cc.signed_at as contract_signed_at,
  c.has_addon,
  c.addon_amount,
  c.total_tries,
  c.challenge_type,
  c.account_size,
  c.status as challenge_status,
  c.created_at as registration_date
FROM competition_user_details cud
LEFT JOIN user_profiles up ON cud.user_id = up.id
LEFT JOIN competition_contracts cc ON cud.user_id = cc.user_id
LEFT JOIN challenges c ON cud.user_id = c.user_id
ORDER BY cud.submission_date DESC;

-- Grant access to the view
GRANT SELECT ON competition_user_profiles_view TO authenticated;

-- 8. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_competition_user_details_updated_at
BEFORE UPDATE ON competition_user_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 9. Add comments for documentation
COMMENT ON TABLE competition_user_details IS 'Stores competition participant details including social media links and proof submissions';
COMMENT ON TABLE competition_contracts IS 'Stores signed competition contracts with signature verification';
COMMENT ON COLUMN challenges.has_addon IS 'Whether user purchased the $5 add-on for 2 tries';
COMMENT ON COLUMN challenges.addon_amount IS 'Amount paid for add-on (typically $5)';
COMMENT ON COLUMN challenges.total_tries IS 'Total number of competition attempts allowed (1 or 2)';
