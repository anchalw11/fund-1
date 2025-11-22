# 🚀 Quick Start Guide - Admin MT5 Panel

## 🎯 What You Need to Know

Your Fund8r platform is **100% operational** with full database integration. Here's everything you need to get started.

---

## 🔑 Access Information

### Database (Supabase)
- **URL**: https://cjjobdopkkbwexfxwosb.supabase.co
- **Dashboard**: https://supabase.com/dashboard
- **Status**: ✅ Connected and operational

### Email System
- **Email**: fund8r.forex@gmail.com
- **SMTP**: smtp.gmail.com:587
- **Status**: ✅ Configured and ready

### Backend API
- **URL**: https://fund-backend-pbde.onrender.com/api
- **Status**: ✅ Deployed and operational

---

## 🎮 How to Use Admin Panel

### Step 1: Access Admin Panel
1. Navigate to: `www.fund8r.com/admin/mt5`
2. You'll see the Admin MT5 Management Panel

### Step 2: View All Users
**What you'll see:**
- Complete list of all registered users
- User emails, names, and friendly IDs
- Registration dates
- Users from both databases (if applicable)

### Step 3: Handle Pending Challenges
**When a user purchases a challenge:**

1. It appears in "Pending Challenges" section (yellow/orange highlight)
2. You'll see:
   - ✉️ User email
   - 🆔 User friendly ID
   - 💰 Account size ($5K, $10K, $25K, etc.)
   - 🎯 Challenge type (Classic, Rapid Fire, etc.)
   - 💵 Amount paid
   - 📅 Purchase date

3. Click **"Assign MT5"** button

### Step 4: Assign MT5 Credentials
**Modal will open showing:**
- Challenge details
- User information
- Form to enter MT5 credentials

