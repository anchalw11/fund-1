import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('📝 Environment Check:');
console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
console.log(`   SMTP_USER: ${process.env.SMTP_USER || 'NOT SET'}`);
console.log(`   SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? '***CONFIGURED***' : 'NOT SET'}\n`);

import emailService from './services/emailService.js';

console.log('\n' + '='.repeat(60));
console.log('🧪 FUND8R EMAIL SYSTEM TEST');
console.log('='.repeat(60) + '\n');

async function testEmailSystem() {
  try {
    // Test 1: Welcome Email with Certificate
    console.log('📧 Test 1: Generating Welcome Certificate...');
    await emailService.sendWelcomeWithCertificate({
      email: 'anchalw11@gmail.com',
      name: 'Test Trader',
      accountId: 'TEST-FX-001'
    });
    console.log('✅ Welcome email prepared\n');

    // Test 2: Passing Certificate
    console.log('📧 Test 2: Generating Passing Certificate...');
    await emailService.sendPassingCertificate({
      email: 'anchalw11@gmail.com',
      name: 'Test Trader',
      phase: 'Phase 1 - Evaluation',
      profit: '15.5%',
      drawdown: '3.2%'
    });
    console.log('✅ Passing certificate prepared\n');

    // Test 3: Payout Notification
    console.log('📧 Test 3: Generating Payout Certificate...');
    await emailService.sendPayoutNotification({
      email: 'anchalw11@gmail.com',
      name: 'Test Trader',
      amount: '5,000.00',
      transactionId: 'PAY-TEST-001',
      arrivalTime: '1-3 business days'
    });
    console.log('✅ Payout notification prepared\n');

    console.log('='.repeat(60));
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\nNOTE: If SMTP is not configured, emails are logged to console.');
    console.log('To send actual emails, ensure SMTP credentials are in .env file.\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run tests
testEmailSystem().then(() => {
  console.log('\n✅ Test script completed\n');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Test script failed:', error);
  process.exit(1);
});
