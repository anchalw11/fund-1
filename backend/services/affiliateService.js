import { supabase } from '../config/supabase.js';
import crypto from 'crypto';

class AffiliateService {
  generateAffiliateCode(userId) {
    const hash = crypto.createHash('sha256').update(userId + Date.now()).digest('hex');
    return hash.substring(0, 10).toUpperCase();
  }

  async createAffiliate(userId) {
    try {
      const affiliateCode = this.generateAffiliateCode(userId);

      const { data, error } = await supabase
        .from('affiliates')
        .insert({
          user_id: userId,
          referral_code: affiliateCode,
          commission_rate: 10,
          total_referrals: 0,
          total_earnings: 0,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating affiliate:', error);
      throw error;
    }
  }

  async trackReferral(affiliateCode, referredUserId) {
    try {
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('*')
        .eq('referral_code', affiliateCode)
        .eq('status', 'active')
        .single();

      if (!affiliate) {
        return null;
      }

      const { data: referral } = await supabase
        .from('referrals')
        .insert({
          affiliate_id: affiliate.id,
          referred_user_id: referredUserId,
          status: 'pending'
        })
        .select()
        .single();

      await supabase
        .from('affiliates')
        .update({
          total_referrals: affiliate.total_referrals + 1
        })
        .eq('id', affiliate.id);

      return referral;
    } catch (error) {
      console.error('Error tracking referral:', error);
      throw error;
    }
  }

  async processCommission(paymentId) {
    try {
      const { data: payment } = await supabase
        .from('payments')
        .select('*, users:user_id(*)')
        .eq('id', paymentId)
        .single();

      if (!payment) return;

      const { data: referral } = await supabase
        .from('referrals')
        .select('*, affiliates(*)')
        .eq('referred_user_id', payment.user_id)
        .eq('status', 'pending')
        .maybeSingle();

      if (!referral) return;

      const { data: referrals } = await supabase
        .from('referrals')
        .select('id')
        .eq('affiliate_id', referral.affiliate_id);

      const commissionRate = referrals.length >= 50 ? 20 : 10;
      const commissionAmount = payment.amount * (commissionRate / 100);

      await supabase.from('commissions').insert({
        affiliate_id: referral.affiliate_id,
        referral_id: referral.id,
        payment_id: paymentId,
        amount: commissionAmount,
        status: 'pending'
      });

      await supabase
        .from('referrals')
        .update({
          status: 'completed',
          converted_at: new Date().toISOString()
        })
        .eq('id', referral.id);

      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('*')
        .eq('id', referral.affiliate_id)
        .single();

      await supabase
        .from('affiliates')
        .update({
          total_earnings: affiliate.total_earnings + commissionAmount
        })
        .eq('id', referral.affiliate_id);

      console.log(`Commission of $${commissionAmount} created for affiliate ${referral.affiliate_id}`);
    } catch (error) {
      console.error('Error processing commission:', error);
      throw error;
    }
  }

  async getAffiliateStats(identifier) {
    try {
      // Try to find affiliate by user_id first
      let { data: affiliate, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', identifier)
        .maybeSingle();

      // If not found, try by affiliate id (for admin/support access)
      if (!affiliate) {
        const { data: affiliateById, error: idError } = await supabase
          .from('affiliates')
          .select('*')
          .eq('id', identifier)
          .maybeSingle();

        affiliate = affiliateById;
      }

      if (!affiliate) {
        console.log('No affiliate found, returning safe defaults');
        return {
          affiliate_code: '',
          total_referrals: 0,
          active_referrals: 0,
          total_earnings: 0,
          available_balance: 0,
          pending_earnings: 0,
          paid_earnings: 0
        };
      }

      console.log('Found affiliate:', affiliate.id, affiliate.referral_code);

      try {
        // Try to get referrals
        let referralsArray = [];
        try {
          const { data: referrals, error: refError } = await supabase
            .from('referrals')
            .select('*, users:referred_user_id(email, full_name)')
            .eq('affiliate_id', affiliate.id);

          if (!refError && referrals) {
            referralsArray = referrals;
          }
        } catch (e) {
          // ignore
        }

        try {
          if (referralsArray.length === 0) {
            const { data: affiliateReferrals, error: affRefError } = await supabase
              .from('affiliate_referrals')
              .select('*')
              .eq('affiliate_id', affiliate.id);

            if (!affRefError && affiliateReferrals) {
              referralsArray = affiliateReferrals;
            }
          }
        } catch (e) {
          // ignore
        }

        referralsArray = Array.isArray(referralsArray) ? referralsArray : [];

        let commissionsArray = [];
        try {
          const { data: commissions, error: commError } = await supabase
            .from('commissions')
            .select('*')
            .eq('affiliate_id', affiliate.id);

          if (!commError && commissions) {
            commissionsArray = commissions;
          }
        } catch (e) {
          // ignore
        }

        commissionsArray = Array.isArray(commissionsArray) ? commissionsArray : [];

        const pendingEarnings = commissionsArray
          .filter(c => c && c.status === 'pending')
          .reduce((sum, c) => sum + (c.amount || 0), 0);

        const paidEarnings = commissionsArray
          .filter(c => c && c.status === 'paid')
          .reduce((sum, c) => sum + (c.amount || 0), 0);

        const activeReferralsCount = referralsArray.filter(r => r && (r.status === 'completed' || r.status === 'approved')).length;

        return {
          affiliate_code: affiliate.referral_code || '',
          total_referrals: referralsArray.length,
          active_referrals: activeReferralsCount,
          total_earnings: affiliate.total_earnings || 0,
          available_balance: (affiliate.available_balance || affiliate.total_earnings || 0) - paidEarnings,
          pending_earnings: pendingEarnings,
          paid_earnings: paidEarnings
        };
      } catch (error) {
        console.error('Inner error:', error);
        return {
          affiliate_code: '',
          total_referrals: 0,
          active_referrals: 0,
          total_earnings: 0,
          available_balance: 0,
          pending_earnings: 0,
          paid_earnings: 0
        };
      }
    } catch (error) {
      console.error('Error getting affiliate stats:', error);
      return {
        affiliate_code: '',
        total_referrals: 0,
        active_referrals: 0,
        total_earnings: 0,
        available_balance: 0,
        pending_earnings: 0,
        paid_earnings: 0
      };
    }
  }

  async processPayouts() {
    try {
      const { data: pendingCommissions } = await supabase
        .from('commissions')
        .select('*, affiliates(*, users:user_id(*))')
        .eq('status', 'pending');

      const affiliateGroups = {};

      pendingCommissions.forEach(commission => {
        const affiliateId = commission.affiliate_id;
        if (!affiliateGroups[affiliateId]) {
          affiliateGroups[affiliateId] = {
            affiliate: commission.affiliates,
            commissions: [],
            total: 0
          };
        }
        affiliateGroups[affiliateId].commissions.push(commission);
        affiliateGroups[affiliateId].total += commission.amount;
      });

      for (const [affiliateId, group] of Object.entries(affiliateGroups)) {
        if (group.total >= 100) {
          await supabase.from('payouts_affiliate').insert({
            affiliate_id: affiliateId,
            amount: group.total,
            status: 'pending',
            requested_at: new Date().toISOString()
          });

          const commissionIds = group.commissions.map(c => c.id);
          await supabase
            .from('commissions')
            .update({ status: 'processing' })
            .in('id', commissionIds);

          console.log(`Payout of $${group.total} created for affiliate ${affiliateId}`);
        }
      }
    } catch (error) {
      console.error('Error processing payouts:', error);
      throw error;
    }
  }
}

export default new AffiliateService();
