-- RUN THIS IN: https://supabase.com/dashboard/project/cjjobdopkkbwexfxwosb/sql/new

-- ============================================================
-- DEBUG SIGNUP ISSUE - Check all constraints and schema
-- ============================================================

-- Check user_profile table structure and constraints
SELECT
    c.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    tc.constraint_type,
    tc.constraint_name
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage kcu
    ON c.table_name = kcu.table_name AND c.column_name = kcu.column_name
LEFT JOIN information_schema.table_constraints tc
    ON kcu.constraint_name = tc.constraint_name
WHERE c.table_name = 'user_profile'
ORDER BY c.ordinal_position;

-- Check if trigger exists and works
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profile';

-- Try to manually insert with same data the trigger uses
-- (This will tell us exactly what's failing)
SELECT 'Testing manual profile insert...' as test;
INSERT INTO user_profile (
    user_id,
    email,
    friendly_id,
    email_verified,
    status,
    kyc_status,
    created_at
) VALUES (
    '11111111-2222-3333-4444-555555555555'::uuid,
    'debug@example.com',
    'DEBUG-TEST',
    false,
    'active',
    'pending',
    NOW()
)
ON CONFLICT (user_id) DO NOTHING;

-- Check what was inserted
SELECT * FROM user_profile WHERE email = 'debug@example.com';

-- Clean up test data
DELETE FROM user_profile WHERE email = 'debug@example.com';

-- Check auth.users table structure for the metadata
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;

-- Try to see what raw_user_meta_data looks like
SELECT
    id,
    email,
    raw_user_meta_data,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 3;

-- Check if email field in user_profile has unique constraint
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'user_profile' AND constraint_type = 'UNIQUE';
