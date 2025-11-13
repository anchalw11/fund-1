import { useState, useEffect } from 'react';
import { Trophy, Award, Medal, Star, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function BadgeLeaderboard() {
  const [badges, setBadges] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<string>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/badges/leaderboard`);
      const result = await response.json();

      if (result.success) {
        setBadges(result.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const badgeInfo = {
    speed_demon_3day: { name: 'Speed Demon', icon: Zap, tier: 'premium', color: 'from-yellow-500 to-orange-500', desc: 'Passed in under 3 days' },
    fast_passer_30day: { name: 'Fast Passer', icon: Star, tier: 'good', color: 'from-blue-500 to-purple-500', desc: 'Passed in under 30 days' },
    payout_starter: { name: 'Payout Starter', icon: Medal, tier: 'normal', color: 'from-gray-400 to-gray-600', desc: '$100-$1,000 payout' },
    payout_achiever: { name: 'Payout Achiever', icon: Award, tier: 'good', color: 'from-blue-500 to-cyan-500', desc: '$1,000-$5,000 payout' },
    payout_master: { name: 'Payout Master', icon: Trophy, tier: 'really-good', color: 'from-purple-500 to-pink-500', desc: '$5,000-$10,000 payout' },
    payout_legend: { name: 'Payout Legend', icon: Trophy, tier: 'premium', color: 'from-yellow-400 to-red-500', desc: 'Above $10,000 payout' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <Trophy className="inline-block w-12 h-12 mr-3 text-yellow-400" />
            Badge Leaderboard
          </h1>
          <p className="text-xl text-gray-300">
            Celebrate trading excellence and achievements
          </p>
        </div>

        {/* Badge Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          <button
            onClick={() => setSelectedBadge('all')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              selectedBadge === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            All Badges
          </button>
          {Object.entries(badgeInfo).map(([key, info]) => {
            const Icon = info.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedBadge(key)}
                className={`px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2 ${
                  selectedBadge === key
                    ? `bg-gradient-to-r ${info.color} text-white`
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                {info.name}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-blue-500"></div>
          </div>
        ) : Object.keys(badges).length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
            <Trophy className="w-20 h-20 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Badges Yet</h3>
            <p className="text-gray-400">Be the first to earn a badge and appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(badgeInfo)
              .filter(([key]) => selectedBadge === 'all' || selectedBadge === key)
              .map(([badgeType, info]) => {
                const badgeHolders = badges[badgeType] || [];
                if (badgeHolders.length === 0 && selectedBadge !== 'all') return null;

                const Icon = info.icon;

                return (
                  <div key={badgeType} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
                    <div className={`bg-gradient-to-r ${info.color} p-6`}>
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-white/20 rounded-full">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-white">{info.name}</h2>
                          <p className="text-white/80">{info.desc}</p>
                          <span className="inline-block mt-2 px-3 py-1 bg-black/30 rounded-full text-sm text-white font-semibold uppercase">
                            {info.tier} Badge
                          </span>
                        </div>
                        <div className="ml-auto text-right">
                          <div className="text-4xl font-bold text-white">{badgeHolders.length}</div>
                          <div className="text-white/80">Badge Holders</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {badgeHolders.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No one has earned this badge yet. Be the first!</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {badgeHolders.slice(0, 12).map((holder: any, index: number) => (
                            <div
                              key={holder.id}
                              className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${info.color} flex items-center justify-center text-white font-bold text-lg`}>
                                    {index + 1}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-semibold truncate">
                                    {holder.user_profile?.full_name || holder.user_profile?.user_friendly_id || 'Anonymous Trader'}
                                  </p>
                                  <p className="text-gray-400 text-sm">
                                    {new Date(holder.earned_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <Icon className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {badgeHolders.length > 12 && (
                        <div className="text-center mt-6">
                          <p className="text-gray-400">
                            +{badgeHolders.length - 12} more badge holders
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* How to Earn Section */}
        <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">How to Earn Badges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <h4 className="text-white font-bold mb-2">Speed Challenges</h4>
              <p className="text-gray-400 text-sm">Complete challenges faster to earn speed badges</p>
            </div>
            <div className="text-center">
              <Trophy className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <h4 className="text-white font-bold mb-2">Payout Milestones</h4>
              <p className="text-gray-400 text-sm">Request payouts to unlock achievement badges</p>
            </div>
            <div className="text-center">
              <Star className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h4 className="text-white font-bold mb-2">Consistent Performance</h4>
              <p className="text-gray-400 text-sm">Maintain discipline to earn performance badges</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
