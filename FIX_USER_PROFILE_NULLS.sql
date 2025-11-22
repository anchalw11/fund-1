-- Step 1: Insert missing user profiles from auth.users
INSERT INTO public.user_profile (user_id, email, friendly_id, email_verified, status, created_at)
SELECT
    u.id as user_id,
    u.email,
    'USER-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'), -- Generate a random friendly_id
    COALESCE(u.email_confirmed_at IS NOT NULL, false),
    'active',
    COALESCE(u.created_at, NOW())
FROM
    auth.users u
WHERE
    NOT EXISTS (
        SELECT 1 FROM public.user_profile up WHERE up.user_id = u.id
    );

-- Step 2: Update any existing user_profile records where email is NULL
UPDATE
    public.user_profile
SET
    email = (SELECT u.email FROM auth.users u WHERE u.id = public.user_profile.user_id)
WHERE
    email IS NULL;

-- Step 3: Update any existing user_profile records where friendly_id is NULL
UPDATE
    public.user_profile
SET
    friendly_id = 'USER-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0')
WHERE
    friendly_id IS NULL;
