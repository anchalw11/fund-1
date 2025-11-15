const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkChallenges() {
  console.log('🔍 Checking user_challenges table...');

  try {
    // Check total challenges
    const { data: allChallenges, error: allError } = await supabase
      .from('user_challenges')
      .select('id, user_id, status, trading_account_id, purchase_date, challenge_type_id')
      .order('purchase_date', { ascending: false })
      .limit(20);

    if (allError) {
      console.error('❌ Error fetching challenges:', allError.message);
      return;
    }

    console.log('📊 Recent challenges:');
    console.table(allChallenges.map(c => ({
      id: c.id.slice(0, 8),
      user_id: c.user_id.slice(0, 8),
      status: c.status,
      has_mt5: !!c.trading_account_id,
      purchase_date: c.purchase_date ? new Date(c.purchase_date).toLocaleDateString() : 'N/A'
    })));

    // Check pending challenges (no trading_account_id and not pending_payment)
    const { data: pendingChallenges, error: pendingError } = await supabase
      .from('user_challenges')
      .select('id, user_id, status, trading_account_id, purchase_date')
      .is('trading_account_id', null)
      .neq('status', 'pending_payment')
      .order('purchase_date', { ascending: false });

    if (pendingError) {
      console.error('❌ Error fetching pending challenges:', pendingError.message);
      return;
    }

    console.log('⏳ Pending challenges (need MT5 credentials):', pendingChallenges.length);
    if (pendingChallenges.length > 0) {
      console.table(pendingChallenges.map(c => ({
        id: c.id.slice(0, 8),
        user_id: c.user_id.slice(0, 8),
        status: c.status,
        purchase_date: c.purchase_date ? new Date(c.purchase_date).toLocaleDateString() : 'N/A'
      })));
    }

    // Check challenges with credentials
    const { data: withCredentials, error: credError } = await supabase
      .from('user_challenges')
      .select('id, user_id, status, trading_account_id, purchase_date')
      .not('trading_account_id', 'is', null)
      .order('purchase_date', { ascending: false });

    if (credError) {
      console.error('❌ Error fetching challenges with credentials:', credError.message);
      return;
    }

    console.log('✅ Challenges with MT5 credentials:', withCredentials.length);
    if (withCredentials.length > 0) {
      console.table(withCredentials.slice(0, 10).map(c => ({
        id: c.id.slice(0, 8),
        user_id: c.user_id.slice(0, 8),
        status: c.status,
        mt5_login: c.trading_account_id,
        purchase_date: c.purchase_date ? new Date(c.purchase_date).toLocaleDateString() : 'N/A'
      })));
    }

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

checkChallenges();
