-- Add COMPETITION challenge type for competition purchases
-- This allows users to purchase competition entries

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
) VALUES (
  'competition',
  'COMPETITION',
  'Trading Competition',
  'Trading Competition',
  'Enter the trading competition with a chance to win prizes',
  2,
  true,
  80.00,
  5.00,
  10.00,
  4,
  30,
  false,
  'Trophy',
  'gold',
  8.00,
  5.00
)
ON CONFLICT (challenge_code) DO UPDATE SET
  type_name = EXCLUDED.type_name,
  challenge_name = EXCLUDED.challenge_name,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Insert pricing for competition (using a standard $9.99 entry fee)
INSERT INTO challenge_pricing (
  challenge_type,
  challenge_type_id,
  account_size,
  phase_1_price,
  phase_2_price,
  regular_price,
  discount_price,
  platform_cost
) VALUES (
  'competition',
  (SELECT id FROM challenge_types WHERE challenge_code = 'COMPETITION'),
  10000, -- Standard account size for competition
  9.99,  -- Entry fee
  0,     -- No phase 2 for competition
  9.99,  -- Regular price
  9.99,  -- No discount for competition
  2.00   -- Platform cost
)
ON CONFLICT (challenge_type, account_size) DO UPDATE SET
  phase_1_price = EXCLUDED.phase_1_price,
  phase_2_price = EXCLUDED.phase_2_price,
  regular_price = EXCLUDED.regular_price,
  discount_price = EXCLUDED.discount_price,
  platform_cost = EXCLUDED.platform_cost;

-- Verify the competition challenge type was added
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM challenge_types WHERE challenge_code = 'COMPETITION' AND is_active = true) THEN
    RAISE NOTICE 'SUCCESS: COMPETITION challenge type is active!';
  ELSE
    RAISE EXCEPTION 'ERROR: COMPETITION challenge type was not created properly';
  END IF;
END $$;
