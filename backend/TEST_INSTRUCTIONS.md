# 🧪 Email System Testing Instructions

## ✅ System Status

The backend server is now running and the email system is **fully operational**!

## 🚀 Quick Test (30 seconds)

### Test 1: Verification Code Email
```bash
curl -X POST http://localhost:5000/api/email/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL@gmail.com","name":"Your Name"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Verification code sent successfully",
  "code": "123456"
}
```

### Test 2: Welcome Email with Futuristic Certificate
```bash
curl -X POST http://localhost:5000/api/email/welcome \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL@gmail.com","name":"Your Name","accountId":"FX-2025-ELITE-001"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Welcome email with certificate sent successfully"
}
```

**What you'll receive:**
- Beautiful futuristic email with cyberpunk design
- Glowing lion logo
- Neon purple/blue theme
- PNG certificate attachment (1920x1080)

### Test 3: Passing Certificate
```bash
curl -X POST http://localhost:5000/api/email/passing \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL@gmail.com","name":"Your Name","phase":"Phase 1","profit":"15.5%","drawdown":"3.2%"}'
```

**What you'll get:**
- "ACHIEVEMENT UNLOCKED" futuristic certificate
- Stats dashboard with neon effects
- Purple and blue glow effects

### Test 4: Payout Notification
```bash
curl -X POST http://localhost:5000/api/email/payout \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL@gmail.com","name":"Your Name","amount":"5,000.00","transactionId":"PAY-2025-001"}'
```

**What you'll get:**
- Ultra-premium payout certificate
- Huge glowing amount in gold
- Holographic transaction details

## 📝 All Available Endpoints

### 1. `/api/email/verify` - Verification Code
```bash
curl -X POST http://localhost:5000/api/email/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "User Name"
  }'
```

### 2. `/api/email/signin` - Sign-In Code
```bash
curl -X POST http://localhost:5000/api/email/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "User Name",
    "ipAddress": "192.168.1.1"
  }'
```

### 3. `/api/email/welcome` - Welcome + Certificate
```bash
curl -X POST http://localhost:5000/api/email/welcome \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "accountId": "FX-2025-001"
  }'
```

### 4. `/api/email/passing` - Passing Certificate
```bash
curl -X POST http://localhost:5000/api/email/passing \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "phase": "Phase 1 - Elite",
    "profit": "15%",
    "drawdown": "3%"
  }'
```

### 5. `/api/email/payout` - Payout Notification
```bash
curl -X POST http://localhost:5000/api/email/payout \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "amount": "5,000.00",
    "transactionId": "PAY-2025-001"
  }'
```

### 6. `/api/email/test` - Quick Test
```bash
curl -X POST http://localhost:5000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

## 🎨 What You'll See

### Email Design Features:
✅ **Dark cyberpunk theme** - Black, dark blue, purple gradients
✅ **Glowing lion logo** - Golden aura effect
✅ **Neon borders** - Purple and blue glow
✅ **Animated elements** - Gradient bars, shimmer effects
✅ **Tech-styled boxes** - Holographic information displays
✅ **Responsive design** - Works on all devices

### Certificate Features:
✅ **1920x1080 resolution** - Professional quality
✅ **Hexagonal patterns** - Sci-fi aesthetic
✅ **Futuristic grid** - Tech background
✅ **Neon glow effects** - 20-50px blur with multiple layers
✅ **Multiple borders** - Purple, blue, gold accents
✅ **Corner decorations** - Golden L-shaped accents
✅ **Stats dashboards** - For passing/payout certificates

## 🔍 Check Server Logs

To see what's happening:
```bash
tail -f server.log
```

You'll see:
- ✅ Email sent confirmations
- ✅ Certificate generation logs
- ✅ SMTP connection status

## 🛠️ Troubleshooting

### If emails don't arrive:

1. **Check spam folder** - Gmail might flag first email
2. **Check server logs** - `tail -f server.log`
3. **Verify SMTP** - Should see "✅ Email service configured"
4. **Try different email** - Some providers block automated emails

### Server not responding?

```bash
# Check if server is running
ps aux | grep node

# Restart if needed
kill $(cat server.pid)
npm start
```

## 📊 Expected Results

When you send a test email, you should:

1. **Get immediate API response** (< 1 second)
   ```json
   {"success": true, "message": "Email sent"}
   ```

2. **See server log** (within 2 seconds)
   ```
   ✅ Welcome email with certificate sent to your-email@gmail.com
   ```

3. **Receive email** (within 30 seconds)
   - Futuristic design
   - Glowing elements
   - Certificate attached (PNG)

## 🎯 Quick Copy-Paste Test

**Replace `YOUR_EMAIL@gmail.com` with your actual email:**

```bash
# Test all endpoints at once
EMAIL="YOUR_EMAIL@gmail.com"

echo "Testing verification code..."
curl -X POST http://localhost:5000/api/email/verify \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"name\":\"Test User\"}"

sleep 2

echo -e "\n\nTesting welcome email..."
curl -X POST http://localhost:5000/api/email/welcome \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"name\":\"Test User\",\"accountId\":\"FX-TEST-001\"}"

echo -e "\n\n✅ Tests complete! Check your email inbox."
```

## 📧 What the Emails Look Like

### Verification Code Email:
```
┌─────────────────────────────────┐
│  [Animated gradient bar]        │
│                                  │
│         🦁 [Glowing lion]       │
│     VERIFICATION CODE            │
│                                  │
│  ┌─────────────────────────┐   │
│  │                          │   │
│  │      [Huge code]        │   │
│  │       720855            │   │
│  │  [With neon glow]       │   │
│  └─────────────────────────┘   │
│                                  │
│  ⏱️ Expires in 10 minutes       │
│                                  │
│  🛡️ Security Notice             │
│  • Never share this code        │
│  • Fund8r won't ask for it      │
└─────────────────────────────────┘
```

### Welcome Email:
```
┌─────────────────────────────────┐
│  [Animated gradient bar]        │
│                                  │
│         🦁 [Glowing lion]       │
│     WELCOME TO FUND8R           │
│    Elite Trading Program         │
│                                  │
│  Welcome, [Your Name]!          │
│                                  │
│  ┌─────────────────────────┐   │
│  │   Your Account ID        │   │
│  │   FX-2025-ELITE-001      │   │
│  │   [Neon tech box]        │   │
│  └─────────────────────────┘   │
│                                  │
│  What's Next?                   │
│  🦁 Review challenge rules      │
│  🦁 Access MT5 credentials      │
│  🦁 Start trading               │
│                                  │
│  [Launch Dashboard Button]      │
│                                  │
│  📎 Certificate attached         │
└─────────────────────────────────┘
```

## ✅ System is Ready!

Your futuristic email system is fully operational and ready to send stunning cyberpunk-themed emails with professional certificates!

**Just run any of the curl commands above with your email address to see it in action!**
