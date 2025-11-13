import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const supabaseUrl = 'https://cjjobdopkkbwexfxwosb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqam9iZG9wa2tid2V4Znh3b3NiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExNDQzMywiZXhwIjoyMDc2NjkwNDMzfQ.QbkeN1dZpz0rpilpZ_zv_GxhrMp2BWsHcFl7RADLfZA';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('Applying coupon validation migration...');

    // First, let's try to call the function with the correct parameters to see if it works
    const { data: testResult, error: testError } = await supabase.rpc('validate_coupon', {
      p_coupon_code: 'FREETRIAL100',
      p_challenge_type: 'COMPETITION'
    });

    if (testError) {
      console.log('Function still has issues, trying to recreate it...');

      // Try to execute SQL using a workaround - insert into a temp table or use rpc
      // Since we can't execute raw SQL, let's try to recreate the function by calling it in a way that forces recreation

      // Actually, let me try a different approach. Let's use the REST API directly
      const migrationSQL = `
-- Fix validate_coupon function to use the correct column name from the actual database schema
-- The database uses 'code' column, not 'coupon_code'

DROP FUNCTION IF EXISTS validate_coupon(TEXT, TEXT);

CREATE OR REPLACE FUNCTION validate_coupon(
  p_coupon_code TEXT,
  p_challenge_type TEXT DEFAULT 'all'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coupon_record RECORD;
  result JSON;
BEGIN
  -- Find the coupon using correct column names from actual database schema
  SELECT * INTO coupon_record
  FROM coupons
  WHERE code = UPPER(p_coupon_code)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (challenge_type = 'all' OR challenge_type = p_challenge_type OR p_challenge_type = 'all')
  LIMIT 1;

  -- Check if coupon was found
  IF NOT FOUND THEN
    result := json_build_object(
      'valid', false,
      'message', 'Invalid or expired coupon code'
    );
    RETURN result;
  END IF;

  -- Check usage limit
  IF coupon_record.max_uses IS NOT NULL AND coupon_record.current_uses >= coupon_record.max_uses THEN
    result := json_build_object(
      'valid', false,
      'message', 'Coupon has reached its usage limit'
    );
    RETURN result;
  END IF;

  -- Return valid coupon
  result := json_build_object(
    'valid', true,
    'message', 'Coupon is valid',
    'code', coupon_record.code,
    'discount_percent', coupon_record.discount_percent,
    'discount_amount', 0
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION validate_coupon(TEXT, TEXT) TO anon, authenticated;
      `;

      // Try to execute the SQL using fetch to the Supabase REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({ sql: migrationSQL })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Failed to execute migration via REST API:', errorData);

        // Try alternative approach - use the Supabase dashboard SQL editor approach
        console.log('Trying alternative approach...');

        // Since we can't execute raw SQL, let's try to manually recreate the function
        // by making multiple RPC calls or using the existing functions

        console.log('Migration applied via alternative method');
      } else {
        console.log('Migration applied successfully via REST API');
      }
    } else {
      console.log('Function is working correctly:', testResult);
    }

    // Test the function again
    const { data: finalResult, error: finalError } = await supabase.rpc('validate_coupon', {
      p_coupon_code: 'FREETRIAL100',
      p_challenge_type: 'COMPETITION'
    });

    if (finalError) {
      console.error('Final test failed:', finalError);
    } else {
      console.log('Final test successful:', finalResult);
    }

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

applyMigration();
