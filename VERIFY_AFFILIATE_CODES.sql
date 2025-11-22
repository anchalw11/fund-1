-- ===================================================
-- Verify Affiliate Codes Assignment
-- ===================================================

-- Check total users vs users with affiliate codes
SELECT
    'Total Users' as metric,
    COUNT(*) as count
FROM user_profile
UNION ALL
SELECT
    'Users with Affiliate Codes',
    COUNT(DISTINCT a.user_id)
FROM affiliates a
UNION ALL
SELECT
    'Users without Affiliate Codes',
    COUNT(up.*)
FROM user_profile up
WHERE NOT EXISTS (
    SELECT 1 FROM affiliates a WHERE a.user_id = up.user_id
)
ORDER BY count DESC;

-- Show sample of affiliate codes created
SELECT
    a.affiliate_code,
    CONCAT(up.first_name, ' ', up.last_name) as full_name,
    up.friendly_id,
    au.email,
    a.commission_rate,
    a.status,
    a.created_at
FROM affiliates a
JOIN user_profile up ON up.user_id = a.user_id
JOIN auth.users au ON au.id = a.user_id
ORDER BY a.created_at DESC
LIMIT 20;

-- Summary by commission rate
SELECT
    commission_rate,
    COUNT(*) as user_count,
    ROUND(AVG(total_earnings), 2) as avg_earnings,
    MAX(total_earnings) as max_earnings
FROM affiliates
GROUP BY commission_rate
ORDER BY commission_rate DESC;
