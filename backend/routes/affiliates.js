import express from 'express';
import affiliateService from '../services/affiliateService.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const { data: existing } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (existing) {
      return res.json({ success: true, data: existing });
    }

    // Get user profile to generate name-based code
    const { data: userProfile } = await supabase
      .from('user_profile')
      .select('full_name, user_friendly_id, email')
      .eq('user_id', user_id)
      .maybeSingle();

    // Generate name-based code
    let nameBasedCode = '';
    if (userProfile?.full_name) {
      // Take first 3 letters of first name and last name
      const names = userProfile.full_name.toUpperCase().split(' ').filter(n => n);
      const firstName = names[0] || '';
      const lastName = names[names.length - 1] || '';
      nameBasedCode = (firstName.substring(0, 3) + lastName.substring(0, 3)).replace(/[^A-Z]/g, '');
    } else if (userProfile?.user_friendly_id) {
      nameBasedCode = userProfile.user_friendly_id.toUpperCase().substring(0, 6).replace(/[^A-Z0-9]/g, '');
    } else {
      nameBasedCode = 'USER' + Date.now().toString().slice(-4);
    }

    // Add random numbers to ensure uniqueness
    const uniqueCode = nameBasedCode + Math.floor(1000 + Math.random() * 9000);

    // Create affiliate
    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .insert({
        user_id,
        referral_code: uniqueCode,
        commission_rate: 10,
        total_referrals: 0,
        total_earnings: 0,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: affiliate });
  } catch (error) {
    console.error('Error creating affiliate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/track-referral', async (req, res) => {
  try {
    const { affiliate_code, referred_user_id } = req.body;

    if (!affiliate_code || !referred_user_id) {
      return res.status(400).json({
        success: false,
        error: 'Affiliate code and referred user ID are required'
      });
    }

    const referral = await affiliateService.trackReferral(affiliate_code, referred_user_id);

    if (!referral) {
      return res.status(404).json({
        success: false,
        error: 'Affiliate code not found or inactive'
      });
    }

    res.json({ success: true, data: referral });
  } catch (error) {
    console.error('Error tracking referral:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get affiliate by user_id
router.get('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error || !affiliate) {
      return res.status(404).json({
        success: false,
        error: 'Affiliate not found'
      });
    }

    res.json({ success: true, data: affiliate });
  } catch (error) {
    console.error('Error fetching affiliate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/stats/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const stats = await affiliateService.getAffiliateStats(user_id);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Affiliate not found'
      });
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/payouts/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        error: 'Affiliate not found'
      });
    }

    // Try to get payouts, handle missing table gracefully
    let payouts = [];
    try {
      const { data, error } = await supabase
        .from('payouts_affiliate')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      payouts = data || [];
    } catch (error) {
      if (error.message && error.message.includes('does not exist')) {
        console.warn('payouts_affiliate table does not exist, returning empty array');
        payouts = [];
      } else {
        throw error;
      }
    }

    res.json({ success: true, data: payouts });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/request-payout', async (req, res) => {
  try {
    const { user_id, amount } = req.body;

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (!affiliate) {
      return res.status(404).json({
        success: false,
        error: 'Affiliate not found'
      });
    }

    if (amount > affiliate.available_balance) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient available balance for payout'
      });
    }

    if (amount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Minimum payout amount is $100'
      });
    }

    const { data: payout, error } = await supabase
      .from('payouts_affiliate')
      .insert({
        affiliate_id: affiliate.id,
        amount,
        status: 'pending',
        requested_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update affiliate balance
    await supabase
      .from('affiliates')
      .update({
        available_balance: affiliate.available_balance - amount
      })
      .eq('id', affiliate.id);

    res.json({ success: true, data: payout });
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Record purchase and award commission
router.post('/record-purchase', async (req, res) => {
  try {
    const { referral_code, user_id, purchase_amount } = req.body;

    if (!referral_code || !user_id || !purchase_amount) {
      return res.status(400).json({
        success: false,
        error: 'Referral code, user ID, and purchase amount are required'
      });
    }

    // Find affiliate
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('*')
      .eq('referral_code', referral_code)
      .eq('status', 'active')
      .maybeSingle();

    if (!affiliate) {
      return res.json({ success: true, message: 'No affiliate found' });
    }

    // Calculate commission
    const commission_amount = purchase_amount * (affiliate.commission_rate / 100);

    // Create referral record
    const { data: referral, error } = await supabase
      .from('affiliate_referrals')
      .insert({
        affiliate_id: affiliate.id,
        referred_user_id: user_id,
        purchase_amount,
        commission_amount,
        commission_rate: affiliate.commission_rate,
        status: 'approved'
      })
      .select()
      .single();

    if (error) throw error;

    // Update affiliate earnings
    await supabase
      .from('affiliates')
      .update({
        total_earnings: affiliate.total_earnings + commission_amount,
        available_balance: affiliate.available_balance + commission_amount,
        total_referrals: affiliate.total_referrals + 1
      })
      .eq('id', affiliate.id);

    res.json({ success: true, data: referral });
  } catch (error) {
    console.error('Error recording purchase:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/validate-code/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('*')
      .eq('referral_code', code)
      .eq('status', 'active')
      .single();

    if (!affiliate) {
      return res.json({ success: true, valid: false });
    }

    res.json({ success: true, valid: true, data: affiliate });
  } catch (error) {
    console.error('Error validating affiliate code:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin endpoints
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
      .eq('referral_code', affiliate_code)
      .maybeSingle();

    if (codeTaken) {
      return res.status(400).json({ success: false, error: 'Affiliate code is already taken' });
    }

    // Create affiliate with admin-assigned code
    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .insert({
        user_id,
        referral_code: affiliate_code,
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

router.post('/admin/send-code', async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    // Get affiliate details
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (!affiliate) {
      return res.status(404).json({ success: false, error: 'Affiliate not found' });
    }

    // Get user profile for email
    const { data: userProfile } = await supabase
      .from('user_profile')
      .select('email, first_name, last_name')
      .eq('user_id', user_id)
      .single();

    if (!userProfile || !userProfile.email) {
      return res.status(404).json({ success: false, error: 'User profile or email not found' });
    }

    // Send email notification
    const { default: emailService } = await import('../services/emailService.js');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0066FF, #7B2EFF); padding: 40px 20px; text-align: center; color: white;">
          <h1>Congratulations! Your Affiliate Account is Ready!</h1>
        </div>
        <div style="padding: 40px 20px; background: #f9f9f9;">
          <h2>Affiliate Details:</h2>
          <div style="background: white; padding: 20px; border-left: 4px solid #0066FF;">
            <p><strong>Affiliate Code:</strong> ${affiliate.referral_code}</p>
            <p><strong>Commission Rate:</strong> ${affiliate.commission_rate}%</p>
            <p><strong>Status:</strong> Active</p>
          </div>
          <p style="margin-top: 20px;">
            Share your affiliate code with others to earn commissions on their purchases!
            Your unique affiliate link: <strong>https://fund8r.com?ref=${affiliate.referral_code}</strong>
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://fund8r.com/affiliate" style="background: linear-gradient(135deg, #0066FF, #7B2EFF); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Your Affiliate Dashboard
            </a>
          </div>
        </div>
      </div>
    `;

    await emailService.sendEmail({
      to: userProfile.email,
      subject: 'Your Fund8r Affiliate Code is Ready!',
      html: emailHtml
    });

    res.json({ success: true, message: 'Affiliate code notification sent successfully' });
  } catch (error) {
    console.error('Error sending affiliate code notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
