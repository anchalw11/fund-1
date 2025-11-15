#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Use the NEW database credentials
const supabaseUrl = 'https://sjccpdfdhoqjywuitjju.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqY2NwZGZkaG9xanl3dWl0amp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU3NjU5NiwiZXhwIjoyMDc3MTUyNTk2fQ.sxI2LjZfzVvc4YSgTwDEifcRJOpcSsyVmNfqqkpEei0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableSchema() {
  try {
    console.log('🔍 Checking affiliates table schema...');

    // Try to select all columns to see what exists
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error querying affiliates table:', error);
      return;
    }

    console.log('✅ Affiliates table exists!');
    console.log('📊 Sample data:', data);

    // Try to get column information by attempting different column names
    const columnTests = [
      'id',
      'user_id',
      'affiliate_code',
      'referral_code',
      'commission_rate',
      'total_referrals',
      'total_earnings',
      'status',
      'created_at'
    ];

    console.log('\n🔍 Testing column availability:');
    for (const column of columnTests) {
      try {
        const { data: testData, error: testError } = await supabase
          .from('affiliates')
          .select(column)
          .limit(1);

        if (testError) {
          console.log(`❌ ${column}: Not available`);
        } else {
          console.log(`✅ ${column}: Available`);
        }
      } catch (err) {
        console.log(`❌ ${column}: Error - ${err.message}`);
      }
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkTableSchema();
