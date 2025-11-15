/*
  # MT5 Real-Time Monitoring System

  ## Overview
  Complete MT5 monitoring infrastructure for prop trading firm with real-time data tracking,
  rule breach detection, and comprehensive analytics.

  ## New Tables

  ### 1. mt5_account_snapshots
  - Stores real-time snapshots of MT5 account state
  - Tracks balance, equity, margin, P&L, and open positions
  - Updated every time monitoring runs (real-time data)
  - Linked to user_challenges and mt5_accounts

  ### 2. mt5_trades
  - Complete trade history from MT5 accounts
  - Tracks entry/exit prices, volumes, symbols, P&L
  - Used for detailed analytics and performance tracking
  - Linked to challenges for profit target calculations

  ### 3. mt5_rule_violations
  - Automatic rule breach detection logs
  - Tracks daily loss limits, max drawdown, trading days
  - Severity levels (warning, breach, critical)
  - Triggers notifications and account status changes

  ### 4. mt5_monitoring_logs
  - System monitoring activity logs
  - Connection status, errors, data sync timestamps
  - Used for debugging and system health monitoring

  ### 5. mt5_analytics_cache
  - Pre-calculated analytics for fast dashboard loading
  - Win rate, profit factor, average trade metrics
  - Updated after each monitoring cycle
  - Optimizes user dashboard performance

  ## Security
  - RLS enabled on all tables
  - Users can only view their own data
  - Admins have full access via service role
  - MT5 passwords are encrypted in mt5_accounts table

  ## Integration Points
  - Edge Function: Real-time data fetching from MT5 servers
  - Admin Dashboard: Manual credential assignment triggers monitoring
  - User Dashboard: Live analytics display
  - Notification System: Automatic alerts on rule breaches
*/

-- =====================================================
-- MT5 ACCOUNT SNAPSHOTS (Real-time account state)
-- =====================================================
CREATE TABLE IF NOT EXISTS mt5_account_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
  mt5_account_id uuid REFERENCES mt5_accounts(id) ON DELETE CASCADE,
  
  -- Account identifiers
  account_number text NOT NULL,
  server text NOT NULL,
  
  -- Real-time account metrics
  balance numeric NOT NULL,
  equity numeric NOT NULL,
  margin numeric,
  free_margin numeric,
  margin_level numeric,
  
  -- Performance metrics
  profit_loss numeric NOT NULL DEFAULT 0,
  profit_loss_percent numeric NOT NULL DEFAULT 0,
  daily_profit_loss numeric DEFAULT 0,
  daily_profit_loss_percent numeric DEFAULT 0,
  
  -- Trading statistics
  total_trades integer DEFAULT 0,
  open_positions integer DEFAULT 0,
  closed_trades integer DEFAULT 0,
  winning_trades integer DEFAULT 0,
  losing_trades integer DEFAULT 0,
  
  -- Risk metrics
  max_drawdown numeric DEFAULT 0,
  max_drawdown_percent numeric DEFAULT 0,
  current_drawdown numeric DEFAULT 0,
  current_drawdown_percent numeric DEFAULT 0,
  
  -- Snapshot metadata
  snapshot_date timestamptz NOT NULL DEFAULT now(),
  is_latest boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_mt5_snapshots_user ON mt5_account_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_mt5_snapshots_challenge ON mt5_account_snapshots(challenge_id);
CREATE INDEX IF NOT EXISTS idx_mt5_snapshots_account ON mt5_account_snapshots(account_number);
CREATE INDEX IF NOT EXISTS idx_mt5_snapshots_latest ON mt5_account_snapshots(is_latest) WHERE is_latest = true;
CREATE INDEX IF NOT EXISTS idx_mt5_snapshots_date ON mt5_account_snapshots(snapshot_date DESC);

