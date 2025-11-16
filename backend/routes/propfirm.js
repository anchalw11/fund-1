import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabase.js';
import EmailService from '../services/emailService.js';
import {
    getTraders,
    checkBreaches,
    logBreach,
    updateUserChallengeStatus
} from '../services/propFirmService.js';

// ============================================
// GET TRADERS
// ============================================
router.get('/traders', async (req, res) => {
    try {
        const traders = await getTraders();
        res.json(traders);
    } catch (error) {
        console.error('Error in /traders route:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// RUN BREACH CHECK
// ============================================
router.post('/run-breach-check', async (req, res) => {
    try {
        // 1. Fetch all active traders
        const { data: activeChallenges, error: challengesError } = await supabase
            .from('user_challenges')
            .select(`
                id,
                user_id,
                mt5_account_id,
                challenge_type_id,
                users ( id, email, user_profile (full_name)),
                mt5_accounts ( login, balance, equity ),
                challenge_types ( name, rules:challenge_rules (rule_name, rule_value) )
            `)
            .eq('status', 'Active');

        if (challengesError) throw challengesError;

        let breachesFound = [];
        let checkedCount = activeChallenges.length;

        // 2. Loop through each trader and check for breaches
        for (const challenge of activeChallenges) {
            const traderData = {
                initial_balance: challenge.challenge_types.name.includes('10K') ? 10000 : 100000,
                current_equity: challenge.mt5_accounts.equity,
            };
            
            // Fetch the latest daily stat for the account
            const { data: dailyStats, error: statsError } = await supabase
                .from('daily_stats')
                .select('*')
                .eq('account_id', challenge.mt5_account_id)
                .order('date', { ascending: false })
                .limit(1);

            if (statsError) {
                console.error(`Could not fetch daily stats for account ${challenge.mt5_account_id}:`, statsError);
                continue; // Skip to next trader if stats are not available
            }

            const detectedBreaches = await checkBreaches(traderData, challenge.challenge_types.rules, dailyStats);

            if (detectedBreaches.length > 0) {
                const firstBreach = detectedBreaches[0];
                await updateUserChallengeStatus(challenge.id, 'Breached');
                await logBreach({
                    user_id: challenge.user_id,
                    challenge_id: challenge.id,
                    mt5_account_id: challenge.mt5_account_id,
                    breach_type: firstBreach.breach_type,
                    breach_value: firstBreach.breach_value,
                    threshold_value: firstBreach.threshold_value,
                    description: firstBreach.description,
                });
                breachesFound.push({
                    trader_name: challenge.users.user_profile.full_name || challenge.users.email,
                    account_id: challenge.mt5_accounts.login,
                    ...firstBreach,
                });
            }
        }

        res.json({
            success: true,
            message: `Checked ${checkedCount} traders and found ${breachesFound.length} new breaches.`,
            breaches: breachesFound,
        });

    } catch (error) {
        console.error('Error running breach check:', error);
        res.status(500).json({ success: false, error: 'An internal server error occurred during the breach check.' });
    }
});

// ============================================
// TERMINATE ACCOUNT
// ============================================
router.post('/terminate', async (req, res) => {
    const { challengeId, reason } = req.body;

    if (!challengeId || !reason) {
        return res.status(400).json({ error: 'Challenge ID and reason are required.' });
    }

    try {
        const updatedChallenge = await updateUserChallengeStatus(challengeId, 'Terminated');
        if (!updatedChallenge) {
            return res.status(404).json({ error: 'Challenge not found or could not be updated.' });
        }
        // Optionally, log the termination reason somewhere
        res.json({ success: true, message: 'Account terminated successfully.' });
    } catch (error) {
        console.error('Error terminating account:', error);
        res.status(500).json({ error: 'Failed to terminate account.' });
    }
});

// ============================================
// EMAIL TEMPLATES
// ============================================
router.get('/email-templates', async (req, res) => {
    try {
        const { data, error } = await supabase.from('prop_firm_email_templates').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching email templates:', error);
        res.status(500).json({ error: 'Failed to fetch email templates.' });
    }
});

// ============================================
// SEND EMAIL
// ============================================
router.post('/send-email', async (req, res) => {
    const { trader, template } = req.body;

    if (!trader || !template) {
        return res.status(400).json({ error: 'Trader and template data are required.' });
    }

    try {
        const emailService = new EmailService();
        await emailService.reinitialize();

        let subject = template.subject;
        let body = template.body;

        const replacements = {
            '{trader_name}': trader.trader_name,
            '{account_id}': trader.account_id,
            '{account_type}': trader.account_type,
            '{initial_balance}': trader.initial_balance,
            '{current_equity}': trader.current_equity,
            '{breach_reason}': trader.status === 'Breached' ? 'Rule Violation' : 'N/A',
            '{company_name}': 'F8 Fund',
            '{breach_date}': new Date().toLocaleDateString(),
        };

        for (const key in replacements) {
            const regex = new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
            subject = subject.replace(regex, replacements[key]);
            body = body.replace(regex, replacements[key]);
        }

        await emailService.sendEmail(trader.email, subject, body);

        res.json({ success: true, message: 'Email sent successfully.' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email.' });
    }
});


export default router;
