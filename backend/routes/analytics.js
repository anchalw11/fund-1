import express from 'express';
import metaapi from '../config/metaapi.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();
// Using mock MetaAPI from config
const api = metaapi;
const connections = new Map();

// Helper function to get or create connection
async function getConnection(metaApiId, login, password, server) {
  if (connections.has(metaApiId)) {
    return connections.get(metaApiId);
  }

  try {
    let account;
    try {
      account = await api.metatraderAccountApi.getAccount(metaApiId);
    } catch (error) {
      // Create new account
      account = await api.metatraderAccountApi.createAccount({
        name: `MT5-${login}`,
        type: 'cloud',
        login: login,
        password: password,
        server: server,
        platform: 'mt5',
        magic: 0
      });
      
      await account.deploy();
      await account.waitDeployed();
    }

    const connection = account.getRPCConnection();
    await connection.connect();
    await connection.waitSynchronized();

    connections.set(metaApiId, connection);
    return connection;
  } catch (error) {
    console.error('Connection error:', error);
    throw error;
  }
}

// Get real-time MT5 data by user_id
router.get('/mt5-data/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    // Get user's MT5 account from database
    const { data: account, error: dbError } = await supabase
      .from('mt5_accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single();

    if (dbError || !account) {
      return res.status(404).json({
        success: false,
        error: 'No active MT5 account found for this user'
      });
    }

    // Connect to MT5
    const connection = await getConnection(
      account.id,
      account.account_number,
      account.password,
      account.server
    );

    // Get real-time account information
    const accountInfo = await connection.getAccountInformation();
    const positions = await connection.getPositions();
    const history = await connection.getDealsByTimeRange(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    );

    const closedTrades = history.filter(deal => deal.type === 'DEAL_TYPE_SELL' || deal.type === 'DEAL_TYPE_BUY');
    const profitTrades = closedTrades.filter(t => t.profit > 0);
    const lossTrades = closedTrades.filter(t => t.profit < 0);

    const totalProfit = profitTrades.reduce((sum, t) => sum + t.profit, 0);
    const totalLoss = Math.abs(lossTrades.reduce((sum, t) => sum + t.profit, 0));
    const avgWin = profitTrades.length ? totalProfit / profitTrades.length : 0;
    const avgLoss = lossTrades.length ? totalLoss / lossTrades.length : 0;

    const currentProfit = positions.reduce((sum, p) => sum + p.profit, 0);
    const profitPercentage = ((accountInfo.equity - accountInfo.balance) / accountInfo.balance) * 100;

    const balances = closedTrades.map((_, i) => {
      const balance = accountInfo.balance;
      const change = closedTrades.slice(0, i + 1).reduce((sum, t) => sum + t.profit, 0);
      return balance - currentProfit + change;
    });

    const peakBalance = Math.max(...balances, accountInfo.balance);
    const maxDrawdown = ((peakBalance - Math.min(...balances)) / peakBalance) * 100;

    res.json({
      success: true,
      data: {
        balance: accountInfo.balance,
        equity: accountInfo.equity,
        margin: accountInfo.margin,
        freeMargin: accountInfo.freeMargin,
        marginLevel: accountInfo.marginLevel,
        leverage: accountInfo.leverage,
        currency: accountInfo.currency,
        openTrades: positions.length,
        profit: currentProfit,
        profitPercentage: profitPercentage.toFixed(2),
        totalTrades: closedTrades.length,
        winRate: closedTrades.length ? ((profitTrades.length / closedTrades.length) * 100).toFixed(2) : '0.00',
        averageWin: avgWin.toFixed(2),
        averageLoss: avgLoss.toFixed(2),
        profitFactor: totalLoss ? (totalProfit / totalLoss).toFixed(2) : '0.00',
        maxDrawdown: maxDrawdown.toFixed(2),
        positions: positions.map(p => ({
          id: p.id,
          symbol: p.symbol,
          type: p.type,
          volume: p.volume,
          openPrice: p.openPrice,
          currentPrice: p.currentPrice,
          profit: p.profit,
          openTime: p.time
        })),
        recentTrades: closedTrades.slice(-10).reverse().map(t => ({
          symbol: t.symbol,
          type: t.type,
          volume: t.volume,
          profit: t.profit,
          time: t.time
        })),
        lastUpdate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching MT5 data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch MT5 data',
      message: error.message || 'Unknown error occurred'
    });
  }
});

