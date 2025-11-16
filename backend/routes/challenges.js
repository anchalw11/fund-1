import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.post('/reject', async (req, res) => {
  try {
    const { challengeId, userNote, adminNote } = req.body;

    const { data: challengeData, error: challengeError } = await supabase
      .from('user_challenges')
      .select('user_id')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challengeData) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }
    const { user_id } = challengeData;

    const { error: updateError } = await supabase
      .from('user_challenges')
      .update({ status: 'rejected', admin_note: adminNote })
      .eq('id', challengeId);

    if (updateError) throw updateError;

    if (userNote) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user_id,
          title: 'An update on your challenge',
          message: userNote,
          type: 'challenge_update',
        });

      if (notificationError) {
        console.error('Failed to create notification for user:', notificationError);
      }
    }
    
    res.json({ success: true, message: 'Challenge rejected successfully.' });
  } catch (error) {
    console.error('Error rejecting challenge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('challenge_types')
      .select('*')
      .eq('is_active', true)
      .order('recommended', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const { data, error } = await supabase
      .from('challenge_types')
      .select('*')
      .eq('challenge_code', code)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:code/pricing', async (req, res) => {
  try {
    const { code } = req.params;

    const { data: challenge } = await supabase
      .from('challenge_types')
      .select('id')
      .eq('challenge_code', code)
      .maybeSingle();

    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    const { data, error } = await supabase
      .from('challenge_pricing')
      .select('*')
      .eq('challenge_type_id', challenge.id)
      .order('account_size', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:code/rules', async (req, res) => {
  try {
    const { code } = req.params;

    const { data: challenge } = await supabase
      .from('challenge_types')
      .select('id')
      .eq('challenge_code', code)
      .maybeSingle();

    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    const { data, error } = await supabase
      .from('challenge_rules')
      .select('*')
      .eq('challenge_type_id', challenge.id);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/purchase', async (req, res) => {
  try {
    const { user_id, challenge_code, account_size, discount_code } = req.body;

    if (!user_id || !challenge_code || !account_size) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const { data: challenge } = await supabase
      .from('challenge_types')
      .select('id, challenge_code')
      .eq('challenge_code', challenge_code)
      .maybeSingle();

    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    const { data: pricing } = await supabase
      .from('challenge_pricing')
      .select('*')
      .eq('challenge_type_id', challenge.id)
      .eq('account_size', account_size)
      .maybeSingle();

    if (!pricing) {
      return res.status(404).json({ success: false, error: 'Pricing not found' });
    }

    let amount = pricing.discount_price;

    if (challenge_code === 'PAYG_2STEP') {
      amount = pricing.phase_1_price / 2;
    }

    const { data: userChallenge, error } = await supabase
      .from('user_challenges')
      .insert({
        user_id,
        challenge_type_id: challenge.id,
        account_size,
        amount_paid: amount,
        status: 'active',
        start_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: userChallenge });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('user_challenges')
      .select(`
        *,
        challenge_types (
          challenge_code,
          challenge_name,
          description
        )
      `)
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/challenge/:challengeId/stats', async (req, res) => {
  try {
    const { challengeId } = req.params;

    const { data: dailyStats, error: statsError } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_challenge_id', challengeId)
      .order('trading_date', { ascending: true });

    if (statsError) throw statsError;

    const { data: trades, error: tradesError } = await supabase
      .from('trading_activity')
      .select('*')
      .eq('user_challenge_id', challengeId)
      .order('open_time', { ascending: false })
      .limit(10);

    if (tradesError) throw tradesError;

    res.json({
      success: true,
      data: {
        dailyStats,
        recentTrades: trades
      }
    });
  } catch (error) {
    console.error('Error fetching challenge stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Coupon validation endpoint
router.post('/coupons/validate', async (req, res) => {
  try {
    const { coupon_code, challenge_type } = req.body;

    if (!coupon_code) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code is required'
      });
    }

    // Call Supabase RPC function
    const { data, error } = await supabase.rpc('validate_coupon', {
      p_challenge_type: challenge_type || 'all',
      p_coupon_code: coupon_code.toUpperCase()
    });

    if (error) {
      console.error('Coupon validation error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Increment coupon usage
router.post('/coupons/increment-usage', async (req, res) => {
  try {
    const { coupon_code } = req.body;

    if (!coupon_code) {
      return res.status(400).json({
        success: false,
        error: 'Coupon code is required'
      });
    }

    const { data, error } = await supabase.rpc('increment_coupon_usage', {
      coupon_code: coupon_code.toUpperCase()
    });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error incrementing coupon usage:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Debug endpoint to check coupon schema
router.get('/debug/coupon-schema', async (req, res) => {
  try {
    // Check coupons table columns
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'coupons')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      console.error('Columns error:', columnsError);
    }

    // Check current coupons data
    const { data: coupons, error: couponsError } = await supabase
      .from('coupons')
      .select('*')
      .limit(5);

    if (couponsError) {
      console.error('Coupons error:', couponsError);
    }

    // Try to call validate_coupon function
    let validateResult = null;
    let validateError = null;
    try {
      const { data, error } = await supabase.rpc('validate_coupon', {
        p_coupon_code: 'FREETRIAL100',
        p_challenge_type: 'COMPETITION'
      });
      validateResult = data;
      validateError = error;
    } catch (err) {
      validateError = err.message;
    }

    res.json({
      success: true,
      data: {
        columns: columns || [],
        coupons: coupons || [],
        validateResult,
        validateError
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add competition challenge type endpoint
router.post('/debug/add-competition-type', async (req, res) => {
  try {
    console.log('Adding COMPETITION challenge type...');

    // Insert COMPETITION challenge type
    const { data: challengeData, error: challengeError } = await supabase
      .from('challenge_types')
      .insert({
        type_name: 'competition',
        challenge_code: 'COMPETITION',
        challenge_name: 'Trading Competition',
        display_name: 'Trading Competition',
        description: 'Enter the trading competition with a chance to win prizes',
        phase_count: 2,
        is_active: true,
        profit_split: 80.00,
        max_daily_loss: 5.00,
        max_total_loss: 10.00,
        min_trading_days: 4,
        time_limit_days: 30,
        recommended: false,
        icon: 'Trophy',
        color: 'gold',
        phase1_profit_target: 8.00,
        phase2_profit_target: 5.00
      })
      .select()
      .single();

    if (challengeError) {
      // If it already exists, that's fine
      if (challengeError.code === '23505') {
        console.log('COMPETITION challenge type already exists');
      } else {
        console.error('Error inserting challenge type:', challengeError);
        return res.status(500).json({
          success: false,
          error: challengeError.message
        });
      }
    } else {
      console.log('COMPETITION challenge type added:', challengeData);
    }

    // Insert pricing for competition
    const { data: pricingData, error: pricingError } = await supabase
      .from('challenge_pricing')
      .insert({
        challenge_type: 'competition',
        challenge_type_id: challengeData?.id,
        account_size: 10000,
        phase_1_price: 9.99,
        phase_2_price: 0,
        regular_price: 9.99,
        discount_price: 9.99,
        platform_cost: 2.00
      })
      .select()
      .single();

    if (pricingError) {
      // If pricing already exists, that's fine
      if (pricingError.code === '23505') {
        console.log('COMPETITION pricing already exists');
      } else {
        console.error('Error inserting pricing:', pricingError);
        return res.status(500).json({
          success: false,
          error: pricingError.message
        });
      }
    } else {
      console.log('COMPETITION pricing added:', pricingData);
    }

    res.json({
      success: true,
      message: 'COMPETITION challenge type and pricing added successfully'
    });
  } catch (error) {
    console.error('Error adding competition type:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Apply migration endpoint
router.post('/debug/apply-migration', async (req, res) => {
  try {
    const migrationSQL = `
-- Fix validate_coupon function to use the correct column name from the actual database schema
-- The database uses 'code' column, not 'coupon_code'

DROP FUNCTION IF EXISTS validate_coupon(TEXT, TEXT);

CREATE OR REPLACE FUNCTION validate_coupon(
  p_coupon_code TEXT,
  p_challenge_type TEXT DEFAULT 'all'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coupon_record RECORD;
  result JSON;
BEGIN
  -- Find the coupon using correct column names from actual database schema
  SELECT * INTO coupon_record
  FROM coupons
  WHERE code = UPPER(p_coupon_code)
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (challenge_type = 'all' OR challenge_type = p_challenge_type OR p_challenge_type = 'all')
  LIMIT 1;

  -- Check if coupon was found
  IF NOT FOUND THEN
    result := json_build_object(
      'valid', false,
      'message', 'Invalid or expired coupon code'
    );
    RETURN result;
  END IF;

  -- Check usage limit
  IF coupon_record.max_uses IS NOT NULL AND coupon_record.current_uses >= coupon_record.max_uses THEN
    result := json_build_object(
      'valid', false,
      'message', 'Coupon has reached its usage limit'
    );
    RETURN result;
  END IF;

  -- Return valid coupon
  result := json_build_object(
    'valid', true,
    'message', 'Coupon is valid',
    'code', coupon_record.code,
    'discount_percent', coupon_record.discount_percent,
    'discount_amount', 0
  );

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION validate_coupon(TEXT, TEXT) TO anon, authenticated;

-- Also fix the increment_coupon_usage function
DROP FUNCTION IF EXISTS increment_coupon_usage(TEXT);

CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coupon_exists BOOLEAN;
BEGIN
  -- Check if coupon exists and is active
  SELECT EXISTS (
    SELECT 1 FROM coupons
    WHERE code = coupon_code
      AND is_active = TRUE
  ) INTO coupon_exists;

  IF NOT coupon_exists THEN
    RETURN FALSE;
  END IF;

  -- Increment usage count
  UPDATE coupons
  SET current_uses = current_uses + 1
  WHERE code = coupon_code;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_coupon_usage(TEXT) TO anon, authenticated;

-- Ensure FREETRIAL100 coupon exists with correct column name
INSERT INTO coupons (code, discount_percent, challenge_type, is_active, max_uses, expires_at)
VALUES ('FREETRIAL100', 100, 'all', true, NULL, NULL)
ON CONFLICT (code) DO UPDATE SET
  discount_percent = 100,
  challenge_type = 'all',
  is_active = true,
  expires_at = NULL;
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('Migration error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Migration applied successfully',
      data
    });
  } catch (error) {
    console.error('Migration application error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_challenges')
      .select(`
        *,
        user_profiles (
          email,
          first_name,
          last_name,
          friendly_id
        )
      `)
      .order('purchase_date', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching all challenges:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/send-note', async (req, res) => {
  try {
    const { challengeId, userNote } = req.body;

    if (!userNote) {
      return res.status(400).json({ success: false, error: 'User note is required.' });
    }
    const { data: challengeData, error: challengeError } = await supabase
      .from('user_challenges')
      .select('user_id')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challengeData) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }
    const { user_id } = challengeData;

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: user_id,
        title: 'A message from the admin team',
        message: userNote,
        type: 'info',
      });

    if (notificationError) {
      console.error('Failed to create notification for user:', notificationError);
      throw notificationError;
    }
    
    res.json({ success: true, message: 'Note sent successfully.' });
  } catch (error) {
    console.error('Error sending note:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/internal-note/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { adminNote } = req.body;

    if (!adminNote) {
      return res.status(400).json({ success: false, error: 'Admin note is required.' });
    }

    const { error } = await supabase
      .from('user_challenges')
      .update({ admin_note: adminNote })
      .eq('id', challengeId);

    if (error) {
      console.error('Failed to save internal note:', error);
      throw error;
    }

    res.json({ success: true, message: 'Internal note saved successfully.' });
  } catch (error) {
    console.error('Error saving internal note:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Phase Management Endpoints
router.post('/mark-phase-completed/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { completedPhase, adminId } = req.body;

    if (!completedPhase || ![1, 2].includes(completedPhase)) {
      return res.status(400).json({ success: false, error: 'Valid completed phase (1 or 2) is required.' });
    }

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from('user_challenges')
      .select('user_id, challenge_type_id, account_size, phase, current_phase')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found.' });
    }

    // Mark phase as completed using the database function
    const { data: result, error: markError } = await supabase.rpc('mark_phase_completed', {
      challenge_uuid: challengeId,
      completed_phase: completedPhase,
      completion_date: new Date().toISOString()
    });

    if (markError) {
      console.error('Error marking phase completed:', markError);
      return res.status(500).json({ success: false, error: 'Failed to mark phase as completed.' });
    }

    // Get user details for email
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('email, first_name, last_name')
      .eq('id', challenge.user_id)
      .single();

    if (!userError && user) {
      // Send phase completion email
      const emailService = (await import('../services/emailService.js')).default;
      const emailSvc = new emailService();

      try {
        await emailSvc.sendPhaseCompletionEmail({
          email: user.email,
          name: user.first_name || user.email?.split('@')[0] || 'Trader',
          phase: completedPhase,
          challengeId: challengeId,
          accountSize: challenge.account_size
        });
      } catch (emailError) {
        console.error('Failed to send phase completion email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      success: true,
      message: `Phase ${completedPhase} marked as completed successfully.`,
      data: result
    });
  } catch (error) {
    console.error('Error marking phase completed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/assign-phase-credentials/:challengeId', async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { phase, mt5Login, mt5Password, mt5Server, accountSize } = req.body;

    if (!phase || ![1, 2].includes(phase)) {
      return res.status(400).json({ success: false, error: 'Valid phase (1 or 2) is required.' });
    }

    if (!mt5Login || !mt5Password || !mt5Server) {
      return res.status(400).json({ success: false, error: 'MT5 credentials are required.' });
    }

    // Get challenge details
    const { data: challenge, error: challengeError } = await supabase
      .from('user_challenges')
      .select('user_id, challenge_type_id')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found.' });
    }

    // Assign phase credentials using the database function
    const { data: result, error: assignError } = await supabase.rpc('assign_phase_credentials', {
      challenge_uuid: challengeId,
      phase_number: phase,
      mt5_login: mt5Login,
      mt5_password: mt5Password,
      mt5_server: mt5Server,
      account_size_param: accountSize
    });

    if (assignError) {
      console.error('Error assigning phase credentials:', assignError);
      return res.status(500).json({ success: false, error: 'Failed to assign phase credentials.' });
    }

    // Get user details for email
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('email, first_name, last_name')
      .eq('id', challenge.user_id)
      .single();

    if (!userError && user) {
      // Send MT5 credentials email
      const emailService = (await import('../services/emailService.js')).default;
      const emailSvc = new emailService();

      try {
        await emailSvc.sendMT5CredentialsEmail({
          email: user.email,
          first_name: user.first_name || user.email?.split('@')[0] || 'Trader',
          account_number: mt5Login,
          password: mt5Password,
          server: mt5Server,
          initial_balance: accountSize || 10000,
          challenge_type: 'Phase ' + phase
        });
      } catch (emailError) {
        console.error('Failed to send MT5 credentials email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      success: true,
      message: `Phase ${phase} credentials assigned successfully.`,
      data: result
    });
  } catch (error) {
    console.error('Error assigning phase credentials:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/user/:userId/phases', async (req, res) => {
  try {
    const { userId } = req.params;

    // Use the database function to get user challenges with phase information
    const { data, error } = await supabase.rpc('get_user_challenges_with_phases', {
      user_uuid: userId
    });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching user challenges with phases:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
