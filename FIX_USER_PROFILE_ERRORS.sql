UPDATE user_profile
SET
  email = (SELECT email FROM auth.users WHERE user_profile.user_id = auth.users.id),
  friendly_id = (SELECT raw_user_meta_data->>'friendly_id' FROM auth.users WHERE user_profile.user_id = auth.users.id)
WHERE
  user_id IN (SELECT id FROM auth.users);
