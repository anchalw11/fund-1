export type PayoutCycle = 'BI_MONTHLY' | 'MONTHLY' | 'BI_WEEKLY' | 'WEEKLY';

export interface PayoutCycleInfo {
  cycle: PayoutCycle;
  label: string;
  profitSplit: number;
  frequency: string;
  description: string;
}

export const PAYOUT_CYCLES: PayoutCycleInfo[] = [
  {
    cycle: 'BI_MONTHLY',
    label: 'Bi-Monthly',
    profitSplit: 100,
    frequency: 'Every 2 months',
    description: 'Best value - 100% profit split'
  },
  {
    cycle: 'MONTHLY',
    label: 'Monthly',
    profitSplit: 95,
    frequency: 'Every month',
    description: '95% profit split'
  },
  {
    cycle: 'BI_WEEKLY',
    label: 'Bi-Weekly',
    profitSplit: 85,
    frequency: 'Every 2 weeks',
    description: '85% profit split'
  },
  {
    cycle: 'WEEKLY',
    label: 'Weekly',
    profitSplit: 75,
    frequency: 'Every week',
    description: '75% profit split'
  }
];

export interface AccountSize {
  size: number;
  pricing: {
    standard: number;
    rapid: number;
    scaling: number;
    professional: number;
    swing: number;
    master: number;
  };
  profitSplit: {
    standard: number;
    rapid: number;
    scaling: number;
    professional: number;
    swing: number;
    master: number;
  };
  maxLotSize: number;
  features: string[];
}

export const ACCOUNT_SIZES: AccountSize[] = [
  {
    size: 5000,
    pricing: {
      standard: 20,
      rapid: 99,
      scaling: 39,
      professional: 10,
      swing: 30,
      master: 149
    },
    profitSplit: {
      standard: 80,
      rapid: 85,
      scaling: 90,
      professional: 90,
      swing: 85,
      master: 85
    },
    maxLotSize: 0.5,
    features: [
      'Perfect for beginners',
      'Lower entry cost',
      'Learn the process'
    ]
  },
  {
    size: 10000,
    pricing: {
      standard: 79,
      rapid: 149,
      scaling: 49,
      professional: 25,
      swing: 55,
      master: 199
    },
    profitSplit: {
      standard: 80,
      rapid: 85,
      scaling: 90,
      professional: 90,
      swing: 85,
      master: 85
    },
    maxLotSize: 1.0,
    features: [
      'Most popular choice',
      'Best value for money',
      'Ideal starting point'
    ]
  },
  {
    size: 25000,
    pricing: {
      standard: 129,
      rapid: 249,
      scaling: 99,
      professional: 499,
      swing: 85,
      master: 329
    },
    profitSplit: {
      standard: 85,
      rapid: 90,
      scaling: 95,
      professional: 95,
      swing: 90,
      master: 90
    },
    maxLotSize: 2.5,
    features: [
      'Experienced traders',
      'Higher profit split',
      'Serious capital'
    ]
  },
  {
    size: 50000,
    pricing: {
      standard: 125,
      rapid: 83,
      scaling: 149,
      professional: 80,
      swing: 155,
      master: 549
    },
    profitSplit: {
      standard: 85,
      rapid: 90,
      scaling: 95,
      professional: 95,
      swing: 90,
      master: 90
    },
    maxLotSize: 5.0,
    features: [
      'Professional level',
      'Premium profit split',
      'Priority support'
    ]
  },
  {
    size: 100000,
    pricing: {
      standard: 225,
      rapid: 149,
      scaling: 249,
      professional: 150,
      swing: 315,
      master: 899
    },
    profitSplit: {
      standard: 90,
      rapid: 90,
      scaling: 95,
      professional: 95,
      swing: 90,
      master: 95
    },
    maxLotSize: 10.0,
    features: [
      'Elite traders only',
      '90% profit split',
      'VIP support',
      'Dedicated account manager'
    ]
  },
  {
    size: 200000,
    pricing: {
      standard: 599,
      rapid: 1199,
      scaling: 449,
      professional: 2199,
      swing: 2499,
      master: 1499
    },
    profitSplit: {
      standard: 90,
      rapid: 90,
      scaling: 95,
      professional: 95,
      swing: 90,
      master: 95
    },
    maxLotSize: 20.0,
    features: [
      'Maximum capital',
      '90-95% profit split',
      'Weekly payouts',
      'Executive support',
      'Private Telegram group'
    ]
  }
];

