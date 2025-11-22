oimport dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase, oldSupabase, boltSupabase } from './config/supabase.js';
import invoiceGenerator from './services/invoiceGenerator.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from both root and backend directories FIRST
dotenv.config({ path: path.join(__dirname, '../.env') }); // Root .env
dotenv.config({ path: path.join(__dirname, '.env') }); // Backend .env (overrides root)

// Import emailService AFTER env is loaded (dynamic import)
const { default: EmailService } = await import('./services/emailService.js');
const emailService = new EmailService();

// Reinitialize to pick up env variables
emailService.reinitialize();

async function sendPurchaseEmailToAll() {
  try {
    console.log('🚀 Starting purchase email send process for all users...');

    const clients = [
      { client: supabase, name: 'PRIMARY' },
      { client: oldSupabase, name: 'OLD' },
      { client: boltSupabase, name: 'BOLT' },
    ];

    let allUsers = [];
    let allPurchases = [];
    let allChallengeTypes = [];

    for (const { client, name } of clients) {
      console.log(`\n🔍 Querying ${name} database...`);

      const { data: users, error: userError } = await client
        .from('user_profile')
        .select('*');
      if (userError) {
        console.error(`Error finding users in ${name} database: ${userError.message}`);
        continue;
      }
      if (users && users.length > 0) {
        allUsers = allUsers.concat(users);
      }

      const { data: userChallenges, error: challengesError } = await client
        .from('user_challenges')
        .select('*');
      if (challengesError) {
        console.error(`Error finding user challenges in ${name} database: ${challengesError.message}`);
        continue;
      }
      if (userChallenges && userChallenges.length > 0) {
        allPurchases = allPurchases.concat(userChallenges);
      }

      const { data: challengeTypes, error: typesError } = await client
        .from('challenge_types')
        .select('*');
      if (typesError) {
        console.error(`Error finding challenge types in ${name} database: ${typesError.message}`);
        continue;
      }
      if (challengeTypes && challengeTypes.length > 0) {
        allChallengeTypes = allChallengeTypes.concat(challengeTypes);
      }
    }

    const uniqueUsers = [...new Map(allUsers.map(item => [item.user_id, item])).values()];
    const uniquePurchases = [...new Map(allPurchases.map(item => [item.id, item])).values()];
    const uniqueChallengeTypes = [...new Map(allChallengeTypes.map(item => [item.id, item])).values()];

    const purchasesByUser = uniquePurchases.reduce((acc, purchase) => {
      const userId = purchase.user_id;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(purchase);
      return acc;
    }, {});

    for (const userId in purchasesByUser) {
      const user = uniqueUsers.find(u => u.user_id === userId);
      if (!user) {
        console.warn(`Could not find user profile for user_id: ${userId}. Skipping.`);
        continue;
      }

      const userPurchases = purchasesByUser[userId].map(purchase => {
        const type = uniqueChallengeTypes.find(t => t.id === purchase.challenge_type_id);
        return {
          ...purchase,
          challenge_types: type || { challenge_name: 'Unknown' }
        };
      });

      if (userPurchases.length === 0) {
        continue;
      }

      console.log(`📧 Preparing to send email to: ${user.email}`);

      const subject = 'Your Fund8r Purchase History';
      
      let purchaseDetailsHtml = '<table><thead><tr><th>Purchase ID</th><th>Product Name</th><th>Amount</th><th>Date</th></tr></thead><tbody>';
      for (const purchase of userPurchases) {
          purchaseDetailsHtml += `
              <tr>
                  <td>${purchase.id}</td>
                  <td>${purchase.challenge_types.challenge_name} - ${purchase.account_size}</td>
                  <td>$${purchase.amount_paid.toFixed(2)}</td>
                  <td>${new Date(purchase.purchase_date).toLocaleDateString()}</td>
              </tr>
          `;
      }
      purchaseDetailsHtml += '</tbody></table>';

      let html = fs.readFileSync(path.join(__dirname, 'templates/email/purchase.html'), 'utf-8');
      html = html.replace('{{name}}', user.full_name || user.email);
      html = html.replace('{{purchaseDetails}}', purchaseDetailsHtml);
      html = html.replace('{{dashboardUrl}}', 'https://fund8r.com/dashboard');

      const attachments = [];
      for (const purchase of userPurchases) {
          const invoiceBuffer = await invoiceGenerator.generateInvoice({ ...purchase, user });
          attachments.push({
              filename: `invoice-${purchase.id}.png`,
              content: invoiceBuffer,
              contentType: 'image/png'
          });
      }

      await emailService.transporter.sendMail({
          from: `"Fund8r" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: subject,
          html: html,
          attachments: attachments
      });

      console.log(`\n✅ Email sent successfully to ${user.email}!`);
    }

  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error('Error message:', error.message);
    throw error;
  }
}

sendPurchaseEmailToAll()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed with error:');
    console.error(error);
    process.exit(1);
  });