-- =====================================================
-- MT5 TRADES (Complete trade history)
-- =====================================================
CREATE TABLE IF NOT EXISTS mt5_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
  mt5_account_id uuid REFERENCES mt5_accounts(id) ON DELETE CASCADE,
  
  -- Trade identifiers
  account_number text NOT NULL,
  ticket_number text NOT NULL,
  
  -- Trade details
  symbol text NOT NULL,
  trade_type text NOT NULL, -- 'BUY' or 'SELL'
  volume numeric NOT NULL,
  
  -- Price information
  open_price numeric NOT NULL,
  close_price numeric,
  stop_loss numeric,
  take_profit numeric,
  
  -- Timing
  open_time timestamptz NOT NULL,
  close_time timestamptz,
  
  -- Results
  profit_loss numeric,
  profit_loss_percent numeric,
  commission numeric DEFAULT 0,
  swap numeric DEFAULT 0,
  
  -- Trade status
  status text DEFAULT 'open', -- 'open', 'closed', 'pending'
  
  -- Trade metadata
  trade_duration interval,
  is_winning_trade boolean,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for trade queries
CREATE INDEX IF NOT EXISTS idx_mt5_trades_user ON mt5_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_mt5_trades_challenge ON mt5_trades(challenge_id);
CREATE INDEX IF NOT EXISTS idx_mt5_trades_account ON mt5_trades(account_number);
CREATE INDEX IF NOT EXISTS idx_mt5_trades_ticket ON mt5_trades(ticket_number);
CREATE INDEX IF NOT EXISTS idx_mt5_trades_status ON mt5_trades(status);
CREATE INDEX IF NOT EXISTS idx_mt5_trades_open_time ON mt5_trades(open_time DESC);

-- =====================================================
-- MT5 RULE VIOLATIONS (Breach detection)
-- =====================================================
CREATE TABLE IF NOT EXISTS mt5_rule_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
  mt5_account_id uuid REFERENCES mt5_accounts(id) ON DELETE CASCADE,
  
  -- Violation details
  rule_type text NOT NULL, -- 'daily_loss', 'max_drawdown', 'trading_days', 'profit_target'
  rule_name text NOT NULL,
  severity text NOT NULL, -- 'warning', 'breach', 'critical'
  
  -- Violation metrics
  current_value numeric NOT NULL,
  limit_value numeric NOT NULL,
  threshold_percent numeric,
  
  -- Description
  violation_message text NOT NULL,
  recommendation text,
  
  -- Status
  is_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  
  -- Notification tracking
  notification_sent boolean DEFAULT false,
  notification_sent_at timestamptz,
  
  -- Account action
  account_action text, -- 'warning_sent', 'account_suspended', 'challenge_failed'
  
  detected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Indexes for violation queries
CREATE INDEX IF NOT EXISTS idx_mt5_violations_user ON mt5_rule_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_mt5_violations_challenge ON mt5_rule_violations(challenge_id);
CREATE INDEX IF NOT EXISTS idx_mt5_violations_rule ON mt5_rule_violations(rule_type);
CREATE INDEX IF NOT EXISTS idx_mt5_violations_severity ON mt5_rule_violations(severity);
CREATE INDEX IF NOT EXISTS idx_mt5_violations_unresolved ON mt5_rule_violations(is_resolved) WHERE is_resolved = false;

