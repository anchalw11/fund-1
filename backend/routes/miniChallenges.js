import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Create a mini challenge
router.post('/create', async (req, res) => {
  return res.status(400).json({
    success: false,
    error: 'Due to very high demand, the Free Mini Challenge is temporarily unavailable. We are working to bring this feature back as soon as possible.'
  });
});

// Get user's mini challenges
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from('mini_challenges')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching mini challenges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Complete mini challenge
router.post('/complete', async (req, res) => {
  try {
    const { challenge_id, final_balance } = req.body;

    const success = final_balance >= 2100; // $100 profit target

    const { data, error } = await supabase
      .from('mini_challenges')
      .update({
        status: success ? 'completed' : 'failed',
        current_balance: final_balance,
        completed_at: new Date().toISOString()
      })
      .eq('id', challenge_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data, passed: success });
  } catch (error) {
    console.error('Error completing mini challenge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