export interface ChallengeType {
  id: string;
  name: string;
  displayName: string;
  tagline: string;
  description: string;

  phases: number;
  phase1Target: number;
  phase2Target: number | null;
  maxDrawdown: number;
  dailyLoss: number;
  minTradingDays: number;
  timeLimit: number | null;

  consistencyScoreRequired: number;
  consistencyRule?: string;
  payoutInfo?: string;
  minSharpeRatio: number;
  minProfitFactor: number;
  minRiskRewardRatio: number;
  optimalWinRateMin: number;
  optimalWinRateMax: number;
  maxTradesPerDay: number;
  maxPositionSizeJump: number;
  requiresStopLoss: boolean;
  minStopLossPips: number;
  maxStopLossPips: number;

  features: string[];
  badge?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional' | 'Expert';
  recommended: boolean;
  comingSoon?: boolean;
}

export const CHALLENGE_TYPES: ChallengeType[] = [
  {
    id: 'standard',
    name: 'Classic Challenge',
    displayName: 'Classic',
    tagline: 'Most Popular - Classic 2-Phase',
    description: 'Our classic evaluation process with 40% consistency rule. Pass two phases and get funded. Perfect for most traders.',

    phases: 2,
    phase1Target: 8,
    phase2Target: 5,
    maxDrawdown: 6,
    dailyLoss: 3,
    minTradingDays: 5,
    timeLimit: null,

    consistencyScoreRequired: 7.5,
    consistencyRule: '40% Rule: No single winning day can contribute more than 40% of your total profit. This ensures consistent trading performance rather than relying on lucky days.',
    payoutInfo: 'Payouts processed 14 days after your first trade',
    minSharpeRatio: 1.2,
    minProfitFactor: 1.5,
    minRiskRewardRatio: 1.8,
    optimalWinRateMin: 45,
    optimalWinRateMax: 65,
    maxTradesPerDay: 10,
    maxPositionSizeJump: 30,
    requiresStopLoss: true,
    minStopLossPips: 10,
    maxStopLossPips: 200,

    features: [
      '8% → 5% profit targets',
      'No time pressure',
      'Free Phase 2',
      '40% consistency rule',
      'Payout after 14 days'
    ],
    badge: 'MOST POPULAR',
    difficulty: 'Intermediate',
    recommended: true
  },
  {
    id: 'rapid',
    name: 'Rapid Fire Challenge',
    displayName: 'Rapid Fire',
    tagline: 'Get Funded in 10 Days',
    description: 'Fast-track to funding with 40% consistency rule. One phase, 10 days. For experienced traders who want quick results.',

    phases: 1,
    phase1Target: 10,
    phase2Target: null,
    maxDrawdown: 6,
    dailyLoss: 3,
    minTradingDays: 5,
    timeLimit: 10,

    consistencyScoreRequired: 8.0,
    consistencyRule: '40% Rule: No single winning day can contribute more than 40% of your total profit. This ensures consistent trading performance rather than relying on lucky days.',
    payoutInfo: 'First payout: On-demand | Subsequent payouts: Every 14 days',
    minSharpeRatio: 1.5,
    minProfitFactor: 2.0,
    minRiskRewardRatio: 2.0,
    optimalWinRateMin: 50,
    optimalWinRateMax: 65,
    maxTradesPerDay: 8,
    maxPositionSizeJump: 25,
    requiresStopLoss: true,
    minStopLossPips: 15,
    maxStopLossPips: 150,

    features: [
      '10% single target',
      '10-day time limit',
      'Skip Phase 2',
      '40% consistency rule',
      'On-demand first payout'
    ],
    badge: 'FAST TRACK',
    difficulty: 'Advanced',
    recommended: false
  },
  {
    id: 'scaling',
    name: 'Scaling Challenge',
    displayName: 'Scaling',
    tagline: 'Start Small, Scale to $2M',
    description: 'Lower targets with 40% consistency rule. Prove consistency to scale up. Grow from $10K to $2M over time.',

    phases: 2,
    phase1Target: 6,
    phase2Target: 6,
    maxDrawdown: 6,
    dailyLoss: 3,
    minTradingDays: 5,
    timeLimit: null,

    consistencyScoreRequired: 8.0,
    consistencyRule: '40% Rule: No single winning day can contribute more than 40% of your total profit. This ensures consistent trading performance rather than relying on lucky days.',
    payoutInfo: 'Flexible payout schedule with highest profit splits',
    minSharpeRatio: 1.4,
    minProfitFactor: 1.8,
    minRiskRewardRatio: 1.8,
    optimalWinRateMin: 45,
    optimalWinRateMax: 65,
    maxTradesPerDay: 12,
    maxPositionSizeJump: 20,
    requiresStopLoss: true,
    minStopLossPips: 10,
    maxStopLossPips: 200,

    features: [
      '6% → 6% profit targets',
      'Lowest entry cost',
      '40% consistency rule',
      'Scale to $2M',
      '90-95% profit split'
    ],
    badge: 'BEST VALUE',
    difficulty: 'Intermediate',
    recommended: false
  },
  {
    id: 'professional',
    name: 'Pay As You Go Challenge',
    displayName: 'Pay As You Go',
    tagline: 'Affordable Entry - Pay Per Phase',
    description: 'Pay separately for each phase with 40% consistency rule. Perfect for budget-conscious traders. ONE-TIME payout only.',

    phases: 2,
    phase1Target: 8,
    phase2Target: 5,
    maxDrawdown: 6,
    dailyLoss: 3,
    minTradingDays: 5,
    timeLimit: null,

    consistencyScoreRequired: 7.5,
    consistencyRule: '40% Rule: No single winning day can contribute more than 40% of your total profit. This ensures consistent trading performance rather than relying on lucky days.',
    payoutInfo: 'ONE-TIME PAYOUT ONLY: You can request one single payout to receive all accumulated profits. No recurring payouts available with this challenge type.',
    minSharpeRatio: 1.3,
    minProfitFactor: 1.8,
    minRiskRewardRatio: 2.0,
    optimalWinRateMin: 45,
    optimalWinRateMax: 70,
    maxTradesPerDay: 15,
    maxPositionSizeJump: 35,
    requiresStopLoss: true,
    minStopLossPips: 15,
    maxStopLossPips: 250,

    features: [
      'Pay per phase',
      'Lower upfront cost',
      '40% consistency rule',
      'One-time payout only',
      '90-95% profit split'
    ],
    badge: 'BEST VALUE',
    difficulty: 'Intermediate',
    recommended: false
  },
  {
    id: 'swing',
    name: 'Aggressive Challenge',
    displayName: 'Aggressive',
    tagline: 'No Consistency Rule - 21 Days',
    description: 'Aggressive 2-phase challenge with NO consistency rule. Trade however you want! Complete within 21 days.',

    phases: 2,
    phase1Target: 15,
    phase2Target: 10,
    maxDrawdown: 10,
    dailyLoss: 5,
    minTradingDays: 10,
    timeLimit: 21,

    consistencyScoreRequired: 0,
    consistencyRule: undefined,
    payoutInfo: 'Flexible payout schedule after passing evaluation',
    minSharpeRatio: 1.0,
    minProfitFactor: 2.0,
    minRiskRewardRatio: 2.5,
    optimalWinRateMin: 40,
    optimalWinRateMax: 60,
    maxTradesPerDay: 20,
    maxPositionSizeJump: 30,
    requiresStopLoss: true,
    minStopLossPips: 30,
    maxStopLossPips: 500,

    features: [
      'NO consistency rule',
      '21-day time limit',
      '15% → 10% targets',
      'Trade your way',
      'Maximum flexibility'
    ],
    badge: 'NO LIMITS',
    difficulty: 'Advanced',
    recommended: false
  },
  {
    id: 'master',
    name: 'Fund8r Master Challenge',
    displayName: 'Fund8r Master',
    tagline: '7 Unique Rules - NO Consistency Score',
    description: 'Revolutionary 2-phase system with 7 unique strict rules that replace traditional consistency requirements. Test your skills against momentum decay, sector rotation, recovery limits, and more.',

    phases: 2,
    phase1Target: 10,
    phase2Target: 5,
    maxDrawdown: 12,
    dailyLoss: 6,
    minTradingDays: 5,
    timeLimit: 30,

    consistencyScoreRequired: 0,
    consistencyRule: undefined,
    payoutInfo: 'Flexible payout schedule with premium splits',
    minSharpeRatio: 0,
    minProfitFactor: 0,
    minRiskRewardRatio: 0,
    optimalWinRateMin: 0,
    optimalWinRateMax: 100,
    maxTradesPerDay: 20,
    maxPositionSizeJump: 100,
    requiresStopLoss: false,
    minStopLossPips: 0,
    maxStopLossPips: 1000,

    features: [
      'NO Consistency Score!',
      '7 Unique Strict Rules',
      'Momentum decay tracking',
      'Sector rotation required',
      'Time-weighted profits',
      'Market cap diversity',
      'Completely transparent'
    ],
    badge: 'RECOMMENDED',
    difficulty: 'Expert',
    recommended: true
  },
  {
    id: 'elite',
    name: 'Elite Challenge',
    displayName: 'Elite',
    tagline: 'COMING SOON',
    description: 'Premium institutional-level challenge for elite traders. High capital, exclusive features, and premium support.',

    phases: 2,
    phase1Target: 10,
    phase2Target: 5,
    maxDrawdown: 8,
    dailyLoss: 4,
    minTradingDays: 5,
    timeLimit: null,

    consistencyScoreRequired: 8.0,
    consistencyRule: '40% Rule: No single winning day can contribute more than 40% of your total profit. This ensures consistent trading performance rather than relying on lucky days.',
    payoutInfo: 'Premium payout terms available upon launch',
    minSharpeRatio: 1.5,
    minProfitFactor: 2.0,
    minRiskRewardRatio: 2.0,
    optimalWinRateMin: 50,
    optimalWinRateMax: 70,
    maxTradesPerDay: 10,
    maxPositionSizeJump: 30,
    requiresStopLoss: true,
    minStopLossPips: 15,
    maxStopLossPips: 250,

    features: [
      'COMING SOON',
      'Elite institutional capital',
      'Premium support',
      'Exclusive features',
      'Higher capital limits'
    ],
    badge: 'COMING SOON',
    difficulty: 'Expert',
    recommended: false,
    comingSoon: true
  }
];

export function getPricing(accountSize: number, challengeType: string): number {
  const account = ACCOUNT_SIZES.find(a => a.size === accountSize);
  if (!account) return 0;

  return account.pricing[challengeType as keyof typeof account.pricing] || 0;
}

export function getProfitSplit(accountSize: number, challengeType: string): number {
  const account = ACCOUNT_SIZES.find(a => a.size === accountSize);
  if (!account) return 80;

  return account.profitSplit[challengeType as keyof typeof account.profitSplit] || 80;
}

export function getProfitSplitForCycle(cycle: PayoutCycle): number {
  const cycleInfo = PAYOUT_CYCLES.find(c => c.cycle === cycle);
  return cycleInfo?.profitSplit || 100;
}

export function getPayoutCycleInfo(cycle: PayoutCycle): PayoutCycleInfo | undefined {
  return PAYOUT_CYCLES.find(c => c.cycle === cycle);
}
