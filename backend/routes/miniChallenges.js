import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Create a mini challenge
router.post('/create', async (req, res) => {
  try {
    const { user_id, payment_verified = false } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // For paid mini challenges, require payment verification
    if (!payment_verified) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification required'
      });
    }

    // Check if user already has an active mini challenge
    const { data: existingChallenge } = await supabase
      .from('mini_challenges')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single();

    if (existingChallenge) {
      return res.status(400).json({
        success: false,
        error: 'You already have an active mini challenge'
      });
    }

    // Create new paid mini challenge ($0.99)
    const { data: challenge, error } = await supabase
      .from('mini_challenges')
      .insert({
        user_id,
        account_size: 3000, // $3,000 virtual capital
        profit_target: 200, // $200 profit target (6.67%)
        duration_days: 7, // 7 days to complete the challenge
        discount_code: `MC${user_id.slice(-4).toUpperCase()}20`, // 20% discount code
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: challenge,
      message: 'Mini challenge created successfully!'
    });

  } catch (error) {
    console.error('Error creating mini challenge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

}

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

    const success = final_balance >= 3200; // $200 profit target (3000 + 200)

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

}

// Check mini-challenge access limit
router.get('/check-access-limit', async (req, res) => {
  try {
    const { db } = await import('../config/database.js');

    // Get current limit info
    const limitInfo = await db.querySingle('SELECT * FROM mini_challenge_limits WHERE id = ?', ['global_limit']);

    if (!limitInfo) {
      return res.json({
        success: true,
        access_granted: false,
        current_count: 0,
        max_limit: 100,
        message: 'System not initialized'
      });
    }

    // Check if under limit
    const accessGranted = limitInfo.total_access_count < limitInfo.max_limit;

    res.json({
      success: true,
      access_granted: accessGranted,
      current_count: limitInfo.total_access_count,
      max_limit: limitInfo.max_limit,
      message: accessGranted
        ? 'Access available'
        : `Access limit reached (${limitInfo.total_access_count}/100 users maximum)`
    });

  } catch (error) {
    console.error('Error checking access limit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Record mini-challenge access (increment counter)
router.post('/record-access', async (req, res) => {
  try {
    const { db } = await import('../config/database.js');
    const { user_id, user_email, user_ip } = req.body;

    // Get current limit info
    const limitInfo = await db.querySingle('SELECT * FROM mini_challenge_limits WHERE id = ?', ['global_limit']);

    if (!limitInfo) {
      return res.status(400).json({
        success: false,
        error: 'System not initialized'
      });
    }

    // Check if still under limit
    if (limitInfo.total_access_count >= limitInfo.max_limit) {
      // Log denied access
      await db.run(
        `INSERT INTO mini_challenge_access_logs (id, user_id, user_email, user_ip, granted)
         VALUES (?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), user_id, user_email, user_ip, 0]
      );

      return res.json({
        success: false,
        access_granted: false,
        current_count: limitInfo.total_access_count,
        max_limit: limitInfo.max_limit,
        message: 'Access limit reached (100 users maximum)'
      });
    }

    // Increment counter and log access
    const newCount = limitInfo.total_access_count + 1;

    // Update counter
    await db.run(
      `UPDATE mini_challenge_limits
       SET total_access_count = ?, last_updated = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newCount, 'global_limit']
    );

    // Log granted access
    await db.run(
      `INSERT INTO mini_challenge_access_logs (id, user_id, user_email, user_ip, granted)
       VALUES (?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), user_id, user_email, user_ip, 1]
    );

    res.json({
      success: true,
      access_granted: true,
      current_count: newCount,
      max_limit: limitInfo.max_limit,
      message: 'Access granted'
    });

  } catch (error) {
    console.error('Error recording access:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
