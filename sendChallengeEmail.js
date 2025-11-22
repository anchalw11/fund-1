import { supabase } from './config/supabase.js';
import emailService from './services/emailService.js';
import freeMiniChallengeTemplate from './templates/email/freeMiniChallenge.js';

async function sendEmails() {
  try {
    // Fetch all users using the admin client
    console.log('Fetching all users...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      throw new Error(`Error fetching users: ${usersError.message}`);
    }

    // Filter users by creation date
    console.log('Filtering users created on November 4th and 5th, 2025...');
    const startDate = new Date('2025-11-04T00:00:00Z').getTime();
    const endDate = new Date('2025-11-05T23:59:59Z').getTime();

    const filteredUsers = users.filter(user => {
      const createdAt = new Date(user.created_at).getTime();
      return createdAt >= startDate && createdAt <= endDate;
    });
    
    if (!filteredUsers || filteredUsers.length === 0) {
      console.log('No new users found for the specified dates.');
      return;
    }

    console.log(`Sending emails to ${filteredUsers.length} users...`);

    for (const user of filteredUsers) {
      const userEmail = user.email;
      const userName = user.name || 'Trader';
      
      await emailService.transporter.sendMail({
        from: `"Fund8r" <${process.env.SMTP_USER}>`,
        to: userEmail,
        subject: 'Free Mini Challenge Rules',
        html: freeMiniChallengeTemplate({ name: userName }).replace('<div class="coming-soon">COMING SOON</div>', ''),
      });
      console.log(`Email sent to ${userEmail}`);
    }

    console.log('All emails sent successfully.');
  } catch (error) {
    console.error('Error sending emails:', error);
  }
}

sendEmails();
