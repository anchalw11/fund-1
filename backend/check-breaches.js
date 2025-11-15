import { supabase, oldSupabase, newSupabase, boltSupabase } from './config/supabase.js';

const databases = [
  { client: supabase, name: 'PRIMARY' },
  { client: newSupabase, name: 'NEW' },
  { client: boltSupabase, name: 'BOLT' },
  { client: oldSupabase, name: 'OLD' },
];

async function checkFailedAndBreachedAccounts(db) {
  console.log(`\\n--- [${db.name}] Checking for Failed/Breached Accounts ---`);
  if (db.name === 'OLD') {
    console.log('Skipping OLD database due to invalid API key.');
    return [];
  }

  const { data, error } = await db.client
    .from('user_challenges')
    .select('trading_account_id, user_id, status, challenge_type, purchase_date')
    .in('status', ['failed', 'breached']);

  if (error) {
    console.error(`Error fetching accounts from ${db.name}:`, error.message);
    return [];
  }

  if (data.length > 0) {
    console.log(`Found ${data.length} failed/breached accounts in ${db.name}:`);
    console.table(data);
  } else {
    console.log(`No failed or breached accounts found in ${db.name}.`);
  }
  return data;
}

async function checkRuleViolations(db) {
  console.log(`\\n--- [${db.name}] Checking for Rule Violations ---`);
  if (db.name === 'OLD') {
    return [];
  }

  const { data, error } = await db.client
    .from('mt5_rule_violations')
    .select('*');

  if (error) {
    // This table might not exist in all DBs, so we'll treat it as a warning.
    console.warn(`Warning fetching rule violations from ${db.name}: ${error.message}`);
    return [];
  }
  
  if (data.length > 0) {
    console.log(`Found ${data.length} rule violations in ${db.name}:`);
    console.table(data);
  } else {
    console.log(`No rule violations found in ${db.name}.`);
  }
  return data;
}

async function checkMonitoringLogs(db) {
    console.log(`\\n--- [${db.name}] Checking Monitoring Logs for Errors ---`);
    if (db.name === 'OLD') {
        return [];
    }

    const { data, error } = await db.client
        .from('mt5_monitoring_logs')
        .select('*')
        .eq('log_level', 'error');

    if (error) {
        console.warn(`Warning fetching monitoring logs from ${db.name}: ${error.message}`);
        return [];
    }

    if (data.length > 0) {
        console.log(`Found ${data.length} error logs in ${db.name}:`);
        console.table(data);
    } else {
        console.log(`No error logs found in ${db.name}.`);
    }
    return data;
}


async function runAllChecks() {
  let totalBreached = 0;
  let totalViolations = 0;
  let totalErrors = 0;

  for (const db of databases) {
    const breached = await checkFailedAndBreachedAccounts(db);
    const violations = await checkRuleViolations(db);
    const errors = await checkMonitoringLogs(db);
    totalBreached += breached.length;
    totalViolations += violations.length;
    totalErrors += errors.length;
  }

  console.log('\\n--- Breach Check Summary ---');
  console.log(`Total Failed/Breached Accounts: ${totalBreached}`);
  console.log(`Total Rule Violations: ${totalViolations}`);
  console.log(`Total Monitoring Errors: ${totalErrors}`);

  if (totalBreached === 0 && totalViolations === 0 && totalErrors === 0) {
    console.log('\\n✅ All systems clear. No breaches or critical errors found.');
  } else {
    console.log('\\n⚠️ Issues detected. Please review the logs above.');
  }
}

runAllChecks();
