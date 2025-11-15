import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cjjobdopkkbwexfxwosb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqam9iZG9wa2tid2V4Znh3b3NiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExNDQzMywiZXhwIjoyMDc2NjkwNDMzfQ.QbkeN1dZpz0rpilpZ_zv_GxhrMp2BWsHcFl7RADLfZA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const challengeTypes = [
  {
    type_name: 'elite',
    challenge_code: 'ELITE_ROYAL',
    challenge_name: 'Elite Royal',
    display_name: 'Elite Royal',
    description: 'Premium trading challenge with the best profit split and flexible rules',
    phase_count: 2,
    is_active: true,
    profit_split: 90.00,
    max_daily_loss: 5.00,
    max_total_loss: 10.00,
    min_trading_days: 4,
    time_limit_days: null,
    recommended: true,
    icon: 'Crown',
    phase1_profit_target: 8.00,
    phase2_profit_target: 5.00
  },
  {
    type_name: 'standard',
    challenge_code: 'CLASSIC_2STEP',
    challenge_name: 'Classic 2-Step',
    display_name: 'Classic 2-Step',
    description: 'Traditional two-phase evaluation with balanced rules',
    phase_count: 2,
    is_active: true,
    profit_split: 80.00,
    max_daily_loss: 5.00,
    max_total_loss: 10.00,
    min_trading_days: 4,
    time_limit_days: null,
    recommended: true,
    icon: 'Target',
    phase1_profit_target: 8.00,
    phase2_profit_target: 5.00
  },
  {
    type_name: 'rapid',
    challenge_code: 'RAPID_FIRE',
    challenge_name: 'Rapid Fire',
    display_name: 'Rapid Fire',
    description: 'Fast-paced challenge for aggressive traders',
    phase_count: 1,
    is_active: true,
    profit_split: 80.00,
    max_daily_loss: 5.00,
    max_total_loss: 10.00,
    min_trading_days: 0,
    time_limit_days: 30,
    recommended: false,
    icon: 'Zap',
    phase1_profit_target: 10.00,
    phase2_profit_target: null
  },
  {
    type_name: 'professional',
    challenge_code: 'PAYG_2STEP',
    challenge_name: 'Pay-As-You-Go',
    display_name: 'Pay-As-You-Go',
    description: 'Flexible payment plan with monthly installments',
    phase_count: 2,
    is_active: true,
    profit_split: 80.00,
    max_daily_loss: 5.00,
    max_total_loss: 10.00,
    min_trading_days: 4,
    time_limit_days: null,
    recommended: false,
    icon: 'CreditCard',
    phase1_profit_target: 8.00,
    phase2_profit_target: 5.00
  },
  {
    type_name: 'swing',
    challenge_code: 'AGGRESSIVE_2STEP',
    challenge_name: 'Aggressive 2-Step',
    display_name: 'Aggressive 2-Step',
    description: 'Higher targets for experienced traders',
    phase_count: 2,
    is_active: true,
    profit_split: 80.00,
    max_daily_loss: 5.00,
    max_total_loss: 10.00,
    min_trading_days: 4,
    time_limit_days: null,
    recommended: false,
    icon: 'TrendingUp',
    phase1_profit_target: 10.00,
    phase2_profit_target: 5.00
  },
  {
    type_name: 'scaling',
    challenge_code: 'SWING_PRO',
    challenge_name: 'Scaling Plan',
    display_name: 'Scaling Plan',
    description: 'Start small and scale up your account size',
    phase_count: 1,
    is_active: true,
    profit_split: 80.00,
    max_daily_loss: 5.00,
    max_total_loss: 10.00,
    min_trading_days: 0,
    time_limit_days: null,
    recommended: false,
    icon: 'BarChart',
    phase1_profit_target: 10.00,
    phase2_profit_target: null
  }
];

async function seedData() {
  console.log('Seeding challenge types...');
  const { data, error } = await supabase
    .from('challenge_types')
    .upsert(challengeTypes, { onConflict: 'challenge_code' });

  if (error) {
    console.error('Error seeding challenge types:', error);
  } else {
    console.log('Successfully seeded challenge types.');
  }
}

seedData();
