# Fund8r Email System with Certificate Generation

## Overview

Complete email notification system with professional certificate generation using Canvas. Features lion-themed certificates and HTML email templates.

## Features

✅ **Email Types**
- Verification codes (6-digit)
- Sign-in codes (6-digit)
- Welcome emails with certificates
- Passing/Achievement certificates
- Payout notifications with certificates

✅ **Certificate Generation**
- 1920x1080 PNG certificates
- Lion emoji branding (🦁)
- Gold and purple gradient designs
- Dynamic user data insertion
- Professional layouts

✅ **SMTP Integration**
- Gmail SMTP configured
- Automatic fallback to console logging
- Error handling and retry logic

## Installation

Dependencies are already installed:
```bash
cd backend
npm install nodemailer canvas handlebars
```

## Configuration

SMTP credentials are in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=fund8r.forex@gmail.com
SMTP_PASSWORD=taaacfxyuztonswc
```

## API Endpoints

### Base URL: `/api/email`

### 1. Send Verification Code
```bash
POST /api/email/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}

Response:
{
  "success": true,
  "message": "Verification code sent successfully",
  "code": "123456"
}
```

### 2. Send Sign-In Code
```bash
POST /api/email/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "ipAddress": "192.168.1.1"
}

Response:
{
  "success": true,
  "message": "Sign-in code sent successfully",
  "code": "654321"
}
```

### 3. Send Welcome Email with Certificate
```bash
POST /api/email/welcome
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "accountId": "FX-2024-001"
}

Response:
{
  "success": true,
  "message": "Welcome email with certificate sent successfully"
}
```

### 4. Send Passing Certificate
```bash
POST /api/email/passing
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "phase": "Phase 1 - Evaluation",
  "profit": "12.5%",
  "drawdown": "3.2%"
}

Response:
{
  "success": true,
  "message": "Passing certificate sent successfully"
}
```

### 5. Send Payout Notification
```bash
POST /api/email/payout
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "amount": "5,000.00",
  "transactionId": "PAY-2024-001",
  "arrivalTime": "1-3 business days"
}

Response:
{
  "success": true,
  "message": "Payout notification sent successfully"
}
```

### 6. Test Endpoint
```bash
POST /api/email/test
Content-Type: application/json

{
  "email": "your-email@example.com"
}

Response:
{
  "success": true,
  "message": "Test email sent successfully! Check your inbox."
}
```

## Usage Examples

### From JavaScript/TypeScript

```javascript
// Send welcome email
const response = await fetch('http://localhost:5000/api/email/welcome', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'trader@example.com',
    name: 'John Doe',
    accountId: 'FX-2024-001'
  })
});

const result = await response.json();
console.log(result);
```

### From cURL

```bash
# Test the email system
curl -X POST http://localhost:5000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'

# Send welcome email
curl -X POST http://localhost:5000/api/email/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trader@example.com",
    "name": "John Doe",
    "accountId": "FX-2024-001"
  }'
```

## File Structure

```
backend/
├── config/
│   └── email.config.js          # Email configuration
├── services/
│   ├── certificateGenerator.js  # Canvas-based certificate generation
│   └── emailService.js          # Email sending with templates
├── templates/
│   └── email/
│       ├── welcome.html         # Welcome email template
│       ├── verification.html    # Verification code template
│       └── signin.html          # Sign-in code template
└── routes/
    └── email.js                 # Email API endpoints
```

## Certificate Designs

### Welcome Certificate
- Linear gradient background (dark blue → purple → blue)
- Gold decorative borders
- Lion logo at top
- Enrollment confirmation
- Account ID display

### Passing Certificate
- Radial gradient background
- Star decorations
- Achievement title
- Profit and drawdown stats
- Completion date

### Payout Certificate
- Premium horizontal gradient
- Gold border with pattern overlay
- Large amount display
- Transaction ID
- Company branding

## Color Palette

```javascript
colors: {
  purple: '#7C3AED',
  darkBlue: '#1E3A8A',
  blue: '#3B82F6',
  white: '#FFFFFF',
  gold: '#FFD700'
}
```

## Integration with Existing System

### Send Welcome Email After Signup
```javascript
import emailService from './backend/services/emailService.js';

// After user signs up
await emailService.sendWelcomeWithCertificate({
  email: user.email,
  name: user.full_name,
  accountId: user.friendly_id
});
```

### Send Verification Code
```javascript
const code = await emailService.sendVerificationCode({
  email: user.email,
  name: user.name
});

// Store code in database or session for verification
```

### Send Passing Certificate
```javascript
await emailService.sendPassingCertificate({
  email: user.email,
  name: user.name,
  phase: 'Phase 1',
  profit: '15%',
  drawdown: '4%'
});
```

### Send Payout Notification
```javascript
await emailService.sendPayoutNotification({
  email: user.email,
  name: user.name,
  amount: '5,000.00',
  transactionId: payoutId
});
```

## Troubleshooting

### Emails Not Sending

1. Check SMTP credentials in `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=fund8r.forex@gmail.com
   SMTP_PASSWORD=taaacfxyuztonswc
   ```

2. Check console logs - system will log emails if SMTP not configured

3. Gmail App Password: Make sure you're using an App Password, not regular password

### Certificate Generation Errors

1. Canvas dependency installed: `npm install canvas`
2. Check system has required dependencies for canvas (node-gyp, python)
3. Certificate generator properly imported

### Template Errors

1. HTML templates exist in `backend/templates/email/`
2. Handlebars properly installed: `npm install handlebars`
3. Templates loaded on service initialization

## Production Deployment

1. **Environment Variables**: Set SMTP credentials in production environment

2. **Rate Limiting**: Email endpoints have rate limiting in place

3. **Error Handling**: All endpoints have try-catch blocks

4. **Logging**: Successful sends logged to console

5. **Fallback**: System gracefully handles SMTP failures

## Testing

### Quick Test
```bash
# Start backend server
cd backend
npm start

# In another terminal, test email
curl -X POST http://localhost:5000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com"}'
```

### Check Server Logs
Look for:
- ✅ Email service configured with SMTP
- ✅ Welcome email with certificate sent to...
- ✅ Verification code sent to...

## Support

For issues:
1. Check server console logs
2. Verify SMTP credentials
3. Ensure dependencies installed
4. Test with `/api/email/test` endpoint

## Future Enhancements

- [ ] Queue system for bulk emails (Bull + Redis)
- [ ] Email analytics and tracking
- [ ] More certificate designs
- [ ] Custom branding per challenge type
- [ ] Email preferences management
- [ ] Unsubscribe functionality
