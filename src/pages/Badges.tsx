import { Trophy, Award, Medal, Star, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Badges() {
  const badges = [
    {
      id: 'speed_demon_3day',
      name: 'Speed Demon',
      icon: Zap,
      emoji: '⚡',
      color: 'from-yellow-500 to-orange-500',
      criteria: 'Pass your challenge in under 3 days',
      description: 'Lightning-fast traders who demonstrate exceptional skill',
      rarity: 'Ultra Rare'
    },
    {
      id: 'fast_passer_30day',
      name: 'Fast Passer',
      icon: Star,
      emoji: '⭐',
      color: 'from-blue-500 to-purple-500',
      criteria: 'Pass your challenge within 30 days',
      description: 'Efficient traders who reach their goals quickly',
      rarity: 'Rare'
    },
    {
      id: 'payout_starter',
      name: 'Payout Starter',
      icon: Medal,
      emoji: '🥉',
      color: 'from-gray-400 to-gray-600',
      criteria: 'Earn $100 - $1,000 in payouts',
      description: 'Beginning your journey to consistent profitability',
      rarity: 'Common'
    },
    {
      id: 'payout_achiever',
      name: 'Payout Achiever',
      icon: Award,
      emoji: '🥈',
      color: 'from-blue-500 to-cyan-500',
      criteria: 'Earn $1,000 - $5,000 in payouts',
      description: 'Proven track record of consistent earnings',
      rarity: 'Uncommon'
    },
    {
      id: 'payout_master',
      name: 'Payout Master',
      icon: Trophy,
      emoji: '🥇',
      color: 'from-purple-500 to-pink-500',
      criteria: 'Earn $5,000 - $10,000 in payouts',
      description: 'Elite traders with exceptional profit generation',
      rarity: 'Very Rare'
    },
    {
      id: 'payout_legend',
      name: 'Payout Legend',
      icon: Trophy,
      emoji: '👑',
      color: 'from-yellow-400 to-red-500',
      criteria: 'Earn over $10,000 in payouts',
      description: 'The pinnacle of trading excellence',
      rarity: 'Legendary'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Trophy className="w-12 h-12 text-yellow-400" />
            Achievement Badges
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Earn badges by reaching trading milestones. They appear next to your name throughout the platform.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-8 border border-blue-500/30 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">How to Earn Badges</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-white font-bold mb-2">Speed Challenges</h3>
              <p className="text-gray-400 text-sm">Pass challenges quickly</p>
            </div>
            <div>
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-white font-bold mb-2">Payout Milestones</h3>
              <p className="text-gray-400 text-sm">Accumulate payouts</p>
            </div>
            <div>
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-white font-bold mb-2">Consistency</h3>
              <p className="text-gray-400 text-sm">Maintain performance</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all hover:scale-105"
              >
                <div className="text-center mb-4">
                  <div className={`inline-block p-4 bg-gradient-to-r ${badge.color} rounded-full mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl mb-2">{badge.emoji}</div>
                  <h3 className="text-2xl font-bold text-white mb-1">{badge.name}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${badge.color} text-white`}>
                    {badge.rarity}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="text-xs text-gray-400 mb-1">HOW TO EARN</div>
                    <div className="text-sm text-white font-semibold">{badge.criteria}</div>
                  </div>
                  <p className="text-gray-400 text-sm text-center">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