**Fill in:**
1. **MT5 Login**: Enter the account number (e.g., 123456789)
2. **Password**: Auto-generated or enter custom (e.g., Abc123!@#)
   - Click 🎲 to generate random secure password
3. **Server**: Enter server name (e.g., MetaQuotes-Demo)

4. Click **"Assign MT5 Credentials"**

**What happens:**
- ✅ Credentials saved to database
- ✅ Challenge moves to "All MT5 Accounts"
- ✅ Status shows "Pending" (credentials not sent yet)
- ✅ User CANNOT see credentials yet

### Step 5: Send Credentials to User
1. Find the account in "All MT5 Accounts" section
2. Verify the credentials are correct
3. Click **"Send Credentials"** button

**What happens:**
- ✅ Status changes to "Sent"
- ✅ Credentials become visible to user in their dashboard
- ✅ Email sent to user with credentials (if SMTP configured)
- ✅ MT5 account entry created for analytics
- ✅ User can now start trading

---

## 📊 Admin Panel Sections

### 1. MT5 Accounts Tab
- View all assigned accounts
- Send credentials to users
- Copy credentials for reference
- See account status (sent/pending)

### 2. Manual Certificates Tab
- Send custom certificates
- Welcome certificates
- Challenge completion certificates
- Funded trader certificates

### 3. Competitions Tab
- Create trading competitions
- Manage active competitions
- Set prize pools and rules

### 4. User Profile 360° Tab
- View complete user information
- See trading history
- Check account status
- Review challenge progress

### 5. Manual Breach Tab
- Manually breach accounts if needed
- Select user
- Search their accounts
- Choose breach reason
- Execute breach

### 6. Affiliate Management Tab
- View all affiliates
- Approve/reject payout requests
- Track referrals and earnings
- Manage affiliate status

---

## 🔍 What Users See

### Before Credentials Sent:
```
Dashboard shows:
- Challenge purchased ✅
- Status: "Pending Setup"
- Message: "Your MT5 credentials will be sent within 24 hours"
- Certificates available for download
```

### After Credentials Sent:
```
Dashboard shows:
- Challenge active ✅
- MT5 Login: 123456789
- MT5 Password: ********** (show/hide toggle)
- MT5 Server: MetaQuotes-Demo
- Account Size: $10,000
- Download MT5 button
- Trade Now button
```

---

## 📧 Automated Emails

Users automatically receive emails for:

1. **Signup** → Verification code email
2. **Email Verified** → Welcome email with welcome certificate
3. **Purchase Challenge** → Purchase confirmation with:
   - Challenge certificate PDF
   - Purchase invoice PDF
   - Payment receipt PDF
4. **Credentials Sent** → MT5 credentials email with login details

**Note**: All emails use professional templates with your branding.

---

## 🎫 Coupon System

### Active Coupons:
- **FREETRIAL100** - 100% discount (completely free)
- **WELCOME50** - 50% discount

### How It Works:
1. User enters coupon at checkout
2. System validates coupon from database
3. Discount applied automatically
4. Usage tracked in database
5. One coupon per purchase

---

## 💾 Database Tables You Should Know

### Critical Tables:
1. **user_profile** - All user information
2. **user_challenges** - All purchased challenges
3. **payments** - All payment records
4. **mt5_accounts** - MT5 account analytics
5. **downloads** - All certificates and documents

### To View Data:
1. Go to: https://supabase.com/dashboard
2. Select your project: cjjobdopkkbwexfxwosb
3. Click "Table Editor"
4. Select table to view/edit data

---

## 🛠️ Common Tasks

### Task: Find a Specific User
```
1. Go to Admin MT5 Panel
2. Use search bar (🔍)
3. Search by: email, name, or friendly ID
4. View user's challenges and accounts
```

### Task: Check If User Paid
```
1. Go to Supabase Dashboard
2. Open "payments" table
3. Search for user_id or email
4. Check status column = "completed"
```

### Task: Manually Create Certificate
```
1. Go to Admin MT5 Panel
2. Click "Manual Certificates" tab
3. Select user
4. Choose certificate type
5. Click "Send Certificate"
```

### Task: View All Purchases Today
```
1. Go to Supabase Dashboard
2. Open "user_challenges" table
3. Filter by purchase_date >= today
4. See all new purchases
```

---

## ⚠️ Important Notes

### Security:
- 🔒 Never share service role key
- 🔒 Users can only see their own data
- 🔒 Admin panel requires admin role in database
- 🔒 All credentials are encrypted

### Best Practices:
- ✅ Assign credentials within 24 hours of purchase
- ✅ Verify account details before sending
- ✅ Double-check MT5 login numbers
- ✅ Use strong passwords (auto-generated recommended)
- ✅ Send welcome email after verification

### Troubleshooting:
- If user doesn't appear → Check user_profile table
- If challenge doesn't show → Check user_challenges table
- If credentials don't send → Check browser console
- If email doesn't arrive → Check SMTP logs (backend)

---

## 📞 Quick Support Checklist

### User says "I didn't receive credentials":
1. Check Admin MT5 panel - is it marked "Sent"?
2. Check user's email inbox (and spam)
3. Verify email address is correct in database
4. Resend by clicking "Send Credentials" again

### User says "I can't see my purchase":
1. Check payments table - payment completed?
2. Check user_challenges table - record exists?
3. Verify user_id matches in both tables
4. Check user's dashboard - does it show?

### User says "I can't login to MT5":
1. Verify credentials in admin panel
2. Check MT5 server name is correct
3. Ensure user is using correct login/password
4. Test credentials yourself on MT5

---

## 🎉 You're All Set!

Your system is fully operational:
- ✅ Database connected
- ✅ All pages working
- ✅ Admin panel functional
- ✅ Email system ready
- ✅ Payment flow complete
- ✅ MT5 management active

**Go to**: www.fund8r.com/admin/mt5 and start managing your users!

---

## 📚 Additional Resources

- **Full Setup Guide**: `COMPLETE_SETUP_VERIFICATION.md`
- **Database Status**: `DATABASE_CONNECTION_STATUS.md`
- **Technical Docs**: `TASK_COMPLETION_STATUS.md`
- **Backend Setup**: `BACKEND_SETUP.md`

---

**Need Help?** Check the console logs (F12 → Console) for detailed information.

**Last Updated**: October 2024
**Status**: 🟢 OPERATIONAL
