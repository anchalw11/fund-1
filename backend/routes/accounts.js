import express from 'express';
import { supabase, boltSupabase, oldSupabase, newSupabase } from '../config/supabase.js';
import monitoringService from '../services/monitoringService.js';
import emailService from '../services/emailService.js';

const router = express.Router();

router.get('/test', (req, res) => {
  console.log('✅ /test endpoint hit');
  res.json({ success: true, message: 'Backend connection is working!' });
});

router.get('/all-users', async (req, res) => {
  try {
    const { data: users1, error: error1 } = await supabase.from('user_profile').select('*');
    const { data: users2, error: error2 } = await newSupabase.from('user_profile').select('*');
    const { data: users3, error: error3 } = await oldSupabase.from('user_profile').select('*');

    if (error1) console.error('Error fetching from supabase:', error1.message);
    if (error2) console.error('Error fetching from newSupabase:', error2.message);
    if (error3) console.error('Error fetching from oldSupabase:', error3.message);

    const allUsers = [
      ...(users1 || []),
      ...(users2 || []),
      ...(users3 || []),
    ];

    res.json({ success: true, data: allUsers });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { user_id } = req.query;

    let query = supabase
      .from('mt5_accounts')
      .select('*, challenges(*)');

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('mt5_accounts')
      .select('*, challenges(*)')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const accountData = req.body;

    // Validate required fields
    if (!accountData.user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    if (!accountData.login) {
      return res.status(400).json({
        success: false,
        error: 'login (MT5 account number) is required'
      });
    }

    if (!accountData.password) {
      return res.status(400).json({
        success: false,
        error: 'password is required'
      });
    }

    if (!accountData.server) {
      return res.status(400).json({
        success: false,
        error: 'server is required'
      });
    }

    // Set default values if not provided
    const completeAccountData = {
      ...accountData,
      balance: accountData.balance || 0,
      equity: accountData.equity || 0,
      status: accountData.status || 'active'
    };

    const { data, error } = await supabase
      .from('mt5_accounts')
      .insert(completeAccountData)
      .select()
      .single();

    if (error) throw error;

    // Try to fetch user and send email (but don't fail if user not found)
    try {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', accountData.user_id)
        .single();

      if (user) {
        await emailService.sendChallengeStartedEmail(user, data);
      }
    } catch (emailError) {
      console.log('Could not send email:', emailError.message);
    }

    // Start monitoring (don't fail if monitoring fails)
    try {
      await monitoringService.startMonitoring(data.id);
    } catch (monitorError) {
      console.log('Could not start monitoring:', monitorError.message);
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('mt5_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/start-monitoring', async (req, res) => {
  try {
    const { id } = req.params;

    await monitoringService.startMonitoring(id);

    res.json({ success: true, message: 'Monitoring started' });
  } catch (error) {
    console.error('Error starting monitoring:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/stop-monitoring', async (req, res) => {
  try {
    const { id } = req.params;

    await monitoringService.stopMonitoring(id);

    res.json({ success: true, message: 'Monitoring stopped' });
  } catch (error) {
    console.error('Error stopping monitoring:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/metrics', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100 } = req.query;

    const { data, error } = await supabase
      .from('account_metrics')
      .select('*')
      .eq('mt5_account_id', id)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/violations', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('rule_violations')
      .select('*')
      .eq('mt5_account_id', id)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching violations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/assign-credentials', async (req, res) => {
  try {
    const {
      challenge_id,
      user_id,
      account_number,
      password,
      server,
      account_size
    } = req.body;

    if (!challenge_id || !user_id || !account_number || !password || !server) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: challenge_id, user_id, account_number, password, server'
      });
    }

    console.log('🔄 Assigning MT5 credentials to challenge:', challenge_id);

    const { data: challenge, error: challengeError } = await supabase
      .from('user_challenges')
      .update({
        trading_account_id: account_number,
        trading_account_password: password,
        trading_account_server: server,
        credentials_sent: true,
        start_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', challenge_id)
      .select()
      .single();

    if (challengeError) throw challengeError;

    console.log('✅ Updated challenge with credentials');

    let mt5AccountData = null;
    const { data: existingMT5, error: mt5CheckError } = await supabase
      .from('mt5_accounts')
      .select('*')
      .eq('challenge_id', challenge_id)
      .maybeSingle();

    if (existingMT5) {
      console.log('📝 Updating existing MT5 account record');
      const { data: updatedMT5, error: mt5UpdateError } = await supabase
        .from('mt5_accounts')
        .update({
          account_number: account_number,
          password: password,
          server: server,
          balance: account_size || 0,
          equity: account_size || 0,
          status: 'active'
        })
        .eq('id', existingMT5.id)
        .select()
        .single();

      if (mt5UpdateError) throw mt5UpdateError;
      mt5AccountData = updatedMT5;
    } else {
      console.log('➕ Creating new MT5 account record');
      const { data: newMT5, error: mt5CreateError } = await supabase
        .from('mt5_accounts')
        .insert({
          user_id: user_id,
          challenge_id: challenge_id,
          account_number: account_number,
          password: password,
          server: server,
          balance: account_size || 0,
          equity: account_size || 0,
          status: 'active'
        })
        .select()
        .single();

      if (mt5CreateError) throw mt5CreateError;
      mt5AccountData = newMT5;
    }

    console.log('✅ MT5 account record ready:', mt5AccountData.id);

    const { data: initialSnapshot, error: snapshotError } = await supabase
      .from('mt5_account_snapshots')
      .insert({
        user_id: user_id,
        challenge_id: challenge_id,
        mt5_account_id: mt5AccountData.id,
        account_number: account_number,
        server: server,
        balance: account_size || 0,
        equity: account_size || 0,
        profit_loss: 0,
        profit_loss_percent: 0,
        daily_profit_loss: 0,
        daily_profit_loss_percent: 0,
        total_trades: 0,
        open_positions: 0,
        is_latest: true
      })
      .select()
      .single();

    if (snapshotError) {
      console.warn('⚠️  Could not create initial snapshot:', snapshotError.message);
    } else {
      console.log('✅ Created initial MT5 snapshot');
    }

    const { data: initialAnalytics, error: analyticsError } = await supabase
      .from('mt5_analytics_cache')
      .insert({
        user_id: user_id,
        challenge_id: challenge_id,
        current_balance: account_size || 0,
        current_equity: account_size || 0,
        initial_balance: account_size || 0,
        total_profit_loss: 0,
        total_profit_loss_percent: 0,
        challenge_status: 'in_progress',
        is_valid: true
      })
      .select()
      .single();

    if (analyticsError) {
      console.warn('⚠️  Could not create initial analytics:', analyticsError.message);
    } else {
      console.log('✅ Created initial analytics cache');
    }

    try {
      console.log('🚀 Starting MT5 monitoring for account:', mt5AccountData.id);
      await monitoringService.startMonitoring(mt5AccountData.id);
      console.log('✅ MT5 monitoring started successfully');
    } catch (monitorError) {
      console.warn('⚠️  Could not start monitoring (MetaAPI may not be configured):', monitorError.message);
    }

    try {
      const { data: user } = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (user) {
        await emailService.sendMT5CredentialsEmail(user, {
          account_number,
          password,
          server,
          challenge_type: challenge.challenge_type,
          account_size: account_size
        });
        console.log('✅ Sent MT5 credentials email to user');
      }
    } catch (emailError) {
      console.warn('⚠️  Could not send email:', emailError.message);
    }

    const { data: logEntry, error: logError } = await supabase
      .from('mt5_monitoring_logs')
      .insert({
        user_id: user_id,
        challenge_id: challenge_id,
        mt5_account_id: mt5AccountData.id,
        log_type: 'credentials_assigned',
        log_level: 'info',
        message: `MT5 credentials assigned by admin for account ${account_number}`,
        account_number: account_number,
        server: server
      });

    res.json({
      success: true,
      data: {
        challenge,
        mt5_account: mt5AccountData,
        monitoring_started: true
      },
      message: 'MT5 credentials assigned and monitoring started successfully'
    });
  } catch (error) {
    console.error('❌ Error assigning MT5 credentials:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/breach', async (req, res) => {
  try {
    const { id } = req.params; // This is the challenge_id
    const { reason, db_source } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, error: 'Breach reason is required' });
    }

    let dbClient;
    switch (db_source) {
      case 'BOLT':
        dbClient = boltSupabase;
        break;
      case 'OLD':
        dbClient = oldSupabase;
        break;
      default:
        dbClient = supabase;
    }

    if (!dbClient) {
      return res.status(400).json({ success: false, error: `Invalid db_source: ${db_source}` });
    }

    // 1. Update the user_challenges table
    const { data: challenge, error: challengeError } = await dbClient
      .from('user_challenges')
      .update({ status: 'breached', admin_note: reason })
      .eq('id', id)
      .select()
      .single();

    if (challengeError) throw challengeError;
    if (!challenge) return res.status(404).json({ success: false, error: `Challenge not found in ${db_source} database` });

    // 2. Update the corresponding mt5_accounts table
    const { data: mt5Account, error: mt5AccountError } = await dbClient
      .from('mt5_accounts')
      .update({ status: 'breached' })
      .eq('challenge_id', id)
      .select()
      .single();

    if (mt5AccountError) {
      console.warn(`Could not update mt5_account for challenge ${id} in ${db_source}: ${mt5AccountError.message}`);
    }

    // 3. Create a notification for the user (always in the primary DB)
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: challenge.user_id,
        title: 'Account Breached',
        message: `Your account for the ${challenge.challenge_type} challenge has been breached. Reason: ${reason}`,
        type: 'account_breached'
      });

    if (notificationError) {
      console.warn(`Could not create notification for user ${challenge.user_id}: ${notificationError.message}`);
    }

    // 4. Send an email to the user (using primary DB to find user profile)
    try {
      const { data: user } = await supabase
        .from('user_profile')
        .select('email, first_name, last_name')
        .eq('user_id', challenge.user_id)
        .single();

      if (user) {
        await emailService.sendBreachEmail(user, {
          reason: reason,
          challenge_type: challenge.challenge_type,
          account_size: challenge.account_size
        });
      }
    } catch (emailError) {
      console.warn(`Could not send breach email to user ${challenge.user_id}: ${emailError.message}`);
    }
    
    // 5. Stop monitoring the account
    if (mt5Account) {
      try {
        await monitoringService.stopMonitoring(mt5Account.id);
      } catch (monitorError) {
        console.warn(`Could not stop monitoring for mt5_account ${mt5Account.id}: ${monitorError.message}`);
      }
    }

    res.json({ success: true, data: challenge });
  } catch (error) {
    console.error('Error breaching account:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
