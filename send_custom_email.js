import EmailService from './backend/services/emailService.js';

async function sendCustomEmail() {
  try {
    const emailService = new EmailService();

    // Ensure the email service is initialized
    await emailService.ensureInitialized();

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You've Been Selected - Second Chance Program</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0a0e27 0%, #1a1a3e 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 650px; margin: 40px auto; background: #0d1128;">

        <!-- Header with Glow Effect -->
        <tr>
            <td style="padding: 0;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #8b5cf6 100%); padding: 3px; border-radius: 12px 12px 0 0;">
                    <div style="background: #0d1128; padding: 40px 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <div style="display: inline-block; padding: 8px 20px; background: rgba(139, 92, 246, 0.2); border: 1px solid #8b5cf6; border-radius: 20px; margin-bottom: 20px;">
                            <span style="color: #a78bfa; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">⚡ Elite Trader Identified</span>
                        </div>
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; line-height: 1.2;">
                            You've Been <span style="background: linear-gradient(90deg, #8b5cf6, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Hand-Selected</span>
                        </h1>
                    </div>
                </div>
            </td>
        </tr>

        <!-- Main Content -->
        <tr>
            <td style="padding: 40px 40px 30px 40px; background: #0d1128;">

                <p style="color: #e5e7eb; font-size: 16px; line-height: 1.8; margin-top: 0;">
                    Hey there,
                </p>

                <p style="color: #e5e7eb; font-size: 16px; line-height: 1.8;">
                    I'm reaching out personally because <strong style="color: #ffffff;">your trading caught our attention</strong>.
                </p>

                <p style="color: #e5e7eb; font-size: 16px; line-height: 1.8;">
                    While your recent evaluation didn't result in a pass, our team reviewed your trades and saw something we don't see often — <strong style="color: #8b5cf6;">real potential and solid strategy execution</strong>.
                </p>

                <!-- Stats Box -->
                <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)); border-left: 3px solid #6366f1; padding: 20px; margin: 30px 0; border-radius: 8px;">
                    <p style="color: #a78bfa; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">📊 WHY YOU QUALIFIED:</p>
                    <p style="color: #d1d5db; font-size: 14px; line-height: 1.6; margin: 0;">
                        ✓ Disciplined risk management<br>
                        ✓ Consistent trading approach<br>
                        ✓ Near-pass performance metrics
                    </p>
                </div>

                <p style="color: #e5e7eb; font-size: 16px; line-height: 1.8;">
                    That's exactly why you've been selected for our <strong style="color: #ffffff;">Second Chance Program</strong> — reserved exclusively for traders who demonstrated the skills but just need one more shot.
                </p>

            </td>
        </tr>

        <!-- Offer Box -->
        <tr>
            <td style="padding: 0 40px 40px 40px; background: #0d1128;">

                <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border: 2px solid #6366f1; border-radius: 12px; padding: 30px; position: relative; box-shadow: 0 0 30px rgba(99, 102, 241, 0.3);">

                    <!-- Corner Badge -->
                    <div style="position: absolute; top: -12px; right: 20px; background: linear-gradient(90deg, #ef4444, #f59e0b); padding: 6px 16px; border-radius: 20px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);">
                        <span style="color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 1px;">LIMITED OFFER</span>
                    </div>

                    <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 24px; font-weight: 700; text-align: center;">
                        Your Exclusive Offer
                    </h2>

                    <!-- Discount Badge -->
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div style="display: inline-block; background: rgba(139, 92, 246, 0.2); border: 2px dashed #8b5cf6; border-radius: 8px; padding: 20px 40px;">
                            <div style="color: #a78bfa; font-size: 14px; margin-bottom: 5px;">Second Chance Discount</div>
                            <div style="color: #ffffff; font-size: 48px; font-weight: 700; line-height: 1;">50<span style="font-size: 32px;">%</span></div>
                            <div style="color: #8b5cf6; font-size: 16px; font-weight: 600;">OFF</div>
                        </div>
                    </div>

                    <!-- Benefits List -->
                    <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <table width="100%" cellpadding="8" cellspacing="0">
                            <tr>
                                <td style="color: #3b82f6; font-size: 18px; width: 30px;">🎯</td>
                                <td style="color: #e5e7eb; font-size: 14px;">Fresh evaluation account</td>
                            </tr>
                            <tr>
                                <td style="color: #3b82f6; font-size: 18px;">⚡</td>
                                <td style="color: #e5e7eb; font-size: 14px;">Priority support during your challenge</td>
                            </tr>
                            <tr>
                                <td style="color: #3b82f6; font-size: 18px;">💎</td>
                                <td style="color: #e5e7eb; font-size: 14px;">Bonus trading resources & strategy guide</td>
                            </tr>
                            <tr>
                                <td style="color: #3b82f6; font-size: 18px;">⏰</td>
                                <td style="color: #e5e7eb; font-size: 14px;">72-hour exclusive access window</td>
                            </tr>
                        </table>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin-top: 25px;">
                        <a href="[YOUR_ENROLLMENT_LINK]" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 8px; font-size: 18px; font-weight: 700; box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); transition: all 0.3s;">
                            CLAIM MY 50% DISCOUNT →
                        </a>
                    </div>

                </div>

            </td>
        </tr>

        <!-- Urgency Section -->
        <tr>
            <td style="padding: 0 40px 40px 40px; background: #0d1128;">

                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 20px; text-align: center;">
                    <p style="color: #fca5a5; margin: 0; font-size: 14px; line-height: 1.6;">
                        ⏳ <strong>This offer expires in 72 hours</strong> and is non-transferable.<br>
                        Only <strong>select traders</strong> receive this invitation — don't let it slip away.
                    </p>
                </div>

            </td>
        </tr>

        <!-- Personal Note -->
        <tr>
            <td style="padding: 0 40px 40px 40px; background: #0d1128;">

                <p style="color: #e5e7eb; font-size: 16px; line-height: 1.8;">
                    Here's the truth: <strong style="color: #ffffff;">we want to see you succeed</strong>. Your trading style aligns with what we look for in funded traders, and we believe you're just one solid evaluation away from a funded account.
                </p>

                <p style="color: #e5e7eb; font-size: 16px; line-height: 1.8;">
                    This isn't a generic offer — you earned this opportunity through your performance. Now it's your move.
                </p>

                <p style="color: #e5e7eb; font-size: 16px; line-height: 1.8; margin-bottom: 30px;">
                    Ready to show us what you've got?
                </p>

                <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin-bottom: 5px;">
                    Looking forward to your next trades,
                </p>
                <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0;">
                    [Your Name]<br>
                    <span style="color: #8b5cf6; font-size: 14px; font-weight: 400;">[Your Title] | [Your Prop Firm Name]</span>
                </p>

            </td>
        </tr>

        <!-- Footer -->
        <tr>
            <td style="padding: 30px 40px; background: #060714; border-radius: 0 0 12px 12px; border-top: 1px solid rgba(99, 102, 241, 0.2);">
                <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0; line-height: 1.6;">
                    Questions? Hit reply or contact us at [support@yourfirm.com]<br>
                    <span style="color: #4b5563;">This exclusive offer is valid for 72 hours from receipt.</span>
                </p>
            </td>
        </tr>

    </table>

</body>
</html>`;

    const subject = "You've Been Selected - Second Chance Program";

    await emailService.sendEmail('privacy.fund8r@gmail.com', subject, htmlContent);

    console.log('✅ Email sent successfully to privacy.fund8r@gmail.com');

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    process.exit(1);
  }
}

// Run the function
sendCustomEmail();