// Get open positions
router.get('/positions/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data: account } = await supabase
      .from('mt5_accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single();

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    const connection = await getConnection(
      account.id,
      account.account_number,
      account.password,
      account.server
    );

    const positions = await connection.getPositions();

    res.json({
      success: true,
      data: positions.map(p => ({
        id: p.id,
        symbol: p.symbol,
        type: p.type,
        volume: p.volume,
        openPrice: p.openPrice,
        currentPrice: p.currentPrice,
        profit: p.profit,
        swap: p.swap,
        openTime: p.time
      }))
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get ALL trades (complete history)
router.get('/all-trades/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data: account } = await supabase
      .from('mt5_accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single();

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    const connection = await getConnection(
      account.id,
      account.account_number,
      account.password,
      account.server
    );

    // Get ALL history from account creation
    const accountInfo = await connection.getAccountInformation();
    const allHistory = await connection.getDeals();

    res.json({
      success: true,
      total: allHistory.length,
      data: allHistory.map(t => ({
        id: t.id,
        positionId: t.positionId,
        symbol: t.symbol,
        type: t.type,
        volume: t.volume,
        price: t.price,
        profit: t.profit,
        swap: t.swap,
        commission: t.commission,
        time: t.time,
        comment: t.comment,
        entryType: t.entryType,
        magic: t.magic
      }))
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get trading history with date range
router.get('/history/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const { days = 30 } = req.query;

    const { data: account } = await supabase
      .from('mt5_accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'active')
      .single();

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    const connection = await getConnection(
      account.id,
      account.account_number,
      account.password,
      account.server
    );

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000);
    const history = await connection.getDealsByTimeRange(startTime, endTime);

    res.json({
      success: true,
      data: history.map(t => ({
        id: t.id,
        symbol: t.symbol,
        type: t.type,
        volume: t.volume,
        profit: t.profit,
        swap: t.swap,
        commission: t.commission,
        time: t.time
      }))
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/challenge-analytics/:challenge_id', async (req, res) => {
  try {
    const { challenge_id } = req.params;

    const { data: analytics, error: analyticsError } = await supabase
      .from('mt5_analytics_cache')
      .select('*')
      .eq('challenge_id', challenge_id)
      .eq('is_valid', true)
      .single();

    if (analyticsError) {
      return res.status(404).json({
        success: false,
        error: 'Analytics not found for this challenge'
      });
    }

    const { data: latestSnapshot, error: snapshotError } = await supabase
      .from('mt5_account_snapshots')
      .select('*')
      .eq('challenge_id', challenge_id)
      .eq('is_latest', true)
      .single();

    const { data: recentTrades, error: tradesError } = await supabase
      .from('mt5_trades')
      .select('*')
      .eq('challenge_id', challenge_id)
      .order('open_time', { ascending: false })
      .limit(20);

    const { data: violations, error: violationsError } = await supabase
      .from('mt5_rule_violations')
      .select('*')
      .eq('challenge_id', challenge_id)
      .eq('is_resolved', false)
      .order('detected_at', { ascending: false });

    const { data: challenge, error: challengeError } = await supabase
      .from('user_challenges')
      .select('*, challenge_types(*)')
      .eq('id', challenge_id)
      .single();

    res.json({
      success: true,
      data: {
        analytics: analytics,
        latest_snapshot: latestSnapshot || null,
        recent_trades: recentTrades || [],
        active_violations: violations || [],
        challenge_info: challenge,
        last_updated: analytics.last_updated
      }
    });

  } catch (error) {
    console.error('Error fetching challenge analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

router.get('/user-analytics/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const { data: challenges, error: challengesError } = await supabase
      .from('user_challenges')
      .select('id, challenge_type, account_size, status, credentials_sent')
      .eq('user_id', user_id)
      .eq('credentials_sent', true);

    if (challengesError || !challenges || challenges.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active challenges with credentials found for this user'
      });
    }

    const challengeIds = challenges.map(c => c.id);

    const { data: analytics, error: analyticsError } = await supabase
      .from('mt5_analytics_cache')
      .select('*')
      .in('challenge_id', challengeIds)
      .eq('is_valid', true);

    const { data: snapshots, error: snapshotsError } = await supabase
      .from('mt5_account_snapshots')
      .select('*')
      .in('challenge_id', challengeIds)
      .eq('is_latest', true);

    const { data: violations, error: violationsError } = await supabase
      .from('mt5_rule_violations')
      .select('*')
      .in('challenge_id', challengeIds)
      .eq('is_resolved', false);

    const analyticsMap = new Map(analytics?.map(a => [a.challenge_id, a]) || []);
    const snapshotsMap = new Map(snapshots?.map(s => [s.challenge_id, s]) || []);

    const userChallenges = challenges.map(challenge => ({
      challenge_id: challenge.id,
      challenge_type: challenge.challenge_type,
      account_size: challenge.account_size,
      status: challenge.status,
      analytics: analyticsMap.get(challenge.id) || null,
      latest_snapshot: snapshotsMap.get(challenge.id) || null,
      violations_count: violations?.filter(v => v.challenge_id === challenge.id).length || 0
    }));

    res.json({
      success: true,
      data: {
        challenges: userChallenges,
        total_challenges: challenges.length,
        active_violations: violations || [],
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user analytics',
      message: error.message
    });
  }
});

router.get('/live-snapshot/:challenge_id', async (req, res) => {
  try {
    const { challenge_id } = req.params;

    const { data: snapshot, error } = await supabase
      .from('mt5_account_snapshots')
      .select('*')
      .eq('challenge_id', challenge_id)
      .eq('is_latest', true)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'No snapshot found for this challenge'
      });
    }

    res.json({
      success: true,
      data: snapshot
    });

  } catch (error) {
    console.error('Error fetching live snapshot:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/rule-violations/:challenge_id', async (req, res) => {
  try {
    const { challenge_id } = req.params;

    const { data: violations, error } = await supabase
      .from('mt5_rule_violations')
      .select('*')
      .eq('challenge_id', challenge_id)
      .order('detected_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: violations || [],
      total: violations?.length || 0
    });

  } catch (error) {
    console.error('Error fetching violations:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/monitoring-logs/:challenge_id', async (req, res) => {
  try {
    const { challenge_id } = req.params;
    const { limit = 50 } = req.query;

    const { data: logs, error } = await supabase
      .from('mt5_monitoring_logs')
      .select('*')
      .eq('challenge_id', challenge_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({
      success: true,
      data: logs || [],
      total: logs?.length || 0
    });

  } catch (error) {
    console.error('Error fetching monitoring logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
