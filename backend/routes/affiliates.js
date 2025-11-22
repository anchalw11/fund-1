import express from 'express';
import affiliateService from '../services/affiliateService.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Debug log to verify this module loads
console.log('✅ AFFILIATES ROUTES MODULE LOADED AT:', new Date().toISOString());

// Test route to verify routes are loading
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Affiliate routes are working!' });
});

// Admin endpoints - fully functional
router.get('/admin/users', async (req, res) => {
  try {
    // Get all users from multiple sources
    const { data: profileUsers, error: profileError } = await supabase
      .from('user_profile')
      .select('user_id, email, first_name, last_name, friendly_id, created_at')
      .order('created_at', { ascending: false });

    if (profileError) throw profileError;

    // Transform data to match frontend expectations
    const users = (profileUsers || []).map(user => ({
      id: user.user_id,
      user_id: user.user_id,
      email: user.email,
      full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
      friendly_id: user.friendly_id,
      created_at: user.created_at
    }));

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/admin/assign', async (req, res) => {
  try {
    const { user_id, affiliate_code, commission_rate, admin_assigned = true } = req.body;

    if (!user_id || !affiliate_code) {
      return res.status(400).json({ success: false, error: 'User ID and affiliate code are required' });
    }

    // Check if user already has an affiliate code
    const { data: existing } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ success: false, error: 'User already has an affiliate account' });
    }

    // Check if code is already taken
    const { data: codeTaken } = await supabase
      .from('affiliates')
      .select('*')
      .eq('affiliate_code', affiliate_code)
      .maybeSingle();

    if (codeTaken) {
      return res.status(400).json({ success: false, error: 'Affiliate code is already taken' });
    }

    // Create affiliate with admin-assigned code
    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .insert({
        user_id,
        affiliate_code: affiliate_code,
        commission_rate: commission_rate || 10,
        total_referrals: 0,
        total_earnings: 0,
        available_balance: 0,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: affiliate });
  } catch (error) {
    console.error('Error assigning affiliate code:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stats endpoint with our improved logic
router.get('/stats/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const stats = await affiliateService.getAffiliateStats(user_id);

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
