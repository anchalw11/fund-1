-- ============================================================
-- INSERT CHALLENGE TYPES DATA
-- Run this in your production Supabase SQL Editor
-- ============================================================
-- URL: https://supabase.com/dashboard/project/cjjobdopkkbwexfxwosb/sql/new
-- ============================================================

-- First, ensure RLS allows public read access
DROP POLICY IF EXISTS "Public can view challenge types" ON challenge_types;
DROP POLICY IF EXISTS "challenge_types_select_public" ON challenge_types;

ALTER TABLE challenge_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "challenge_types_public_read"
  ON challenge_types
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert challenge types (with conflict handling)
INSERT INTO challenge_types (
  type_name,
  challenge_code,
  challenge_name,
  display_name,
  description,
  phase_count,
  is_active,
  profit_split,
  max_daily_loss,
  max_total_loss,
  min_trading_days,
  time_limit_days,
  recommended,
  icon,
  color,
  phase1_profit_target,
  phase2_profit_target
) VALUES
(
  'elite',
  'ELITE_ROYAL',
  'Elite Royal',
  'Elite Royal',
  'Premium trading challenge with the best profit split and flexible rules',
  2,
  true,
  90.00,
  5.00,
  10.00,
  4,
  NULL,
  true,
  'Crown',
  'purple',
  8.00,
  5.00
),
(
  'standard',
  'CLASSIC_2STEP',
  'Classic 2-Step',
  'Classic 2-Step',
  'Traditional two-phase evaluation with balanced rules',
  2,
  true,
  80.00,
  5.00,
  10.00,
  4,
  NULL,
  true,
  'Target',
  'blue',
  8.00,
  5.00
),
(
  'rapid',
  'RAPID_FIRE',
  'Rapid Fire',
  'Rapid Fire',
  'Fast-paced challenge for aggressive traders',
  1,
  true,
  80.00,
  5.00,
  10.00,
  0,
  30,
  false,
  'Zap',
  'orange',
  10.00,
  NULL
),
(
  'professional',
  'PAYG_2STEP',
  'Pay-As-You-Go',
  'Pay-As-You-Go',
  'Flexible payment plan with monthly installments',
  2,
  true,
  80.00,
  5.00,
  10.00,
  4,
  NULL,
  false,
  'CreditCard',
  'green',
  8.00,
  5.00
),
(
  'swing',
  'AGGRESSIVE_2STEP',
  'Aggressive 2-Step',
  'Aggressive 2-Step',
  'Higher targets for experienced traders',
  2,
  true,
  80.00,
  5.00,
  10.00,
  4,
  NULL,
  false,
  'TrendingUp',
  'red',
  10.00,
  5.00
),
(
  'scaling',
  'SWING_PRO',
  'Scaling Plan',
  'Scaling Plan',
  'Start small and scale up your account size',
  1,
  true,
  80.00,
  5.00,
  10.00,
  0,
  NULL,
  false,
  'BarChart',
  'teal',
  10.00,
  NULL
)
ON CONFLICT (challenge_code) DO UPDATE SET
  type_name = EXCLUDED.type_name,
  challenge_name = EXCLUDED.challenge_name,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Verify insertion
SELECT 
  type_name,
  challenge_code,
  display_name,
  is_active
FROM challenge_types
ORDER BY type_name;

SELECT 'SUCCESS! Challenge types inserted. Try the payment flow again.' as result;
