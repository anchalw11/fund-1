
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sjccpdfdhoqjywuitjju.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqY2NwZGZkaG9xanl3dWl0amp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU3NjU5NiwiZXhwIjoyMDc3MTUyNTk2fQ.sxI2LjZfzVvc4YSgTwDEifcRJOpcSsyVmNfqqkpEei0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const accountNumbers = [
  105114748,
  105114794,
  105114803,
  105114840,
  105114847,
  105114855
];

async function checkSpecificAccounts() {
  for (const accountNumber of accountNumbers) {
    console.log(`\\n--- Checking account: ${accountNumber} ---`);

    const { data: account, error: accountError } = await supabase
      .from('mt5_accounts')
      .select('*')
      .eq('account_number', accountNumber)
      .single();

    if (accountError || !account) {
      console.log(`Account ${accountNumber} not found.`);
      continue;
    }

    console.log(`Account Status: ${account.status}`);
    if (account.status === 'failed') {
      console.log(`Failure Reason: ${account.failure_reason}`);
    }

    const { data: violations, error: violationsError } = await supabase
      .from('mt5_rule_violations')
      .select('*')
      .eq('mt5_account_id', account.id);

    if (violationsError) {
      console.error(`Error fetching violations for account ${accountNumber}:`, violationsError);
      continue;
    }

    if (violations.length === 0) {
      console.log('No rule violations found for this account.');
    } else {
      console.log('Found rule violations:');
      console.table(violations);
    }
  }
}

checkSpecificAccounts();
