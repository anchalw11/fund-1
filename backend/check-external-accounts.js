
import MetaApi from 'metaapi.cloud-sdk';

const token = process.env.META_API_TOKEN;

if (!token) {
  console.error('META_API_TOKEN environment variable not set.');
  process.exit(1);
}

const api = new MetaApi(token);

const accounts = [
  { name: 'Vishal', login: 105114748, server: 'MetaQuotes-Demo', password: 'F!Bs7uYd' },
  { name: 'Ghavan', login: 105114794, server: 'MetaQuotes-Demo', password: 'M@B7GxQs' },
  { name: 'Rahul', login: 105114803, server: 'MetaQuotes-Demo', password: 'T-Hq5uQd' },
  { name: 'Dipesh', login: 105114840, server: 'MetaQuotes-Demo', password: 'JdIc-2Cf' },
  { name: 'S chandrakar', login: 105114847, server: 'MetaQuotes-Demo', password: '5h!iNaUy' },
  { name: 'Sahil Rao', login: 105114855, server: 'MetaQuotes-Demo', password: '8!DoBaFq' }
];

async function checkExternalAccounts() {
  for (const account of accounts) {
    console.log(`\\n--- Checking account: ${account.name} (${account.login}) ---`);
    try {
      const metaApiAccount = await api.metatraderAccountApi.createAccount({
        login: account.login,
        password: account.password,
        server: account.server,
        platform: 'mt5',
        name: account.name
      });

      await metaApiAccount.deploy();
      await metaApiAccount.waitConnected();

      const connection = metaApiAccount.getRPCConnection();
      await connection.connect();
      await connection.waitSynchronized();

      const accountInfo = await connection.getAccountInformation();
      console.log('Account Information:', accountInfo);

      // You can add more checks here, e.g., for drawdown
      
      await metaApiAccount.undeploy();

    } catch (error) {
      console.error(`Error checking account ${account.name}:`, error);
    }
  }
}

checkExternalAccounts();
