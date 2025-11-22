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

const emails = [
  {
    subject: 'Your Fund8r Mini-Challenge Results - Account #105114748',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: light-dark(#f0f0f5, #0a0a1a); padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: light-dark(#ffffff, #1a1a2e); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(88, 86, 214, 0.15);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #5856d6 0%, #2c2c8e 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">FUND8R</h1>
                            <p style="margin: 10px 0 0 0; color: #e0e0ff; font-size: 14px; font-weight: 500;">Mini-Challenge Results</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: light-dark(#1a1a2e, #e0e0ff); font-size: 22px; font-weight: 600;">Hi Vishal,</h2>

                            <p style="margin: 0 0 20px 0; color: light-dark(#4a4a6a, #b0b0d0); font-size: 16px; line-height: 1.6;">Thank you for participating in our Free Mini-Challenge. We've reviewed your trading account <strong style="color: light-dark(#5856d6, #8b8aff);">#105114748</strong> and wanted to share your results.</p>

                            <!-- Challenge Status -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: light-dark(#f8f8ff, #16162b); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #ff4757;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px 0; color: light-dark(#8a8a9a, #9090b0); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Challenge Status</p>
                                        <p style="margin: 0; color: #ff4757; font-size: 20px; font-weight: 700;">Not Passed</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Violation Details -->
                            <div style="background: light-dark(#fff5f5, #1a0d0e); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid light-dark(#ffe0e0, #3a1a1c);">
                                <h3 style="margin: 0 0 15px 0; color: light-dark(#2c2c8e, #b0b0ff); font-size: 16px; font-weight: 600;">📊 Violations Detected:</h3>
                                <ul style="margin: 0; padding-left: 20px; color: light-dark(#4a4a6a, #b0b0d0); line-height: 1.8;">
                                    <li><strong>Max Drawdown:</strong> Breached at <span style="color: #ff4757; font-weight: 600;">9.68%</span></li>
                                    <li><strong>Daily Drawdown:</strong> Breached at <span style="color: #ff4757; font-weight: 600;">9.68%</span></li>
                                    <li><strong>Max Trade Risk:</strong> <span style="color: #ff4757; font-weight: 600;">5 violations</span> (highest: 6.03%)</li>
                                </ul>
                            </div>

                            <!-- Encouragement -->
                            <p style="margin: 25px 0; color: light-dark(#4a4a6a, #b0b0d0); font-size: 16px; line-height: 1.6;">Don't let this discourage you! Every challenge is a learning opportunity. We encourage you to:</p>

                            <ul style="margin: 0 0 25px 0; padding-left: 20px; color: light-dark(#4a4a6a, #b0b0d0); line-height: 1.8;">
                                <li>Review your risk management strategy</li>
                                <li>Focus on position sizing</li>
                                <li>Practice disciplined drawdown control</li>
                            </ul>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://fund8r.com" style="display: inline-block; background: linear-gradient(135deg, #5856d6 0%, #2c2c8e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(88, 86, 214, 0.3);">Try Again</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 25px 0 0 0; color: light-dark(#6a6a8a, #9090b0); font-size: 14px; line-height: 1.6;">If you have any questions or need guidance, our support team is here to help!</p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: light-dark(#f8f8ff, #0f0f1a); padding: 30px; text-align: center; border-top: 1px solid light-dark(#e0e0f0, #2a2a3e);">
                            <p style="margin: 0 0 10px 0; color: light-dark(#8a8a9a, #7070a0); font-size: 14px;">Keep Trading, Keep Learning</p>
                            <p style="margin: 0; color: light-dark(#aaaac0, #6060a0); font-size: 12px;">© 2024 Fund8r. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
  },
  {
    subject: 'Your Fund8r Mini-Challenge Results - Account #105114794',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: light-dark(#f0f0f5, #0a0a1a); padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: light-dark(#ffffff, #1a1a2e); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(88, 86, 214, 0.15);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #5856d6 0%, #2c2c8e 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">FUND8R</h1>
                            <p style="margin: 10px 0 0 0; color: #e0e0ff; font-size: 14px; font-weight: 500;">Mini-Challenge Results</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: light-dark(#1a1a2e, #e0e0ff); font-size: 22px; font-weight: 600;">Hi Ghavan,</h2>

                            <p style="margin: 0 0 20px 0; color: light-dark(#4a4a6a, #b0b0d0); font-size: 16px; line-height: 1.6;">Thank you for participating in our Free Mini-Challenge. We've reviewed your trading account <strong style="color: light-dark(#5856d6, #8b8aff);">#105114794</strong> and wanted to share your results.</p>

                            <!-- Challenge Status -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: light-dark(#f8f8ff, #16162b); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #ff4757;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px 0; color: light-dark(#8a8a9a, #9090b0); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Challenge Status</p>
                                        <p style="margin: 0; color: #ff4757; font-size: 20px; font-weight: 700;">Not Passed</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Violation Details -->
                            <div style="background: light-dark(#fff5f5, #1a0d0e); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid light-dark(#ffe0e0, #3a1a1c);">
                                <h3 style="margin: 0 0 15px 0; color: light-dark(#2c2c8e, #b0b0ff); font-size: 16px; font-weight: 600;">📊 Violations Detected:</h3>
                                <ul style="margin: 0; padding-left: 20px; color: light-dark(#4a4a6a, #b0b0d0); line-height: 1.8;">
                                    <li><strong>Max Daily Gain:</strong> Breached by <span style="color: #ff4757; font-weight: 600;">8.95%</span></li>
                                    <li><strong>Max Trade Risk:</strong> <span style="color: #ff4757; font-weight: 600;">15 violations</span> (highest: 1.11%)</li>
                                </ul>
                            </div>

                            <!-- Encouragement -->
                            <p style="margin: 25px 0; color: light-dark(#4a4a6a, #b0b0d0); font-size: 16px; line-height: 1.6;">We noticed you had multiple risk management violations. Here are some tips for your next attempt:</p>

                            <ul style="margin: 0 0 25px 0; padding-left: 20px; color: light-dark(#4a4a6a, #b0b0d0); line-height: 1.8;">
                                <li>Be mindful of daily gain limits</li>
                                <li>Implement strict position sizing rules</li>
                                <li>Review our risk management guidelines</li>
                            </ul>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://fund8r.com" style="display: inline-block; background: linear-gradient(135deg, #5856d6 0%, #2c2c8e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(88, 86, 214, 0.3);">Start New Challenge</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 25px 0 0 0; color: light-dark(#6a6a8a, #9090b0); font-size: 14px; line-height: 1.6;">Need help improving your trading strategy? Reach out to our support team!</p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: light-dark(#f8f8ff, #0f0f1a); padding: 30px; text-align: center; border-top: 1px solid light-dark(#e0e0f0, #2a2a3e);">
                            <p style="margin: 0 0 10px 0; color: light-dark(#8a8a9a, #7070a0); font-size: 14px;">Keep Trading, Keep Learning</p>
                            <p style="margin: 0; color: light-dark(#aaaac0, #6060a0); font-size: 12px;">© 2024 Fund8r. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
  },
  {
    subject: 'Your Fund8r Mini-Challenge Results - Account #105114803',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: light-dark(#f0f0f5, #0a0a1a); padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: light-dark(#ffffff, #1a1a2e); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(88, 86, 214, 0.15);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #5856d6 0%, #2c2c8e 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">FUND8R</h1>
                            <p style="margin: 10px 0 0 0; color: #e0e0ff; font-size: 14px; font-weight: 500;">Mini-Challenge Results</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: light-dark(#1a1a2e, #e0e0ff); font-size: 22px; font-weight: 600;">Hi Rahul,</h2>

                            <p style="margin: 0 0 20px 0; color: light-dark(#4a4a6a, #b0b0d0); font-size: 16px; line-height: 1.6;">Thank you for participating in our Free Mini-Challenge. We've reviewed your trading account <strong style="color: light-dark(#5856d6, #8b8aff);">#105114803</strong> and wanted to share your results.</p>

                            <!-- Challenge Status -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: light-dark(#f8f8ff, #16162b); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #ff4757;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px 0; color: light-dark(#8a8a9a, #9090b0); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Challenge Status</p>
                                        <p style="margin: 0; color: #ff4757; font-size: 20px; font-weight: 700;">Not Passed</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Violation Details -->
                            <div style="background: light-dark(#fff5f5, #1a0d0e); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid light-dark(#ffe0e0, #3a1a1c);">
                                <h3 style="margin: 0 0 15px 0; color: light-dark(#2c2c8e, #b0b0ff); font-size: 16px; font-weight: 600;">⏰ Challenge Issue:</h3>
                                <p style="margin: 0; padding-left: 20px; color: light-dark(#4a4a6a, #b0b0d0); line-height: 1.8;">
                                    <strong>Time Limit:</strong> <span style="color: #ff4757; font-weight: 600;">Exceeded</span>
                                </p>
                            </div>

                            <!-- Encouragement -->
                            <p style="margin: 25px 0; color: light-dark(#4a4a6a, #b0b0d0); font-size: 16px; line-height: 1.6;">Unfortunately, the challenge time limit was exceeded. Time management is crucial in trading challenges. For your next attempt:</p>

                            <ul style="margin: 0 0 25px 0; padding-left: 20px; color: light-dark(#4a4a6a, #b0b0d0); line-height: 1.8;">
                                <li>Set reminders for challenge deadlines</li>
                                <li>Plan your trading schedule in advance</li>
                                <li>Stay active and monitor your progress regularly</li>
                            </ul>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://fund8r.com" style="display: inline-block; background: linear-gradient(135deg, #5856d6 0%, #2c2c8e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(88, 86, 214, 0.3);">Take Another Challenge</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 25px 0 0 0; color: light-dark(#6a6a8a, #9090b0); font-size: 14px; line-height: 1.6;">Questions? Our support team is always here to help you succeed!</p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: light-dark(#f8f8ff, #0f0f1a); padding: 30px; text-align: center; border-top: 1px solid light-dark(#e0e0f0, #2a2a3e);">
                            <p style="margin: 0 0 10px 0; color: light-dark(#8a8a9a, #7070a0); font-size: 14px;">Keep Trading, Keep Learning</p>
                            <p style="margin: 0; color: light-dark(#aaaac0, #6060a0); font-size: 12px;">© 2024 Fund8r. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
  },
  {
    subject: 'Your Fund8r Mini-Challenge Results - Account #105114840',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: light-dark(#f0f0f5, #0a0a1a); padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: light-dark(#ffffff, #1a1a2e); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(88, 86, 214, 0.15);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #5856d6 0%, #2c2c8e 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">FUND8R</h1>
                            <p style="margin: 10px 0 0 0; color: #e0e0ff; font-size: 14px; font-weight: 500;">Mini-Challenge Results</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: light-dark(#1a1a2e, #e0e0ff); font-size: 22px; font-weight: 600;">Hi Dipesh,</h2>

                            <p style="margin: 0 0 20px 0; color: light-dark(#4a4a6a, #b0b0d0); font-size: 16px; line-height: 1.6;">Thank you for participating in our Free Mini-Challenge. We've reviewed your trading account <strong style="color: light-dark(#5856d6, #8b8aff);">#105114840</strong> and wanted to share your results.</p>

                            <!-- Challenge Status -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: light-dark(#f8f8ff, #16162b); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #ff9f43;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px 0; color: light-dark(#8a8a9a, #9090b0); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Challenge Status</p>
                                        <p style="margin: 0; color: #ff9f43; font-size: 20px; font-weight: 700;">Not Passed</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Violation Details -->
                            <div style="background: light-dark(#fffaf5, #1a120d); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid light-dark(#ffe8d0, #3a2a1c);">
                                <h3 style="margin: 0 0 15px 0; color: light-dark(#2c2c8e, #b0b0ff); font-size: 16px; font-weight: 600;">📊 Challenge Issues:</h3>
                                <ul style="margin: 0; padding-left: 20px; color: light-dark(#4a4a6a, #b0b0d0); line-height: 1.8;">
                                    <li><strong>Profit Target:</strong> <span style="color: #ff9f43; font-weight: 600;">Not Achieved</span></li>
                                    <li><strong>Max Trade Risk:</strong> <span style="color: #ff9f43; font-weight: 600;">1 violation</span></li>
                                </ul>
                            </div>

                            <!-- Encouragement -->
                            <p style="margin: 25px 0; color: light-dark(#4a4a6a, #b0b0d0); font-size: 16px; line-height: 1.6;">You were close! The profit target wasn't quite reached. Here's what can help next time:</p>

                            <ul style="margin: 0 0 25px 0; padding-left: 20px; color: light-dark(#4a4a6a, #b0b0d0); line-height: 1.8;">
                                <li>Focus on consistent trading strategies</li>
                                <li>Ensure proper position sizing to avoid violations</li>
                                <li>Set realistic daily/weekly profit goals</li>
                            </ul>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://fund8r.com" style="display: inline-block; background: linear-gradient(135deg, #5856d6 0%, #2c2c8e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(88, 86, 214, 0.3);">Try Again</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 25px 0 0 0; color: light-dark(#6a6a8a, #9090b0); font-size: 14px; line-height: 1.6;">We believe in your potential! Reach out if you need any guidance.</p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: light-dark(#f8f8ff, #0f0f1a); padding: 30px; text-align: center; border-top: 1px solid light-dark(#e0e0f0, #2a2a3e);">
                            <p style="margin: 0 0 10px 0; color: light-dark(#8a8a9a, #7070a0); font-size: 14px;">Keep Trading, Keep Learning</p>
                            <p style="margin: 0; color: light-dark(#aaaac0, #6060a0); font-size: 12px;">© 2024 Fund8r. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
  },
  {
    subject: 'Your Fund8r Mini-Challenge Results - Account #105114847',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: light-dark(#f0f0f5, #0a0a1a); padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: light-dark(#ffffff, #1a1a2e); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(88, 86, 214, 0.15);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #5856d6 0%, #2c2c8e 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">FUND8R</h1>
                            <p style="margin: 10px 0 0 0; color: #e0e0ff; font-size: 14px; font-weight: 500;">Mini-Challenge Results</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: light-dark(#1a1a2e, #e0e0ff); font-size: 22px; font-weight: 600;">Hi S Chandrakar,</h2>

                            <p style="margin: 0 0 20px 0; color: light-dark(#4a4a6a, #b0b0d0); font-size: 16px; line-height: 1.6;">Thank you for participating in our Free Mini-Challenge. We've reviewed your trading account <strong style="color: light-dark(#5856d6, #8b8aff);">#105114847</strong> and wanted to share your results.</p>

                            <!-- Challenge Status -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: light-dark(#f8f8ff, #16162b); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #ff4757;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px 0; color: light-dark(#8a8a9a, #9090b0); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Challenge Status</p>
                                        <p style="margin: 0; color: #ff4757; font-size: 20px; font-weight: 700;">Not Passed</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Violation Details -->
                            <div style="background: light-dark(#fff5f5, #1a0d0e); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid light-dark(#ffe0e0, #3a1a1c);">
                                <h3 style="margin: 0 0 15px 0; color: light-dark(#2c2c8e, #b0b0ff); font-size: 16px; font-weight: 600;">📊 Violation Detected:</h3>
                                <p style="margin: 0; padding-left: 20px; color: light-dark(#4a4a6a, #b0b0d0); line-height: 1.8;">
                                    <strong>Max Drawdown:</strong> Breached at <span style="color: #ff4757; font-weight: 600;">6.35%</span>
                                </p>
                            </div>

                            <!-- Encouragement -->
                            <p style="margin: 25px 0; color: light-dark(#4a4a6a, #b0b0d0); font-size: 16px; line-height: 1.6;">Drawdown management is essential for long-term trading success. Here are some strategies to help:</p>

                            <ul style="margin: 0 0 25px 0; padding-left: 20px; color: light-dark(#4a4a6a, #b0b0d0); line-height: 1.8;">
                                <li>Implement stop-loss orders consistently</li>
                                <li>Reduce position sizes during volatile periods</li>
                                <li>Monitor your account equity regularly</li>
                            </ul>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://fund8r.com" style="display: inline-block; background: linear-gradient(135deg, #5856d6 0%, #2c2c8e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(88, 86, 214, 0.3);">Retry Challenge</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 25px 0 0 0; color: light-dark(#6a6a8a, #9090b0); font-size: 14px; line-height: 1.6;">Have questions about risk management? Our team is ready to assist!</p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: light-dark(#f8f8ff, #0f0f1a); padding: 30px; text-align: center; border-top: 1px solid light-dark(#e0e0f0, #2a2a3e);">
                            <p style="margin: 0 0 10px 0; color: light-dark(#8a8a9a, #7070a0); font-size: 14px;">Keep Trading, Keep Learning</p>
                            <p style="margin: 0; color: light-dark(#aaaac0, #6060a0); font-size: 12px;">© 2024 Fund8r. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
  },
  {
    subject: 'Your Fund8r Mini-Challenge Results - Account #105114855',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: light-dark(#f0f0f5, #0a0a1a); padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: light-dark(#ffffff, #1a1a2e); border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(88, 86, 214, 0.15);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #5856d6 0%, #2c2c8e 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">FUND8R</h1>
                            <p style="margin: 10px 0 0 0; color: #e0e0ff; font-size: 14px; font-weight: 500;">Mini-Challenge Results</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: light-dark(#1a1a2e, #e0e0ff); font-size: 22px; font-weight: 600;">Hi Sahil,</h2>

                            <p style="margin: 0 0 20px 0; color: light-dark(#4a4a6a, #b0b0d0); font-size: 16px; line-height: 1.6;">Thank you for participating in our Free Mini-Challenge. We've reviewed your trading account <strong style="color: light-dark(#5856d6, #8b8aff);">#105114855</strong> and wanted to share your results.</p>

                            <!-- Challenge Status -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background: light-dark(#f8f8ff, #16162b); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #ff4757;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 10px 0; color: light-dark(#8a8a9a, #9090b0); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Challenge Status</p>
                                        <p style="margin: 0; color: #ff4757; font-size: 20px; font-weight: 700;">Not Passed</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Violation Details -->
                            <div style="background: light-dark(#fff5f5, #1a0d0e); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid light-dark(#ffe0e0, #3a1a1c);">
                                <h3 style="margin: 0 0 15px 0; color: light-dark(#2c2c8e, #b0b0ff); font-size: 16px; font-weight: 600;">📊 Multiple Violations Detected:</h3>
                                <ul style="margin: 0; padding-left: 20px; color: light-dark(#4a4a6a, #b0b0d0); line-height: 1.8;">
                                    <li><strong>Profit Target:</strong> <span style="color: #ff9f43; font-weight: 600;">Not Achieved</span></li>
                                    <li><strong>Max Drawdown:</strong> Breached at <span style="color: #ff4757; font-weight: 600;">6.38%</span></li>
                                    <li><strong>Daily Drawdown:</strong> Breached at <span style="color: #ff4757; font-weight: 600;">3.27%</span></li>
                                    <li><strong>Max Trade Risk:</strong> <span style="color: #ff4757; font-weight: 600;">11 violations</span> (highest: 1.24%)</li>
                                </ul>
                            </div>

                            <!-- Encouragement -->
                            <p style="margin: 25px 0; color: light-dark(#4a4a6a, #b0b0d0); font-size: 16px; line-height: 1.6;">We noticed several areas for improvement. This is a great learning opportunity! Focus on:</p>

                            <ul style="margin: 0 0 25px 0; padding-left: 20px; color: light-dark(#4a4a6a, #b0b0d0); line-height: 1.8;">
                                <li>Strict adherence to risk-per-trade limits</li>
                                <li>Better drawdown control strategies</li>
                                <li>Consistent profit-taking approach</li>
                                <li>Regular monitoring of account metrics</li>
                            </ul>

                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="https://fund8r.com" style="display: inline-block; background: linear-gradient(135deg, #5856d6 0%, #2c2c8e 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(88, 86, 214, 0.3);">Start Fresh Challenge</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 25px 0 0 0; color: light-dark(#6a6a8a, #9090b0); font-size: 14px; line-height: 1.6;">Want personalized guidance? Contact our support team for trading tips and best practices!</p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: light-dark(#f8f8ff, #0f0f1a); padding: 30px; text-align: center; border-top: 1px solid light-dark(#e0e0f0, #2a2a3e);">
                            <p style="margin: 0 0 10px 0; color: light-dark(#8a8a9a, #7070a0); font-size: 14px;">Keep Trading, Keep Learning</p>
                            <p style="margin: 0; color: light-dark(#aaaac0, #6060a0); font-size: 12px;">© 2024 Fund8r. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
  }
];

const sendEmails = async () => {
    const targetEmail = "privacy.fund8r@gmail.com";

    for (const email of emails) {
        try {
            console.log(`
📧 Sending email "${email.subject}" to ${targetEmail}...`);
            await emailService.sendEmail(targetEmail, email.subject, email.html);
            console.log(`✅ Successfully sent: ${email.subject}`);

            // Add delay between emails to avoid overwhelming the server
            console.log("⏳ Waiting 2 seconds before next email...");
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            console.error(`❌ Failed to send email "${email.subject}":`, error.message);
            // Continue with next email even if one fails
        }
    }

    console.log("\n🎉 All emails sent successfully!");
};

sendEmails();
