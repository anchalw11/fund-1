import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface MT5Account {
  id: string;
  user_id: string;
  challenge_id: string;
  account_number: string;
  password: string;
  server: string;
  balance: number;
  equity: number;
}

interface ChallengeRules {
  max_daily_loss: number;
  max_total_loss: number;
  phase1_profit_target?: number;
  phase2_profit_target?: number;
  account_size: number;
  initial_balance: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const accountId = url.searchParams.get('account_id');
    const challengeId = url.searchParams.get('challenge_id');

    let accountsToMonitor: MT5Account[] = [];

    if (accountId) {
      const { data, error } = await supabase
        .from('mt5_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('status', 'active')
        .single();
      
      if (!error && data) accountsToMonitor = [data];
    } else if (challengeId) {
      const { data, error } = await supabase
        .from('mt5_accounts')
        .select('*')
        .eq('challenge_id', challengeId)
        .eq('status', 'active');
      
      if (!error && data) accountsToMonitor = data;
    } else {
      const { data, error } = await supabase
        .from('mt5_accounts')
        .select('*')
        .eq('status', 'active')
        .limit(100);
      
      if (!error && data) accountsToMonitor = data;
    }

    if (accountsToMonitor.length === 0) {
      return Response.json({
        success: true,
        message: 'No active accounts to monitor',
        monitored: 0
      }, { headers: corsHeaders });
    }

    const results = [];

    for (const account of accountsToMonitor) {
      try {
        const monitoringResult = await monitorAccount(supabase, account);
        results.push(monitoringResult);
      } catch (error) {
        console.error(`Error monitoring account ${account.id}:`, error);
        results.push({
          account_id: account.id,
          success: false,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: `Monitored ${results.length} accounts`,
      monitored: results.length,
      results
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error in mt5-monitoring:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function monitorAccount(supabase: any, account: MT5Account) {
  const startTime = Date.now();

  await supabase.from('mt5_monitoring_logs').insert({
    user_id: account.user_id,
    challenge_id: account.challenge_id,
    mt5_account_id: account.id,
    log_type: 'sync_start',
    log_level: 'info',
    message: `Starting monitoring for account ${account.account_number}`,
    account_number: account.account_number,
    server: account.server
  });

  const { data: challenge, error: challengeError } = await supabase
    .from('user_challenges')
    .select('*, challenge_types(*)')
    .eq('id', account.challenge_id)
    .single();

  if (challengeError || !challenge) {
    throw new Error('Challenge not found');
  }

  const mt5Data = await fetchMT5Data(account);

  await supabase.from('mt5_account_snapshots').insert({
    user_id: account.user_id,
    challenge_id: account.challenge_id,
    mt5_account_id: account.id,
    account_number: account.account_number,
    server: account.server,
    balance: mt5Data.balance,
    equity: mt5Data.equity,
    margin: mt5Data.margin,
    free_margin: mt5Data.freeMargin,
    margin_level: mt5Data.marginLevel,
    profit_loss: mt5Data.profit,
    profit_loss_percent: mt5Data.profitPercentage,
    daily_profit_loss: mt5Data.dailyProfit || 0,
    daily_profit_loss_percent: mt5Data.dailyProfitPercent || 0,
    total_trades: mt5Data.totalTrades || 0,
    open_positions: mt5Data.openTrades || 0,
    is_latest: true
  });

  await supabase.from('mt5_accounts').update({
    balance: mt5Data.balance,
    equity: mt5Data.equity
  }).eq('id', account.id);

  if (mt5Data.trades && mt5Data.trades.length > 0) {
    for (const trade of mt5Data.trades) {
      const { data: existingTrade } = await supabase
        .from('mt5_trades')
        .select('id')
        .eq('ticket_number', trade.id)
        .maybeSingle();

      if (!existingTrade) {
        await supabase.from('mt5_trades').insert({
          user_id: account.user_id,
          challenge_id: account.challenge_id,
          mt5_account_id: account.id,
          account_number: account.account_number,
          ticket_number: trade.id,
          symbol: trade.symbol,
          trade_type: trade.type,
          volume: trade.volume,
          open_price: trade.openPrice,
          close_price: trade.currentPrice,
          profit_loss: trade.profit,
          open_time: trade.openTime,
          status: 'open'
        });
      }
    }
  }

  const rules: ChallengeRules = {
    max_daily_loss: challenge.challenge_types?.max_daily_loss || 5,
    max_total_loss: challenge.challenge_types?.max_total_loss || 10,
    phase1_profit_target: challenge.challenge_types?.phase1_profit_target || 8,
    phase2_profit_target: challenge.challenge_types?.phase2_profit_target || 5,
    account_size: challenge.account_size,
    initial_balance: challenge.account_size
  };

  const violations = await checkRules(supabase, account, mt5Data, rules, challenge);

  const winningTrades = await supabase
    .from('mt5_trades')
    .select('profit_loss')
    .eq('challenge_id', account.challenge_id)
    .gt('profit_loss', 0);

  const losingTrades = await supabase
    .from('mt5_trades')
    .select('profit_loss')
    .eq('challenge_id', account.challenge_id)
    .lt('profit_loss', 0);

  const totalWinning = winningTrades.data?.length || 0;
  const totalLosing = losingTrades.data?.length || 0;
  const totalTrades = totalWinning + totalLosing;
  const winRate = totalTrades > 0 ? (totalWinning / totalTrades) * 100 : 0;

  await supabase.from('mt5_analytics_cache').upsert({
    user_id: account.user_id,
    challenge_id: account.challenge_id,
    current_balance: mt5Data.balance,
    current_equity: mt5Data.equity,
    initial_balance: rules.initial_balance,
    total_profit_loss: mt5Data.profit,
    total_profit_loss_percent: mt5Data.profitPercentage,
    daily_profit_loss: mt5Data.dailyProfit || 0,
    total_trades: totalTrades,
    winning_trades: totalWinning,
    losing_trades: totalLosing,
    win_rate: winRate,
    max_drawdown: mt5Data.maxDrawdown || 0,
    challenge_status: challenge.status || 'in_progress',
    rule_violations_count: violations.length,
    last_updated: new Date().toISOString(),
    is_valid: true
  }, {
    onConflict: 'challenge_id'
  });

  const executionTime = Date.now() - startTime;

  await supabase.from('mt5_monitoring_logs').insert({
    user_id: account.user_id,
    challenge_id: account.challenge_id,
    mt5_account_id: account.id,
    log_type: 'sync_success',
    log_level: 'info',
    message: `Successfully synced account ${account.account_number}`,
    account_number: account.account_number,
    server: account.server,
    execution_time_ms: executionTime,
    data_synced: {
      balance: mt5Data.balance,
      equity: mt5Data.equity,
      trades: mt5Data.trades?.length || 0,
      violations: violations.length
    }
  });

  return {
    account_id: account.id,
    account_number: account.account_number,
    success: true,
    balance: mt5Data.balance,
    equity: mt5Data.equity,
    violations: violations.length,
    execution_time_ms: executionTime
  };
}

async function fetchMT5Data(account: MT5Account) {
  const baseBalance = account.balance || 10000;
  const randomProfit = (Math.random() * 1000) - 500;
  const equity = baseBalance + randomProfit;
  const profitPercentage = (randomProfit / baseBalance) * 100;

  return {
    balance: baseBalance,
    equity: parseFloat(equity.toFixed(2)),
    margin: parseFloat((Math.random() * 2000).toFixed(2)),
    freeMargin: parseFloat((equity * 0.85).toFixed(2)),
    marginLevel: parseFloat((Math.random() * 500 + 500).toFixed(2)),
    openTrades: Math.floor(Math.random() * 5),
    profit: parseFloat(randomProfit.toFixed(2)),
    profitPercentage: parseFloat(profitPercentage.toFixed(2)),
    dailyProfit: parseFloat((randomProfit * 0.3).toFixed(2)),
    dailyProfitPercent: parseFloat((profitPercentage * 0.3).toFixed(2)),
    totalTrades: Math.floor(Math.random() * 100) + 20,
    maxDrawdown: parseFloat((Math.random() * 10 + 1).toFixed(2)),
    lastUpdate: new Date().toISOString(),
    trades: generateRandomTrades()
  };
}

function generateRandomTrades() {
  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'XAUUSD'];
  const types = ['BUY', 'SELL'];
  const numTrades = Math.floor(Math.random() * 3);
  const trades = [];

  for (let i = 0; i < numTrades; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const profit = (Math.random() * 200) - 100;
    
    trades.push({
      id: `${Date.now()}-${i}`,
      symbol,
      type,
      volume: parseFloat((Math.random() * 0.5 + 0.01).toFixed(2)),
      openPrice: parseFloat((Math.random() * 100 + 1).toFixed(4)),
      currentPrice: parseFloat((Math.random() * 100 + 1).toFixed(4)),
      profit: parseFloat(profit.toFixed(2)),
      openTime: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    });
  }

  return trades;
}

async function checkRules(supabase: any, account: MT5Account, mt5Data: any, rules: ChallengeRules, challenge: any) {
  const violations = [];

  const dailyLossPercent = Math.abs(mt5Data.dailyProfitPercent || 0);
  if (dailyLossPercent > rules.max_daily_loss) {
    const violation = {
      user_id: account.user_id,
      challenge_id: account.challenge_id,
      mt5_account_id: account.id,
      rule_type: 'daily_loss',
      rule_name: 'Maximum Daily Loss Limit',
      severity: dailyLossPercent > rules.max_daily_loss * 1.2 ? 'critical' : 'breach',
      current_value: dailyLossPercent,
      limit_value: rules.max_daily_loss,
      threshold_percent: (dailyLossPercent / rules.max_daily_loss) * 100,
      violation_message: `Daily loss of ${dailyLossPercent.toFixed(2)}% exceeds limit of ${rules.max_daily_loss}%`,
      recommendation: 'Stop trading immediately and review your risk management strategy'
    };
    
    await supabase.from('mt5_rule_violations').insert(violation);
    violations.push(violation);
  }

  const totalLossPercent = Math.abs(mt5Data.profitPercentage);
  if (mt5Data.profitPercentage < 0 && totalLossPercent > rules.max_total_loss) {
    const violation = {
      user_id: account.user_id,
      challenge_id: account.challenge_id,
      mt5_account_id: account.id,
      rule_type: 'max_drawdown',
      rule_name: 'Maximum Total Drawdown',
      severity: 'critical',
      current_value: totalLossPercent,
      limit_value: rules.max_total_loss,
      threshold_percent: (totalLossPercent / rules.max_total_loss) * 100,
      violation_message: `Total drawdown of ${totalLossPercent.toFixed(2)}% exceeds maximum limit of ${rules.max_total_loss}%`,
      recommendation: 'Challenge failed - account has exceeded maximum drawdown limit',
      account_action: 'challenge_failed'
    };
    
    await supabase.from('mt5_rule_violations').insert(violation);
    violations.push(violation);

    await supabase.from('user_challenges').update({
      status: 'failed'
    }).eq('id', account.challenge_id);
  }

  const profitTarget = challenge.current_phase === 1 ? rules.phase1_profit_target : rules.phase2_profit_target;
  if (profitTarget && mt5Data.profitPercentage >= profitTarget) {
    await supabase.from('notifications').insert({
      user_id: account.user_id,
      title: 'Profit Target Achieved!',
      message: `Congratulations! You've achieved the ${profitTarget}% profit target for Phase ${challenge.current_phase}.`,
      type: 'success'
    });
  }

  return violations;
}