-- =====================================================
-- MT5 MONITORING LOGS (System health tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS mt5_monitoring_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profile(user_id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES user_challenges(id) ON DELETE CASCADE,
  mt5_account_id uuid REFERENCES mt5_accounts(id) ON DELETE CASCADE,
  
  -- Log details
  log_type text NOT NULL, -- 'sync_start', 'sync_success', 'sync_error', 'connection_error'
  log_level text NOT NULL, -- 'info', 'warning', 'error', 'critical'
  message text NOT NULL,
  
  -- Error details
  error_code text,
  error_details jsonb,
  
  -- Monitoring metadata
  account_number text,
  server text,
  data_synced jsonb, -- What data was synced (trades, balance, etc.)
  
  -- Timing
  execution_time_ms integer,
  
  created_at timestamptz DEFAULT now()
);

-- Indexes for log queries
CREATE INDEX IF NOT EXISTS idx_mt5_logs_type ON mt5_monitoring_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_mt5_logs_level ON mt5_monitoring_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_mt5_logs_created ON mt5_monitoring_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mt5_logs_account ON mt5_monitoring_logs(account_number);

-- =====================================================
-- MT5 ANALYTICS CACHE (Pre-calculated metrics)
-- =====================================================
CREATE TABLE IF NOT EXISTS mt5_analytics_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profile(user_id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES user_challenges(id) ON DELETE CASCADE,
  
  -- Account metrics
  current_balance numeric NOT NULL,
  current_equity numeric NOT NULL,
  initial_balance numeric NOT NULL,
  
  -- Performance metrics
  total_profit_loss numeric NOT NULL DEFAULT 0,
  total_profit_loss_percent numeric NOT NULL DEFAULT 0,
  daily_profit_loss numeric DEFAULT 0,
  best_trade numeric DEFAULT 0,
  worst_trade numeric DEFAULT 0,
  
  -- Trading statistics
  total_trades integer DEFAULT 0,
  winning_trades integer DEFAULT 0,
  losing_trades integer DEFAULT 0,
  win_rate numeric DEFAULT 0,
  profit_factor numeric DEFAULT 0,
  average_win numeric DEFAULT 0,
  average_loss numeric DEFAULT 0,
  
  -- Risk metrics
  max_drawdown numeric DEFAULT 0,
  max_drawdown_percent numeric DEFAULT 0,
  sharpe_ratio numeric,
  
  -- Challenge progress
  trading_days_completed integer DEFAULT 0,
  profit_target_progress numeric DEFAULT 0,
  daily_loss_limit_used numeric DEFAULT 0,
  max_drawdown_limit_used numeric DEFAULT 0,
  
  -- Status
  challenge_status text, -- 'in_progress', 'passed', 'failed'
  rule_violations_count integer DEFAULT 0,
  
  -- Cache metadata
  last_updated timestamptz NOT NULL DEFAULT now(),
  is_valid boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_mt5_analytics_user ON mt5_analytics_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_mt5_analytics_challenge ON mt5_analytics_cache(challenge_id);
CREATE INDEX IF NOT EXISTS idx_mt5_analytics_status ON mt5_analytics_cache(challenge_status);
CREATE INDEX IF NOT EXISTS idx_mt5_analytics_updated ON mt5_analytics_cache(last_updated DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- MT5 Account Snapshots RLS
ALTER TABLE mt5_account_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own MT5 snapshots"
  ON mt5_account_snapshots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to MT5 snapshots"
  ON mt5_account_snapshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- MT5 Trades RLS
ALTER TABLE mt5_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own MT5 trades"
  ON mt5_trades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to MT5 trades"
  ON mt5_trades FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- MT5 Rule Violations RLS
ALTER TABLE mt5_rule_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rule violations"
  ON mt5_rule_violations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to rule violations"
  ON mt5_rule_violations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- MT5 Monitoring Logs RLS
ALTER TABLE mt5_monitoring_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own monitoring logs"
  ON mt5_monitoring_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to monitoring logs"
  ON mt5_monitoring_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- MT5 Analytics Cache RLS
ALTER TABLE mt5_analytics_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics cache"
  ON mt5_analytics_cache FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role has full access to analytics cache"
  ON mt5_analytics_cache FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- FUNCTIONS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to mark only the latest snapshot
CREATE OR REPLACE FUNCTION update_latest_snapshot()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark all previous snapshots for this challenge as not latest
  UPDATE mt5_account_snapshots
  SET is_latest = false
  WHERE challenge_id = NEW.challenge_id
    AND id != NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update latest snapshot
DROP TRIGGER IF EXISTS trigger_update_latest_snapshot ON mt5_account_snapshots;
CREATE TRIGGER trigger_update_latest_snapshot
  AFTER INSERT ON mt5_account_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_latest_snapshot();

-- Function to calculate trade duration
CREATE OR REPLACE FUNCTION calculate_trade_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.close_time IS NOT NULL AND NEW.open_time IS NOT NULL THEN
    NEW.trade_duration = NEW.close_time - NEW.open_time;
    
    -- Determine if winning trade
    IF NEW.profit_loss IS NOT NULL THEN
      NEW.is_winning_trade = NEW.profit_loss > 0;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate trade duration
DROP TRIGGER IF EXISTS trigger_calculate_trade_duration ON mt5_trades;
CREATE TRIGGER trigger_calculate_trade_duration
  BEFORE INSERT OR UPDATE ON mt5_trades
  FOR EACH ROW
  EXECUTE FUNCTION calculate_trade_duration();