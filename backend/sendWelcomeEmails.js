import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase, oldSupabase, boltSupabase } from './config/supabase.js';

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

async function sendWelcomeEmails() {
  try {
    console.log('🚀 Starting welcome email send process...');

    const startDate = '2025-11-04T00:00:00.000Z';
    const endDate = '2025-11-05T23:59:59.999Z';

    console.log(`🔍 Finding users created between ${startDate} and ${endDate}`);
    const clients = [
      { client: supabase, name: 'PRIMARY' },
      { client: oldSupabase, name: 'OLD' },
      { client: boltSupabase, name: 'BOLT' },
    ];

    let allUsers = [];

    for (const { client, name } of clients) {
      console.log(`\n🔍 Querying ${name} database...`);
      const { data: users, error: userError } = await client
        .from('user_profile')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (userError) {
        console.error(`Error finding users in ${name} database: ${userError.message}`);
        continue; // Continue to the next client if one fails
      }
      
      if (users && users.length > 0) {
        console.log(`Found ${users.length} users in ${name} database.`);
        allUsers = allUsers.concat(users);
      } else {
        console.log(`No users found in ${name} database for the specified date range.`);
      }
    }

    // Remove duplicates based on user email
    const uniqueUsers = allUsers.filter((user, index, self) =>
      index === self.findIndex((u) => (
        u.email === user.email
      ))
    );
    
    const users = uniqueUsers;

    if (!users || users.length === 0) {
      console.log(`No users found created between ${startDate} and ${endDate}.`);
      return;
    }

    console.log(`Found ${users.length} users to email.`);

    for (const user of users) {
      console.log(`📧 Sending email to: ${user.email}`);

      const subject = 'Welcome to Fund8r!';
      const html = `
        <h1>Welcome, ${user.full_name || user.email}!</h1>
        <p>Thank you for joining Fund8r. We are excited to have you on board.</p>
        <p>Best regards,</p>
        <p>The Fund8r Team</p>
      `;

      await emailService.transporter.sendMail({
        from: `"Fund8r" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: subject,
        html: html,
      });

      console.log(`✅ Email sent successfully to ${user.email}`);
    }

  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error('Error message:', error.message);
    throw error;
  }
}

sendWelcomeEmails()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed with error:');
    console.error(error);
    process.exit(1);
  });
