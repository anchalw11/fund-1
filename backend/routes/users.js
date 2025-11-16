import express from 'express';
import { supabase, boltSupabase, oldSupabase } from '../config/supabase.js';

const router = express.Router();

router.post('/profile', async (req, res) => {
  try {
    const { user_id, email, first_name, last_name, friendly_id } = req.body;

    if (!user_id || !email) {
      return res.status(400).json({
        success: false,
        error: 'user_id and email are required'
      });
    }

    // This endpoint was conflicting with the database trigger `auto_create_user_profile`.
    // The trigger is the correct way to create a user profile atomically on signup.
    // This endpoint is changed to only UPDATE existing profiles with non-critical data
    // to prevent race conditions and data loss.

    const profileData = {};
    if (first_name) profileData.first_name = first_name;
    if (last_name) profileData.last_name = last_name;
    if (email) profileData.email = email;
    if (friendly_id) profileData.friendly_id = friendly_id;

    // If there's nothing to update, we can just return success.
    // The profile is already created by the trigger.
    if (Object.keys(profileData).length === 0) {
      return res.json({ success: true, data: { user_id }, message: "Profile created by trigger. No additional data to update." });
    }

    const { data, error } = await supabase
      .from('user_profile')
      .update(profileData)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in profile creation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/profile/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/profiles', async (req, res) => {
  try {
    const fetchProfiles = async (db, dbName) => {
      if (!db) {
        console.log(`DB client '${dbName}' not available, skipping.`);
        return [];
      }
      try {
        const { data, error } = await db.from('user_profile').select('user_id, email, first_name, last_name, friendly_id');
        if (error) {
          console.error(`Error fetching profiles from ${dbName}:`, error.message);
          return [];
        }
        console.log(`Successfully fetched ${data.length} profiles from ${dbName}.`);
        return data;
      } catch (e) {
        console.error(`Exception fetching profiles from ${dbName}:`, e.message);
        return [];
      }
    };

    const [primaryProfiles, boltProfiles, oldProfiles] = await Promise.all([
      fetchProfiles(supabase, 'Primary DB'),
      fetchProfiles(boltSupabase, 'Bolt DB'),
      fetchProfiles(oldSupabase, 'Old DB')
    ]);

    const allProfiles = [...primaryProfiles, ...boltProfiles, ...oldProfiles];

    const uniqueProfiles = Array.from(new Map(allProfiles.map(p => [p.user_id, p])).values());

    console.log(`Total unique profiles merged from all DBs: ${uniqueProfiles.length}`);

    res.json({ success: true, data: uniqueProfiles });
  } catch (error) {
    console.error('Error in fetching all profiles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
