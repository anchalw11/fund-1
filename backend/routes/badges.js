import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Award a badge to a user
router.post('/award', async (req, res) => {
  try {
    const { user_id, badge_type, badge_tier } = req.body;

    if (!user_id || !badge_type || !badge_tier) {
      return res.status(400).json({
        success: false,
        error: 'User ID, badge type, and badge tier are required'
      });
    }

    const { data, error } = await supabase.rpc('award_badge', {
      p_user_id: user_id,
      p_badge_type: badge_type,
      p_badge_tier: badge_tier
    });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error awarding badge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user badges
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user_id)
      .order('earned_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get leaderboard with badges
router.get('/leaderboard', async (req, res) => {
  try {
    const { badge_type } = req.query;

    let query = supabase
      .from('user_badges')
      .select(`
        *,
        user_profile!inner(
          user_friendly_id,
          full_name,
          email
        )
      `)
      .order('earned_at', { ascending: true });

    if (badge_type) {
      query = query.eq('badge_type', badge_type);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by badge type
    const grouped = (data || []).reduce((acc, badge) => {
      if (!acc[badge.badge_type]) {
        acc[badge.badge_type] = [];
      }
      acc[badge.badge_type].push(badge);
      return acc;
    }, {});

    res.json({ success: true, data: grouped });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
