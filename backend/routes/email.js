import express from 'express';
import EmailService from '../services/emailService.js';
import { supabase } from '../config/supabase.js';

// Create email service instance
const emailService = new EmailService();

const router = express.Router();

// Send verification code
router.post('/verify', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const code = await emailService.sendVerificationCode({
      email,
      name: name || 'User'
    });

    res.json({
      success: true,
      message: 'Verification code sent successfully',
      code: code // In production, store this in Redis/session instead
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send sign-in code
router.post('/signin', async (req, res) => {
  try {
    const { email, name, ipAddress } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const code = await emailService.sendSignInCode({
      email,
      name: name || 'User',
      ipAddress: ipAddress || req.ip
    });

    res.json({
      success: true,
      message: 'Sign-in code sent successfully',
      code: code // In production, store in session/Redis
    });
  } catch (error) {
    console.error('Error sending sign-in code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple test route - synchronous, no external dependencies
router.get('/test-simple', (req, res) => {
  console.log('🧪 Simple test route called');
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({
    success: true,
    message: 'Simple test route works',
    timestamp: new Date().toISOString()
  }));
});

// Send welcome email with certificate
router.post('/welcome', async (req, res) => {
  try {
    console.log('📧 Welcome email request received:', req.body);

    const { email, name, accountId } = req.body;

    if (!email) {
      console.log('❌ Email is required');
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    console.log('📧 Processing welcome email for:', email);

    // Send a simple welcome email without certificate generation
    const subject = `🦁 Welcome to Fund8r - Your Trading Journey Begins!`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%); padding: 20px; color: white; }
          .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.1); border-radius: 15px; padding: 40px; }
          .header { text-align: center; font-size: 60px; margin-bottom: 20px; }
          .title { color: #FFD700; text-align: center; font-size: 28px; margin-bottom: 20px; }
          .content { background: rgba(255,255,255,0.05); padding: 30px; border-radius: 10px; margin: 20px 0; }
          .highlight { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 50px; margin-top: 20px; font-weight: bold; }
          .footer { background: rgba(0,0,0,0.3); padding: 20px; text-align: center; border-radius: 10px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">🦁</div>
          <div class="title">Welcome to Fund8r!</div>
          <div class="content">
            <h2>Hi ${name || 'Trader'},</h2>
            <p>Welcome to the Fund8r elite trading community! You've just taken the first step toward trading with real capital and keeping up to 90% of your profits.</p>

            <div class="highlight">
              <h3>Your Account Details</h3>
              <p><strong>Account ID:</strong> ${accountId || 'WELCOME-' + Date.now()}</p>
              <p><strong>Status:</strong> Active Trader</p>
              <p><strong>Clearance:</strong> Level 1</p>
            </div>

            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Complete your profile setup</li>
              <li>Choose your first trading challenge</li>
              <li>Start your journey to funded trading</li>
            </ul>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Go to Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>Questions? Contact our support team at urgent.fund8r@gmail.com</p>
            <p>&copy; ${new Date().getFullYear()} Fund8r. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send the email
    await emailService.sendEmail(email, subject, html);

    res.json({
      success: true,
      message: 'Welcome email sent successfully',
      email: email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in welcome email route:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

// Send passing certificate
router.post('/passing', async (req, res) => {
  try {
    const { email, name, phase, profit, drawdown, full_name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    await emailService.sendPassingCertificate({
      email,
      name: name || full_name || 'Trader',
      phase: phase || 'Evaluation',
      profit: profit || '10%',
      drawdown: drawdown || '5%'
    });

    res.json({
      success: true,
      message: 'Passing certificate sent successfully'
    });
  } catch (error) {
    console.error('Error sending passing certificate:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send payout notification
router.post('/payout', async (req, res) => {
  try {
    const { email, name, amount, transactionId, arrivalTime, full_name } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    await emailService.sendPayoutNotification({
      email,
      name: name || full_name || 'Trader',
      amount: amount || '1,000.00',
      transactionId: transactionId || 'PAY-' + Date.now(),
      arrivalTime: arrivalTime || '1-3 business days'
    });

    res.json({
      success: true,
      message: 'Payout notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending payout notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send challenge started email
router.post('/challenge-started', async (req, res) => {
  try {
    const { user_id, challenge_id, challenge_type, account_size } = req.body;

    if (!user_id || !challenge_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and challenge_id are required'
      });
    }

    // Get user data
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await emailService.sendChallengeStartedEmail({
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Trader',
      challenge_type: challenge_type || 'Trading Challenge',
      account_size: account_size || 10000,
      mt5_login: 'TBD', // This would come from the challenge data
      mt5_password: 'TBD', // This would come from the challenge data
      mt5_server: 'MetaQuotes-Demo'
    });

    // Log the email
    await supabase
      .from('email_log')
      .insert({
        user_id: user_id,
        challenge_id: challenge_id,
        email_type: 'challenge_started',
        recipient_email: user.email,
        subject: `Your ${challenge_type} Challenge Has Started!`,
        status: 'sent',
        metadata: {
          challenge_type,
          account_size
        }
      });

    res.json({
      success: true,
      message: 'Challenge started email sent successfully'
    });
  } catch (error) {
    console.error('Error sending challenge started email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send challenge passed email
router.post('/challenge-passed', async (req, res) => {
  try {
    const { user_id, challenge_id, challenge_type, account_size } = req.body;

    if (!user_id || !challenge_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and challenge_id are required'
      });
    }

    // Get user data
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await emailService.sendChallengePassedEmail({
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Trader',
      challenge_type: challenge_type || 'Trading Challenge',
      account_size: account_size || 10000
    });

    // Log the email
    await supabase
      .from('email_log')
      .insert({
        user_id: user_id,
        challenge_id: challenge_id,
        email_type: 'challenge_passed',
        recipient_email: user.email,
        subject: `Congratulations! You Passed Your ${challenge_type} Challenge!`,
        status: 'sent',
        metadata: {
          challenge_type,
          account_size
        }
      });

    res.json({
      success: true,
      message: 'Challenge passed email sent successfully'
    });
  } catch (error) {
    console.error('Error sending challenge passed email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send breach notification email
router.post('/breach-notification', async (req, res) => {
  try {
    const { user_id, challenge_id, challenge_type, account_size } = req.body;

    if (!user_id || !challenge_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and challenge_id are required'
      });
    }

    // Get user data
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await emailService.sendBreachNotificationEmail({
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Trader',
      challenge_type: challenge_type || 'Trading Challenge',
      account_size: account_size || 10000
    });

    // Log the email
    await supabase
      .from('email_log')
      .insert({
        user_id: user_id,
        challenge_id: challenge_id,
        email_type: 'breach_notification',
        recipient_email: user.email,
        subject: `Account Breach Notification - ${challenge_type}`,
        status: 'sent',
        metadata: {
          challenge_type,
          account_size
        }
      });

    res.json({
      success: true,
      message: 'Breach notification email sent successfully'
    });
  } catch (error) {
    console.error('Error sending breach notification email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Send payout notification (alias for /payout)
router.post('/payout-notification', async (req, res) => {
  try {
    const { user_id, amount } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    // Get user data
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await emailService.sendPayoutNotification({
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Trader',
      amount: amount || '1,000.00',
      transactionId: 'PAY-' + Date.now(),
      arrivalTime: '1-3 business days'
    });

    // Log the email
    await supabase
      .from('email_log')
      .insert({
        user_id: user_id,
        email_type: 'payout_notification',
        recipient_email: user.email,
        subject: `Payout Processed - $${amount}`,
        status: 'sent',
        metadata: {
          amount
        }
      });

    res.json({
      success: true,
      message: 'Payout notification email sent successfully'
    });
  } catch (error) {
    console.error('Error sending payout notification email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint - sends a welcome email
router.post('/test', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required for testing'
      });
    }

    await emailService.sendWelcomeWithCertificate({
      email,
      name: 'Test Trader',
      accountId: 'TEST-' + Date.now()
    });

    res.json({
      success: true,
      message: 'Test email sent successfully! Check your inbox.'
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
