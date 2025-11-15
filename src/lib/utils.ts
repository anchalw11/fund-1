import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const cardData = [
  {
    id: 1,
    title: "Phase 1 Evaluation",
    description: "Demonstrate profitability and risk management. Profit Target: 8% | Max Drawdown: 6% | Daily Loss Limit: 3% | Min Trading Days: 5",
    color: "rgba(0, 102, 255, 0.8)" // electric-blue
  },
  {
    id: 2,
    title: "Phase 2 Verification",
    description: "Confirm consistency - 100% FREE. Profit Target: 5% | Max Drawdown: 6% | Daily Loss Limit: 3% | Min Trading Days: 5",
    color: "rgba(123, 46, 254, 0.8)" // cyber-purple
  },
  {
    id: 3,
    title: "Funded Account Rules",
    description: "Trade with flexibility. No Profit Target | Max Drawdown: 8% | Profit Split: 75-100% based on payout cycle",
    color: "rgba(0, 255, 136, 0.8)" // neon-green
  },
  {
    id: 4,
    title: "What's Allowed",
    description: "Full trading flexibility: Scalping • News trading • EAs • Overnights • Hedging • All indicators • No restrictions on strategies",
    color: "rgba(0, 102, 255, 0.6)" // electric-blue variant
  }
];

export const tradingRulesTestimonials = [
  {
    id: 1,
    initials: 'P1',
    name: 'PHASE 1 EVALUATION',
    role: 'DEMONSTRATE PROFITABILITY AND RISK MANAGEMENT',
    quote: "🌟 PROFIT TARGET: 8%\n\n🏛️ MAX DRAWDOWN: 6%\n\n⏳ DAILY LOSS LIMIT: 3%\n\n📅 MIN TRADING DAYS: 5\n\n✅ NO TIME LIMITS",
    tags: [{ text: 'SKILL TEST', type: 'featured' as const }, { text: 'Phase 1', type: 'default' as const }],
    stats: [{ icon: '🎯', text: '8% Target' }, { icon: '🛡️', text: '6% Max DD' }],
    avatarGradient: 'linear-gradient(135deg, #0066FF, #7B2EFF)',
  },
  {
    id: 2,
    initials: 'P2',
    name: 'PHASE 2 VERIFICATION',
    role: '100% FREE',
    quote: "🛡️ PROFIT TARGET: 5%\n\n🏛️ MAX DRAWDOWN: 6%\n\n⏳ DAILY LOSS LIMIT: 3%\n\n📅 MIN TRADING DAYS: 5\n\n💯 100% FREE PHASE",
    tags: [{ text: 'NO COST', type: 'featured' as const }, { text: 'Phase 2', type: 'default' as const }],
    stats: [{ icon: '💯', text: 'Free' }, { icon: '✅', text: '5% Target' }],
    avatarGradient: 'linear-gradient(135deg, #7B2EFF, #00FF88)',
  },
  {
    id: 3,
    initials: 'FUNDED',
    name: 'FUNDED ACCOUNT',
    role: 'TRADE WITH OUR CAPITAL',
    quote: "⭕ PROFIT TARGET: NONE\n\n🏛️ MAX DRAWDOWN: 8%\n\n⏳ DAILY LOSS LIMIT: 3%\n\n📅 MIN TRADING DAYS: NONE\n\n💰 PROFIT SPLIT BY FREQUENCY:\nBi-Monthly: 100% | Monthly: 95%\nBi-weekly: 85% | Weekly: 75%",
    tags: [{ text: 'REAL MONEY', type: 'featured' as const }, { text: 'Live Trading', type: 'default' as const }],
    stats: [{ icon: '💰', text: '75-100% Split' }, { icon: '📈', text: 'No Target' }],
    avatarGradient: 'linear-gradient(135deg, #00FF88, #FFD93D)',
  },
  {
    id: 4,
    initials: 'ALLOWED',
    name: 'WHATS ALLOWED',
    role: 'TRADING FREEDOM',
    quote: "✅ Scalping (any timeframe)\n✅ News trading\n✅ Expert Advisors (EAs)\n✅ Automated bots\n✅ Overnight positions\n✅ Weekend holds\n✅ Hedging strategies\n✅ Grid Trading\n✅ All indicators\n✅ Copy trading",
    tags: [{ text: 'COMPLETE FREEDOM', type: 'featured' as const }, { text: 'ALL STRATEGIES', type: 'default' as const }],
    stats: [{ icon: '🔓', text: 'Allowed' }, { icon: '✅', text: '10 Strategies' }],
    avatarGradient: 'linear-gradient(135deg, #FFD93D, #7B2EFF)',
  },
  {
    id: 5,
    initials: 'NOT',
    name: 'NOT ALLOWED',
    role: 'RESTRICTED ACTIVITIES',
    quote: "❌ Tick scalping (sub-1-second trades)\n❌ Reverse arbitrage\n❌ Hedging with external accounts\n❌ Account sharing\n\nThese activities violate our trading integrity standards.",
    tags: [{ text: 'RESTRICTED', type: 'featured' as const }, { text: 'INTEGRITY', type: 'default' as const }],
    stats: [{ icon: '🚫', text: '4 Restrictions' }, { icon: '⚖️', text: 'Fair Trading' }],
    avatarGradient: 'linear-gradient(135deg, #FF4444, #CC0000)',
  }
];
