import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

// Import emailService AFTER env is loaded
const { default: EmailService } = await import('./services/emailService.js');
const emailService = new EmailService();

// Reinitialize to pick up env variables
emailService.reinitialize();

const sendEmails = async () => {
    const users = [
        { name: 'Vishal', email: 'vishalmauryau28@gmail.com', login: '105114748', password: '	F!Bs7uYd', server: 'FBS-Demo', accountSize: '$3,000', challengeName: 'Mini-Challenge' },
        { name: 'Ghavan', email: 'ghavan479@gmail.com', login: '105114794', password: '	M@B7GxQs', server: 'FBS-Demo', accountSize: '$3,000', challengeName: 'Mini-Challenge' },
        { name: 'Rahul', email: 'rahulsudhir204@gmail.com', login: '105114803', password: '	T-Hq5uQd', server: 'FBS-Demo', accountSize: '$3,000', challengeName: 'Mini-Challenge' },
        { name: 'Dipesh', email: 'traderdipesh05@gmail.com', login: '105114840', password: '	JdIc-2Cf', server: 'FBS-Demo', accountSize: '$3,000', challengeName: 'Mini-Challenge' },
        { name: 'S chandrakar', email: 'schandrakar0988@gmail.com', login: '105114847', password: '	5h!iNaUy', server: 'FBS-Demo', accountSize: '$3,000', challengeName: 'Mini-Challenge' },
        { name: 'Sahil Rao', email: 'raojil1511@gmail.com', login: '105114855', password: '	8!DoBaFq', server: 'FBS-Demo', accountSize: '$3,000', challengeName: 'Mini-Challenge' }
    ];

    for (const user of users) {
        const subject = `🚀 Your Fund8r ${user.challengeName} is LIVE!`;
        const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      :root {
        color-scheme: light dark;
      }
      body {
        font-family: sans-serif;
        background-color: #ffffff;
        color: #1a202c;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f9fafb;
        border-radius: 8px;
      }
      .header {
        text-align: center;
        padding-bottom: 20px;
      }
      .header h1 {
        color: #4f46e5;
      }
      .card {
        background-color: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }
      .card h2 {
        color: #2563eb;
        border-bottom: 2px solid #dbeafe;
        padding-bottom: 10px;
      }
      .credentials {
        background-color: #eef2ff;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #4f46e5;
      }
      .credentials p {
        margin: 5px 0;
      }
      .footer {
        text-align: center;
        padding-top: 20px;
        font-size: 12px;
        color: #6b7280;
      }
      .note {
        background-color: #eef2ff;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #4f46e5;
        margin-top: 20px;
      }
      @media (prefers-color-scheme: dark) {
        body {
          background-color: #1a202c;
          color: #ffffff;
        }
        .container {
          background-color: #2d3748;
        }
        .card {
          background-color: #4a5568;
          border-color: #718096;
        }
        .card h2 {
          color: #93c5fd;
          border-bottom-color: #4a5568;
        }
        .credentials {
          background-color: #2c3b59;
          border-left-color: #818cf8;
        }
        .note {
            background-color: #2c3b59;
            border-left-color: #818cf8;
        }
        .footer {
          color: #a0aec0;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🚀 Your Fund8r ${user.challengeName} is LIVE!</h1>
      </div>
      <div class="card">
        <p>Hi ${user.name},</p>
        <p>Welcome to Fund8r! Your trading challenge account is ready.</p>
      </div>
      <div class="card">
        <h2>📊 FUND8R CHALLENGE ACCOUNT</h2>
        <p><strong>Challenge:</strong> ${user.challengeName} (${user.accountSize})</p>
        <p><strong>Order ID:</strong> ${user.login}</p>
        <div class="credentials">
          <p><strong>MT5 LOGIN CREDENTIALS:</strong></p>
          <p>→ <strong>Server:</strong> ${user.server}</p>
          <p>→ <strong>Login:</strong> ${user.login}</p>
          <p>→ <strong>Password:</strong> ${user.password}</p>
        </div>
        <p>⚠️ SAVE THESE CREDENTIALS SAFELY ⚠️</p>
      </div>
      <div class="card">
        <h2>📥 DOWNLOAD MT5</h2>
        <p><strong>Step 1:</strong> Download MetaTrader 5</p>
        <p><strong>Step 2:</strong> Install and Open MT5</p>
        <p><strong>Step 3:</strong> Login to Your Account</p>
        <p>→ File → Login to Trade Account</p>
        <p>→ Enter credentials above</p>
        <p>→ Select "FBS-Demo" server</p>
        <p><strong>Step 4:</strong> Start Trading!</p>
      </div>
      <div class="card">
        <h2>🎯 YOUR CHALLENGE RULES</h2>
        <p><strong>Starting Balance:</strong> ${user.accountSize}</p>
        <p><strong>Profit Target:</strong> $200</p>
        <p><strong>Max Drawdown:</strong> $2,500</p>
        <p><strong>Max Daily Loss:</strong> $200 (3%)</p>
        <p><strong>Min Trading Days:</strong> 5 days</p>
        <p><strong>Time Limit:</strong> 7 days</p>
        <p>Pass these rules = Unlock funded account!</p>
      </div>
      <div class="card">
        <h2>📞 SUPPORT</h2>
        <p>Questions? We're here to help!</p>
        <p>→ <strong>Email:</strong> urgency.fund8r@gmail.com</p>
        <p>→ <strong>FAQ:</strong> fund8r.com/faq</p>
      </div>
      <div class="note">
        <p><strong>Note:</strong> Your account dashboard will be updated soon with these details. For now, please use the MT5 credentials from this email to start trading. Enjoy the challenge and trade smart!</p>
      </div>
      <div class="footer">
        <p>Your challenge starts NOW!</p>
        <p>Good luck and trade smart! 📈</p>
        <p>Best regards,</p>
        <p>The Fund8r Team</p>
        <p>P.S. Join our Discord community to connect with other Fund8r traders and get real-time support!</p>
        <p>Fund8r Challenge Program</p>
        <p>Powered by FBS Infrastructure</p>
      </div>
    </div>
  </body>
  </html>
  `;

        try {
            await emailService.sendEmail(user.email, subject, htmlContent);
            console.log(`Email sent successfully to ${user.email}`);
        } catch (error) {
            console.error(`Failed to send email to ${user.email}:`, error);
        }
    }
};

sendEmails();
