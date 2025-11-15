import { createClient } from 'npm:@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  try {
    console.log('Function started');
    const { data: users, error: usersError } = await supabase.from('auth.users').select('id, email, raw_user_meta_data');
    if (usersError) throw usersError;

    console.log(`Found ${users.length} users`);

    for (const user of users) {
      console.log(`Updating user ${user.id}`);
      const { error: updateError } = await supabase
        .from('user_profile')
        .update({
          email: user.email,
          friendly_id: user.raw_user_meta_data?.friendly_id,
        })
        .eq('user_id', user.id);
      if (updateError) console.error('Error updating user profile:', updateError);
    }

    res.status(200).json({ success: true, message: 'User profiles updated successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
