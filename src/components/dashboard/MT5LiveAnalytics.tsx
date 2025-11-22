import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, DollarSign, BarChart3, Clock, Target } from 'lucide-react';
import AnimatedCounter from '../ui/AnimatedCounter';

interface MT5Analytics {
  current_balance: number;
  current_equity: number;
  initial_balance: number;
  total_profit_loss: number;
  total_profit_loss_percent: number;
  daily_profit_loss: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  profit_factor: number;
  max_drawdown: number;
  challenge_status: string;
  rule_violations_count: number;
  trading_days_completed: number;
  profit_target_progress: number;
}

interface LiveSnapshot {
  balance: number;
  equity: number;
  profit_loss: number;
  profit_loss_percent: number;
  open_positions: number;
  total_trades: number;
  snapshot_date: string;
}

interface RuleViolation {
  id: string;
  rule_type: string;
  rule_name: string;
  severity: string;
  current_value: number;
  limit_value: number;
  violation_message: string;
  detected_at: string;
}

interface Props {
  challengeId: string;
  userId: string;
}

export default function MT5LiveAnalytics({ challengeId, userId }: Props) {
  const [analytics, setAnalytics] = useState<MT5Analytics | null>(null);
  const [snapshot, setSnapshot] = useState<LiveSnapshot | null>(null);
  const [violations, setViolations] = useState<RuleViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, [challengeId]);

  const loadAnalytics = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const [analyticsRes, snapshotRes, violationsRes] = await Promise.all([
        fetch(`${apiUrl}/analytics/challenge-analytics/${challengeId}`),
        fetch(`${apiUrl}/analytics/live-snapshot/${challengeId}`),
        fetch(`${apiUrl}/analytics/rule-violations/${challengeId}`)
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        if (analyticsData.success) {
          setAnalytics(analyticsData.data.analytics);
        }
      }

      if (snapshotRes.ok) {
        const snapshotData = await snapshotRes.json();
        if (snapshotData.success) {
          setSnapshot(snapshotData.data);
        }
      }

      if (violationsRes.ok) {
        const violationsData = await violationsRes.json();
        if (violationsData.success) {
          setViolations(violationsData.data.filter((v: RuleViolation) =>
            v.severity === 'critical' || v.severity === 'breach'
          ));
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading live analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-orange-500" />
        <p className="mt-4 text-gray-400">{error || 'No analytics data available'}</p>
      </div>
    );
  }

  const profitColor = analytics.total_profit_loss >= 0 ? 'text-neon-green' : 'text-red-500';
  const profitIcon = analytics.total_profit_loss >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-6">
      {violations.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-500 mb-2">Active Rule Violations</h3>
              <div className="space-y-2">
                {violations.map(violation => (
                  <div key={violation.id} className="bg-black/30 rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white">{violation.rule_name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        violation.severity === 'critical'
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-orange-500/20 text-orange-500'
                      }`}>
                        {violation.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{violation.violation_message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Detected: {new Date(violation.detected_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Current Balance</span>
            <DollarSign className="h-5 w-5 text-electric-blue" />
          </div>
          <div className="text-2xl font-bold text-white">
            $<AnimatedCounter value={analytics.current_balance} decimals={2} />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Initial: ${analytics.initial_balance.toLocaleString()}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Equity</span>
            <Activity className="h-5 w-5 text-cyber-purple" />
          </div>
          <div className="text-2xl font-bold text-white">
            $<AnimatedCounter value={analytics.current_equity} decimals={2} />
          </div>
          {snapshot && (
            <div className="text-xs text-gray-500 mt-1">
              Open Positions: {snapshot.open_positions}
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total P&L</span>
            {profitIcon({ className: `h-5 w-5 ${profitColor}` })}
          </div>
          <div className={`text-2xl font-bold ${profitColor}`}>
            {analytics.total_profit_loss >= 0 ? '+' : ''}
            $<AnimatedCounter value={analytics.total_profit_loss} decimals={2} />
          </div>
          <div className={`text-xs mt-1 font-semibold ${profitColor}`}>
            {analytics.total_profit_loss_percent >= 0 ? '+' : ''}
            {analytics.total_profit_loss_percent.toFixed(2)}%
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Win Rate</span>
            <BarChart3 className="h-5 w-5 text-neon-green" />
          </div>
          <div className="text-2xl font-bold text-white">
            <AnimatedCounter value={analytics.win_rate} decimals={1} />%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {analytics.winning_trades}W / {analytics.losing_trades}L
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-semibold">Trading Statistics</span>
            <BarChart3 className="h-5 w-5 text-electric-blue" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Total Trades</span>
              <span className="text-white font-semibold">{analytics.total_trades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Profit Factor</span>
              <span className="text-white font-semibold">{analytics.profit_factor.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Max Drawdown</span>
              <span className="text-red-500 font-semibold">{analytics.max_drawdown.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-semibold">Challenge Progress</span>
            <Target className="h-5 w-5 text-neon-green" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                analytics.challenge_status === 'in_progress'
                  ? 'bg-electric-blue/20 text-electric-blue'
                  : analytics.challenge_status === 'passed'
                  ? 'bg-neon-green/20 text-neon-green'
                  : 'bg-red-500/20 text-red-500'
              }`}>
                {analytics.challenge_status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Trading Days</span>
              <span className="text-white font-semibold">{analytics.trading_days_completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Target Progress</span>
              <span className="text-neon-green font-semibold">{analytics.profit_target_progress.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm font-semibold">Risk Management</span>
            <CheckCircle className="h-5 w-5 text-neon-green" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Violations</span>
              <span className={`font-semibold ${
                analytics.rule_violations_count > 0 ? 'text-red-500' : 'text-neon-green'
              }`}>
                {analytics.rule_violations_count}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Daily Loss Used</span>
              <span className="text-white font-semibold">N/A</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Last Update</span>
              <span className="text-gray-400 text-xs">
                {snapshot ? new Date(snapshot.snapshot_date).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {snapshot && (
        <div className="bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                Live data updated: {new Date(snapshot.snapshot_date).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-neon-green animate-pulse"></div>
              <span className="text-xs text-neon-green font-semibold">LIVE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
