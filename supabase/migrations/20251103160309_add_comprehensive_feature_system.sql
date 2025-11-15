/*
  # Comprehensive Feature System Implementation

  1. New Tables
    - `user_badges` - Track user achievements and badges
    - `mini_challenges` - Free demo challenges
    - `second_chance_offers` - Retry and extension tracking
    - `email_sequences` - Automated email campaigns
    - `exit_intent_offers` - Capture abandonment data
    - `subscription_plans` - Monthly subscription management
    - `promotional_offers` - Buy 2 Get 1 Free tracking
    - `affiliate_referrals` - Track referral conversions
    - `affiliate_payouts` - Track affiliate payments

  2. Updates
    - Enhance affiliates table with tier system
    - Add badge columns to user_profile
    - Add subscription fields to user_challenges

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- ============================================================
-- BADGES SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type text NOT NULL CHECK (badge_type IN (
    'speed_demon_3day',
    'fast_passer_30day',
    'payout_starter',
    'payout_achiever', 
    'payout_master',
    'payout_legend'
  )),
  badge_tier text NOT NULL CHECK (badge_tier IN ('normal', 'good', 'premium')),
  earned_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}',
  UNIQUE(user_id, badge_type)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can view all badges for leaderboard"
  ON user_badges FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- MINI CHALLENGES SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS mini_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_size numeric DEFAULT 2000,
  duration_days integer DEFAULT 7,
  profit_target numeric DEFAULT 100,
  daily_loss_limit numeric DEFAULT 100,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  current_balance numeric DEFAULT 2000,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  discount_code text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mini_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mini challenges"
  ON mini_challenges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create mini challenges"
  ON mini_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SECOND CHANCE SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS second_chance_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id uuid,
  offer_type text NOT NULL CHECK (offer_type IN (
    'near_miss_retry',
    'progress_preservation',
    'time_extension',
    'free_retry'
  )),
  discount_percentage numeric DEFAULT 50,
  expiry_date timestamptz,
  used boolean DEFAULT false,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE second_chance_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own second chance offers"
  ON second_chance_offers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- EMAIL SEQUENCES SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sequence_type text NOT NULL CHECK (sequence_type IN (
    'welcome',
    'during_challenge',
    'post_failure',
    'post_success',
    're_engagement'
  )),
  email_number integer NOT NULL,
  sent_at timestamptz DEFAULT now(),
  opened boolean DEFAULT false,
  clicked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage email sequences"
  ON email_sequences FOR ALL
  TO authenticated
  USING (true);

-- ============================================================
-- EXIT INTENT SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS exit_intent_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  page_url text NOT NULL,
  offer_type text NOT NULL CHECK (offer_type IN (
    'discount',
    'consultation',
    'quiz',
    'lead_magnet'
  )),
  shown_at timestamptz DEFAULT now(),
  accepted boolean DEFAULT false,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exit_intent_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exit offers"
  ON exit_intent_offers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can create exit offers"
  ON exit_intent_offers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- SUBSCRIPTION PLANS SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('classic', 'rapid_fire', 'vip')),
  account_size numeric NOT NULL,
  monthly_price numeric NOT NULL,
  billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly')),
  unlimited_retries boolean DEFAULT true,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  started_at timestamptz DEFAULT now(),
  next_billing_date timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create subscriptions"
  ON subscription_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PROMOTIONAL OFFERS SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS promotional_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  offer_type text NOT NULL CHECK (offer_type IN ('buy2get1', 'discount', 'bundle')),
  challenge_ids uuid[] DEFAULT '{}',
  discount_amount numeric DEFAULT 0,
  free_challenge_id uuid,
  status text DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE promotional_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own promotional offers"
  ON promotional_offers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- AFFILIATE SYSTEM ENHANCEMENTS
-- ============================================================

-- Add tier tracking to affiliates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'affiliates' AND column_name = 'tier'
  ) THEN
    ALTER TABLE affiliates ADD COLUMN tier text DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'affiliates' AND column_name = 'available_balance'
  ) THEN
    ALTER TABLE affiliates ADD COLUMN available_balance numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'affiliates' AND column_name = 'pending_balance'
  ) THEN
    ALTER TABLE affiliates ADD COLUMN pending_balance numeric DEFAULT 0;
  END IF;
END $$;

-- Affiliate Referrals Table
CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_amount numeric DEFAULT 0,
  commission_amount numeric DEFAULT 0,
  commission_rate numeric DEFAULT 10,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  paid_at timestamptz
);

ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own referrals"
  ON affiliate_referrals FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- Affiliate Payouts Table
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_method text,
  payment_details jsonb DEFAULT '{}',
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates can view own payouts"
  ON affiliate_payouts FOR SELECT
  TO authenticated
  USING (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Affiliates can request payouts"
  ON affiliate_payouts FOR INSERT
  TO authenticated
  WITH CHECK (
    affiliate_id IN (
      SELECT id FROM affiliates WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  v_code text;
  v_exists boolean;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    v_code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM affiliates WHERE referral_code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$;

-- Function to award badges
CREATE OR REPLACE FUNCTION award_badge(
  p_user_id uuid,
  p_badge_type text,
  p_badge_tier text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_badge_id uuid;
BEGIN
  INSERT INTO user_badges (user_id, badge_type, badge_tier)
  VALUES (p_user_id, p_badge_type, p_badge_tier)
  ON CONFLICT (user_id, badge_type) DO NOTHING
  RETURNING id INTO v_badge_id;
  
  RETURN json_build_object('success', true, 'badge_id', v_badge_id);
END;
$$;

GRANT EXECUTE ON FUNCTION award_badge(uuid, text, text) TO authenticated;

-- Function to update affiliate commission based on referrals
CREATE OR REPLACE FUNCTION update_affiliate_tier()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_referrals integer;
  v_new_tier text;
  v_new_rate numeric;
BEGIN
  -- Count total approved referrals
  SELECT COUNT(*) INTO v_total_referrals
  FROM affiliate_referrals
  WHERE affiliate_id = NEW.affiliate_id AND status = 'approved';
  
  -- Determine new tier and rate
  IF v_total_referrals >= 50 THEN
    v_new_tier := 'platinum';
    v_new_rate := 20;
  ELSIF v_total_referrals >= 25 THEN
    v_new_tier := 'gold';
    v_new_rate := 15;
  ELSIF v_total_referrals >= 10 THEN
    v_new_tier := 'silver';
    v_new_rate := 12;
  ELSE
    v_new_tier := 'bronze';
    v_new_rate := 10;
  END IF;
  
  -- Update affiliate tier and commission rate
  UPDATE affiliates
  SET 
    tier = v_new_tier,
    commission_rate = v_new_rate,
    total_referrals = v_total_referrals
  WHERE id = NEW.affiliate_id;
  
  RETURN NEW;
END;
$$;

-- Trigger to update affiliate tier on new referral
DROP TRIGGER IF EXISTS update_affiliate_tier_trigger ON affiliate_referrals;
CREATE TRIGGER update_affiliate_tier_trigger
AFTER INSERT OR UPDATE ON affiliate_referrals
FOR EACH ROW
WHEN (NEW.status = 'approved')
EXECUTE FUNCTION update_affiliate_tier();

GRANT EXECUTE ON FUNCTION generate_referral_code() TO authenticated;
GRANT EXECUTE ON FUNCTION update_affiliate_tier() TO authenticated;
