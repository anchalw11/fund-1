import MetaApi from 'metaapi.cloud-sdk';
import { supabase, oldSupabase, newSupabase, boltSupabase } from './config/supabase.js';

const token = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiYzQ5N2E0MzFjZGM4ZTE2NWQyODIzNGU5N2YzN2RjZiIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcnBjLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtZXRhc3RhdHMtYXBpIiwibWV0aG9kcyI6WyJtZXRhc3RhdHMtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6InJpc2stbWFuYWdlbWVudC1hcGkiLCJtZXRob2RzIjpbInJpc2stbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoiY29weWZhY3RvcnktYXBpIiwibWV0aG9kcyI6WyJjb3B5ZmFjdG9yeS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibXQtbWFuYWdlci1hcGkiLCJtZXRob2RzIjpbIm10LW1hbmFnZXItYXBpOnJlc3Q6ZGVhbGluZzoqOioiLCJtdC1tYW5hZ2VyLWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJiaWxsaW5nLWFwaSIsIm1ldGhvZHMiOlsiYmlsbGluZy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfV0sImlnbm9yZVJhdGVMaW1pdHMiOmZhbHNlLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiYmM0OTdhNDMxY2RjOGUxNjVkMjgyMzRlOTdmMzdkY2YiLCJpYXQiOjE3NjI1MDcyMTR9.W1EQ8Q1_yTEKaduILI0TNyRVOQiXVQCELkQngO2MkU04ZbxyxwF_BFgpQKwub04nzC3QnZPY5kCLZbii1gmmflbKNEQk6-YqUqKaRoKlAYxYwsnZzjLnxlfOwOJBw2eUgGtehnJHIyhrSM-0MFejq6FGhe9JRi8qERNJRc7G1SNhqxzDhaE8nLu8avAdmKgTa40kZ4tUFiXEynXjYoIXlcrnetXFmuajrptaBBEI0D_TBOJq8gLSZ91TBELARAVJjrbue08pcp6zlupO_JY_tuopKh42sJ0F7AG1NkNF2pnz6B0uTd7gzJIzCbLXzMtkhjRLgRSKHmfoK153Lkp5rvMrXQgi115lS34VsxxBemgYJq5NsNtCPNg3j5VprMJ-NAozMsx8jtcTt6rIL74h45RB6pqnzVSM-S7FIDJbOljDfKKhY1GtHXCD7icMo-K9AsakP-g2YCxwp-sAHh3sec1M4UJL6ch6zh12ThH-MecnEY0biKEpagf-Pi_zeXMhrpNBdkq6sZ8RvRaTnO81xymt9wjJEaJmw5F7slWINtNFbVc406StC7QoAgR2G1xARFdljx7siTnRL6YQDCskUBW6IEpeSpg5RCstRFfbJRNSintld8HjZUqcyylXMurI8uEAB_T4WEe9hx9HFzm7uyOjpSmayrM5CIqhfhlGjh4';
const api = new MetaApi(token);

const databases = [
  { client: supabase, name: 'PRIMARY' },
  { client: newSupabase, name: 'NEW' },
  { client: boltSupabase, name: 'BOLT' },
];

async function getAssignedAccounts(db) {
  const { data, error } = await db.client
    .from('user_challenges')
    .select('trading_account_id, user_id, challenge_type')
    .not('trading_account_id', 'is', null);

  if (error) {
    console.error(`Error fetching accounts from ${db.name}:`, error.message);
    return [];
  }
  return data;
}

async function getAccountDetails(accountId) {
  try {
    const account = await api.metatraderAccountApi.getAccount(accountId);
    await account.deploy();
    await account.waitConnected();
    const connection = account.getRPCConnection();
    await connection.connect();
    await connection.waitSynchronized();

    const accountInfo = await connection.getAccountInformation();
    const history = await connection.getHistoryOrders(0, 1000); // Fetch last 1000 history orders
    const deals = await connection.getDeals(0, 1000); // Fetch last 1000 deals

    return {
      equity: accountInfo.equity,
      balance: accountInfo.balance,
      historyCount: history.length,
      dealsCount: deals.length,
    };
  } catch (error) {
    // It's common for accounts to not be found if they are not configured in MetaAPI
    if (error.message && error.message.includes('could not be found')) {
        return { equity: 'Not Found in MetaAPI', balance: 'N/A', historyCount: 0, dealsCount: 0 };
    }
    console.error(`Failed to fetch details for ${accountId}:`, error.message);
    return { equity: 'Error', balance: 'Error', historyCount: 'Error', dealsCount: 'Error' };
  }
}

async function generateReport() {
  console.log('--- Generating Live MT5 Account Report ---');

  let allAccounts = [];
  for (const db of databases) {
    const accounts = await getAssignedAccounts(db);
    allAccounts.push(...accounts);
  }
  
  // Remove duplicates
  allAccounts = Array.from(new Map(allAccounts.map(item => [item.trading_account_id, item])).values());


  if (allAccounts.length === 0) {
    console.log('No assigned MT5 accounts found.');
    return;
  }

  const report = [];
  for (const account of allAccounts) {
    console.log(`\\nFetching details for account: ${account.trading_account_id}...`);
    const details = await getAccountDetails(account.trading_account_id);
    report.push({
      'Account ID': account.trading_account_id,
      'Challenge Type': account.challenge_type,
      'Equity': details.equity,
      'Balance': details.balance,
      'History Orders': details.historyCount,
      'Deals': details.dealsCount,
    });
  }

  console.log(`\\n--- Completed Report for ${report.length} Unique Accounts ---`);
  console.table(report);
}

generateReport();
