# Quick Start Guide - New Features

## 🚀 Server is Already Running!

- **Backend API**: http://localhost:5000
- **Frontend App**: http://localhost:5173
- **Status**: ✅ Both servers are running

## 📋 What's Been Implemented

### ✅ Completed Features

1. **Affiliate System with Unique Links**
   - Every user gets a unique referral code
   - 10% base commission (increases to 20% after 50 referrals)
   - Minimum $100 payout
   - Automatic tier upgrades

2. **Free Mini Challenge**
   - $2,000 virtual capital
   - 7-day duration
   - $100 profit target
   - 20% discount on completion

3. **Badge System**
   - 6 badge types with 3 tiers (normal, good, premium)
   - Speed badges, payout badges
   - Leaderboard ready

4. **Subscription Plans**
   - Monthly plans from $69 to $2,699
   - Quarterly plans with 2.5x pricing
   - VIP plans $997-$2,997
   - Unlimited retries on all plans

5. **Buy 2 Get 1 Free**
   - For accounts $10k+
   - Classic and Rapid Fire only
   - 30-day validity

## 🔧 How to Test Features

### Test the Affiliate System

1. **Open your browser**: http://localhost:5173/dashboard
2. **Navigate to Affiliate section** in the dashboard
3. **Your referral link will show**:
   ```
   https://fund8r.com?ref=YOUR_CODE
   ```
4. **Test commission**: Use the API endpoint
   ```bash
   curl -X POST http://localhost:5000/api/affiliates/record-purchase \
     -H "Content-Type: application/json" \
     -d '{
       "referral_code":"YOUR_CODE",
       "user_id":"test-user-123",
       "purchase_amount":500
     }'
   ```

### Test Mini Challenge

1. **Visit**: http://localhost:5173/mini-challenge
2. **Click**: "Start Free Challenge Now"
3. **See your demo account** with:
   - $2,000 balance
   - $100 profit target
   - 7 days to complete
   - Discount code for 20% off

### Test Subscription Plans

```bash
# Get all pricing
curl http://localhost:5000/api/subscriptions/pricing

# Create a subscription
curl -X POST http://localhost:5000/api/subscriptions/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"YOUR_USER_ID",
    "plan_type":"classic",
    "account_size":10000,
    "billing_cycle":"monthly"
  }'
```

### Test Badge System

```bash
# Award yourself a badge
curl -X POST http://localhost:5000/api/badges/award \
  -H "Content-Type: application/json" \
  -d '{
    "user_id":"YOUR_USER_ID",
    "badge_type":"payout_legend",
    "badge_tier":"premium"
  }'

# View badges
curl http://localhost:5000/api/badges/user/YOUR_USER_ID

# View leaderboard
curl http://localhost:5000/api/badges/leaderboard
```

## 📊 API Documentation

### Affiliate Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/affiliates/create` | Create affiliate account |
| GET | `/api/affiliates/:user_id` | Get affiliate info |
| GET | `/api/affiliates/stats/:user_id` | Get stats |
| POST | `/api/affiliates/record-purchase` | Record purchase |
| POST | `/api/affiliates/request-payout` | Request payout |

### Mini Challenge Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mini-challenges/create` | Create mini challenge |
| GET | `/api/mini-challenges/user/:id` | Get user challenges |
| POST | `/api/mini-challenges/complete` | Complete challenge |

### Badge Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/badges/award` | Award badge |
| GET | `/api/badges/user/:id` | Get user badges |
| GET | `/api/badges/leaderboard` | Get leaderboard |

### Subscription Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscriptions/create` | Create subscription |
| GET | `/api/subscriptions/user/:id` | Get subscriptions |
| POST | `/api/subscriptions/cancel` | Cancel subscription |
| GET | `/api/subscriptions/pricing` | Get pricing |

### Promotion Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/promotions/buy2get1` | Create Buy 2 Get 1 |
| GET | `/api/promotions/user/:id` | Get promotions |
| POST | `/api/promotions/use` | Use promotion |

## 🗄️ Database Tables

All these tables are already created:

- `affiliates` - Affiliate accounts
- `affiliate_referrals` - Referral tracking
- `affiliate_payouts` - Payout requests
- `mini_challenges` - Free demo challenges
- `user_badges` - Badge achievements
- `subscription_plans` - Subscription management
- `promotional_offers` - Promo tracking
- `second_chance_offers` - Retry offers (ready for use)
- `email_sequences` - Email automation (ready for use)
- `exit_intent_offers` - Exit popups (ready for use)

## 🎯 Badge Types Available

### Speed Badges
- `speed_demon_3day` (Premium) - Pass in under 3 days
- `fast_passer_30day` (Good) - Pass in under 30 days

### Payout Badges
- `payout_starter` (Normal) - $100-$1,000
- `payout_achiever` (Good) - $1,000-$5,000
- `payout_master` (Really Good) - $5,000-$10,000
- `payout_legend` (Premium) - Above $10,000

## 💰 Subscription Pricing

### Classic Plans (Monthly)
```
$5k   → $69/month
$10k  → $134/month
$25k  → $339/month
$50k  → $684/month
$100k → $1,349/month
$200k → $2,699/month
```

### Quarterly (3 months)
```
$5k   → $172.50
$10k  → $335
$25k  → $847.50
$50k  → $1,710
$100k → $3,372.50
$200k → $6,747.50
```

### VIP Plans (2 months)
```
Basic   → $997
Premium → $1,497
Elite   → $2,997
```

## 🔍 Viewing Your Work

### Main Pages
- Dashboard: http://localhost:5173/dashboard
- Mini Challenge: http://localhost:5173/mini-challenge
- Affiliate: http://localhost:5173/affiliate
- Pricing: http://localhost:5173/pricing

### API Health Check
```bash
curl http://localhost:5000/health
```

### View Backend Logs
```bash
tail -f /tmp/cc-agent/59289631/project/backend/server.log
```

## ⚠️ Important Notes

1. **Affiliate Links**:
   - Automatically generated unique codes
   - Commission tier upgrades automatically
   - 50+ referrals = 20% commission

2. **Mini Challenges**:
   - Only one active per user
   - Generates discount code on completion
   - No payment required

3. **Subscriptions**:
   - Unlimited retries included
   - Monthly or quarterly billing
   - Auto-renewal tracking

4. **Buy 2 Get 1 Free**:
   - Must be $10k+ accounts
   - Only Classic/Rapid Fire
   - Automatic validation

## 🐛 Troubleshooting

### If affiliate link shows "LOADING"
```bash
# The function might need time to be discovered by PostgREST
# Wait 5-10 minutes, or create affiliate manually:
curl -X POST http://localhost:5000/api/affiliates/create \
  -H "Content-Type: application/json" \
  -d '{"user_id":"YOUR_USER_ID"}'
```

### If API returns errors
```bash
# Check backend is running
curl http://localhost:5000/health

# Check logs
tail -50 backend/server.log
```

### Database Issues
- All tables are created
- RLS policies are set
- Functions are available

## 📈 Next Steps

To complete the remaining features:

1. **Second Chance System** - Frontend UI needed
2. **Email Sequences** - Email service integration
3. **Exit-Intent Popups** - Frontend component
4. **Admin Dashboard** - Approval workflows
5. **Payment Integration** - Subscription billing

## 🎉 You're All Set!

The core systems are implemented and running. Visit http://localhost:5173 to see everything in action!

For detailed implementation details, see `IMPLEMENTATION_SUMMARY.md`.
