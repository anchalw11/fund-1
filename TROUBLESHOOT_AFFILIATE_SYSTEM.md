# 🔍 AFFILIATE SYSTEM TROUBLESHOOTING GUIDE

## Quick Tests to Identify the Issue

### Test 1: Check Database Tables
Run in Supabase SQL Editor:
```sql
-- Check if affiliates table exists and has correct column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'affiliates'
ORDER BY ordinal_position;
```

**Expected Result:**
```
column_name      data_type     is_nullable
id              uuid          NO
user_id         uuid          NO
affiliate_code   text         NO  <-- This must exist (not referral_code)
commission_rate numeric       YES
...
```

### Test 2: Check Affilliate Data
Run in SQL Editor:
```sql
SELECT COUNT(*) as total_affiliates
FROM affiliates
WHERE affiliate_code IS NOT NULL AND affiliate_code != '';

SELECT affiliate_code, commission_rate, status
FROM affiliates
WHERE affiliate_code IS NOT NULL
LIMIT 5;
```

**Expected Result:**
```
total_affiliates: 57 (or however many users you have)
affiliate_code | commission_rate | status
JOHDOE1245    | 10.00          | active
MRKER7892     | 10.00          | active
ABCU1234      | 10.00          | active
...
```

### Test 3: Test API Endpoints
Run locally or test with curl:

```bash
# Test affiliate stats endpoint
curl -s "https://fund-backend-pbde.onrender.com/api/affiliates/stats/YOUR_USER_ID" | jq

# Expected response (when working):
{
  "success": true,
  "data": {
    "affiliate_code": "JOHDOE1245",
    "commission_rate": 10,
    "total_referrals": 0,
    ...
  }
}
```

### Test 4: Check Deployment Status
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find `fund-backend-pbde` service
3. Check:
   - **Branch**: Must be `email-verification`
   - **Status**: Must show "Deployed" (green checkmark)
   - **Logs**: Check for any startup errors

### Test 5: Check Broswer Console
When visiting `/affiliate` page:
1. Press F12 → Console tab
2. Look for error messages
3. Reload the page
4. Check network tab for failed API calls

## 🔧 Solutions by Issue

### If SQL Test 1 fails (column missing):
```sql
-- Run this in Supabase SQL Editor BEFORE anything else
ALTER TABLE affiliates RENAME COLUMN referral_code TO affiliate_code;
```

### If SQL Test 2 fails (no affiliate data):
Run the entire contents of `ASSING_AFFILIATE_CODES_TO_ALL_USERS.sql`

### If API Test 3 fails (500 errors):
- Check if `email-verification` branch is deployed
- Check Render logs for startup errors
- Look at browser console for detailed errors

### If Browser Test 5 fails:
- Clear browser cache (Ctrl+F5)
- Try incognito/private mode
- Check if you're authenticated in the app

## 🚀 Step-by-Step Fix

### Step 1: Quick Database Check
Run Test 1 above - if `affiliate_code` column missing, run the ALTER command.

### Step 2: Assign Codes if Missing
Run Test 2 above - if total_affiliates is 0, run the assignment script.

### Step 3: Force Deploy Latest Code
1. Go to Render dashboard
2. Switch to `email-verification` branch
3. Click "Manual Deploy"
4. Wait 2-3 minutes

### Step 4: Test & Verify
- Run API Test 3
- Refresh your `/affiliate` dashboard
- Check browser console

## 📊 Expected Working Result

**Browser Console:**
```
✅ AFFILIATES ROUTES MODULE LOADED AT: [timestamp]
Affiliate stats loaded successfully
```

**Dashboard Shows:**
- Your affiliate code: `JOHDOE1245`
- Commission rate: 10%
- Referral link: `fund8r.com/signup?ref=JOHDOE1245`
- Stats section with 0 referrals (initially)

**If you tell me which test fails, I can provide the exact fix!**
