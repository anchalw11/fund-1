import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Subscription pricing configuration
const SUBSCRIPTION_PRICING = {
  classic: {
    5000: { monthly: 69, quarterly: 172.5 },
    10000: { monthly: 134, quarterly: 335 },
    25000: { monthly: 339, quarterly: 847.5 },
    50000: { monthly: 684, quarterly: 1710 },
    100000: { monthly: 1349, quarterly: 3372.5 },
    200000: { monthly: 2699, quarterly: 6747.5 }
  },
  rapid_fire: {
    5000: { monthly: 79, quarterly: 197.5 },
    10000: { monthly: 154, quarterly: 385 },
    25000: { monthly: 389, quarterly: 972.5 },
    50000: { monthly: 784, quarterly: 1960 },
    100000: { monthly: 1549, quarterly: 3872.5 },
    200000: { monthly: 3099, quarterly: 7747.5 }
  },
  vip: {
    'basic': { monthly: 997, duration: 2 },
    'premium': { monthly: 1497, duration: 2 },
    'elite': { monthly: 2997, duration: 2 }
  }
};

// Create subscription
router.post('/create', async (req, res) => {
  try {
    const { user_id, plan_type, account_size, billing_cycle } = req.body;

    if (!user_id || !plan_type || !account_size) {
      return res.status(400).json({
        success: false,
        error: 'User ID, plan type, and account size are required'
      });
    }

    // Calculate pricing
    let monthly_price = 0;
    if (plan_type === 'vip') {
      monthly_price = SUBSCRIPTION_PRICING.vip[account_size]?.monthly || 0;
    } else {
      monthly_price = SUBSCRIPTION_PRICING[plan_type]?.[account_size]?.[billing_cycle || 'monthly'] || 0;
    }

    if (monthly_price === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan configuration'
      });
    }

    // Calculate next billing date
    const next_billing_date = new Date();
    if (billing_cycle === 'quarterly') {
      next_billing_date.setMonth(next_billing_date.getMonth() + 3);
    } else {
      next_billing_date.setMonth(next_billing_date.getMonth() + 1);
    }

    const { data, error } = await supabase
      .from('subscription_plans')
      .insert({
        user_id,
        plan_type,
        account_size,
        monthly_price,
        billing_cycle: billing_cycle || 'monthly',
        unlimited_retries: true,
        status: 'active',
        next_billing_date: next_billing_date.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user subscriptions
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel subscription
router.post('/cancel', async (req, res) => {
  try {
    const { subscription_id } = req.body;

    const { data, error } = await supabase
      .from('subscription_plans')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', subscription_id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pricing info
router.get('/pricing', (req, res) => {
  res.json({ success: true, data: SUBSCRIPTION_PRICING });
});

export default router;
