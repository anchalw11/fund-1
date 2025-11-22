-- RUN THIS IN: https://supabase.com/dashboard/project/cjjobdopkkbwexfxwosb/sql/new

-- ============================================================
-- DISABLE PROBLEMATIC TRIGGERS CAUSING SIGNUP FAILURE
-- ============================================================

-- Found these problematic triggers:
-- 1. on_auth_user_created -> auto_create_user_profile() - FAILS with profile creation
-- 2. create_affiliate_on_user_insert -> trigger_create_affiliate_for_new_user() - POSSIBLY FAILING TOO

-- Disable the profile creation trigger (we'll create profiles manually later)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS auto_create_user_profile();

-- Disable the affiliate creation trigger too (just in case it also fails)
DROP TRIGGER IF EXISTS create_affiliate_on_user_insert ON auth.users;
DROP FUNCTION IF EXISTS trigger_create_affiliate_for_new_user();

-- Verify triggers are gone
SELECT
    event_object_table,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
    AND event_object_table = 'users'
ORDER BY trigger_name;

-- Test basic signup capability
-- The user will be created without automatic profile/affiliate setup
-- We can create these manually later when the user accesses features that need them

