import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Create Buy 2 Get 1 Free offer
router.post('/buy2get1', async (req, res) => {
  try {
    const { user_id, challenge_ids } = req.body;

    if (!user_id || !challenge_ids || challenge_ids.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'User ID and at least 2 challenge IDs are required'
      });
    }

    // Verify challenges are eligible (above $10k and classic or rapid_fire)
    const { data: challenges, error: challengeError } = await supabase
      .from('user_challenges')
      .select('*')
      .in('id', challenge_ids);

    if (challengeError) throw challengeError;

    const eligible = challenges.every(c =>
      c.account_size >= 10000 &&
      ['classic', 'rapid_fire'].includes(c.challenge_type)
    );

    if (!eligible) {
      return res.status(400).json({
        success: false,
        error: 'All challenges must be above $10k and Classic or Rapid Fire type'
      });
    }

    // Create promotional offer
    const { data, error } = await supabase
      .from('promotional_offers')
      .insert({
        user_id,
        offer_type: 'buy2get1',
        challenge_ids,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error creating buy2get1 offer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user promotions
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from('promotional_offers')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Use promotion
router.post('/use', async (req, res) => {
  try {
    const { promotion_id } = req.body;

    const { data, error} = await supabase
      .from('promotional_offers')
      .update({
        status: 'used',
        used_at: new Date().toISOString()
      })
      .eq('id', promotion_id)
      .eq('status', 'active')
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Promotion not found or already used'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error using promotion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
