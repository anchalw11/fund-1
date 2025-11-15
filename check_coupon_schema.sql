-- Check the current coupons table schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'coupons' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if validate_coupon function exists and what it looks like
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_name = 'validate_coupon' AND routine_schema = 'public';

-- Check current coupons data
SELECT * FROM coupons LIMIT 5;

-- Test the validate_coupon function directly
SELECT validate_coupon('FREETRIAL100', 'COMPETITION');
