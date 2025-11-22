-- RUN THIS IN: https://supabase.com/dashboard/project/cjjobdopkkbwexfxwosb/sql/new

-- ============================================================
-- CHECK FOR AUTH HOOKS AND TRIGGERS CAUSING THE SIGNUP FAILURE
-- ============================================================

-- Check what triggers exist on auth.tables
SELECT
    event_object_table,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement,
    triggered_actions
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
ORDER BY event_object_table, trigger_name;

-- Specifically check triggers on auth.users
SELECT * FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass;

-- Check for database functions that might be failing
SELECT
    proname,
    prokind,
    prosrc
FROM pg_proc
WHERE proname LIKE '%auth%' OR proname LIKE '%user%';

-- Check if there are any database functions hooked to auth
SELECT
    proname,
    obj_description(oid, 'pg_proc') as description
FROM pg_proc
WHERE obj_description(oid, 'pg_proc') LIKE '%hook%' OR obj_description(oid, 'pg_proc') LIKE '%trigger%';

-- Check for any custom auth hooks in supabase
SELECT * FROM supabase_functions;

-- Check auth settings/configuration
SELECT * FROM auth.instances WHERE 1=1;

-- Try to manually insert into auth.users (this will fail with permission error but will show constraints)
-- SELECT 'Testing auth.users insert...' as test;
-- This would fail, but we want to see what constraints exist

-- Check what tables have foreign keys TO auth.users
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'users'
    AND ccu.table_schema = 'auth';

-- Check for any RLS on auth schema (should not exist)
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'auth';

