#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Use the NEW database credentials
const supabaseUrl = 'https://sjccpdfdhoqjywuitjju.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqY2NwZGZkaG9xanl3dWl0amp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU3NjU5NiwiZXhwIjoyMDc3MTUyNTk2fQ.sxI2LjZfzVvc4YSgTwDEifcRJOpcSsyVmNfqqkpEei0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAffiliatesTable() {
  try {
    console.log('🚀 Creating affiliates table in NEW database...');

    // First, try to create a test affiliate to see if the table exists
    console.log('📋 Checking if affiliates table exists...');

    const { data: existing, error: checkError } = await supabase
      .from('affiliates')
      .select('id')
      .limit(1);

    if (checkError && checkError.message.includes('does not exist')) {
      console.log('📝 Affiliates table does not exist, creating it...');

      // Since we can't execute raw SQL easily, let's try to create the table by attempting operations that will fail gracefully
      // Actually, let me try a different approach - use the REST API directly

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS affiliates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          affiliate_code TEXT UNIQUE NOT NULL,
          commission_rate NUMERIC(5,2) DEFAULT 10.00,
          total_referrals INTEGER DEFAULT 0,
          total_earnings NUMERIC(10,2) DEFAULT 0,
          available_balance NUMERIC(10,2) DEFAULT 0,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      // Try to execute via fetch to the database REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ query: createTableSQL })
      });

      if (!response.ok) {
        console.log('⚠️ Direct SQL execution failed, trying alternative method...');

        // Alternative: Try to create the table by inserting a dummy record and see if it works
        // This won't work for table creation, but let's try a different approach

        console.log('🔄 Trying to create table via Supabase dashboard SQL editor...');
        console.log('📋 Please run the following SQL in your Supabase dashboard:');
        console.log('');
        console.log(createTableSQL);
        console.log('');
        console.log('Then run this script again.');
        return;
      }

      const result = await response.json();
      console.log('✅ Table creation result:', result);

    } else if (checkError) {
      console.error('❌ Error checking table:', checkError);
      return;
    } else {
      console.log('✅ Affiliates table already exists!');
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

createAffiliatesTable();
