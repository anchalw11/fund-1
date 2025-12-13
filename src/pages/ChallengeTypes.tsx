import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Trophy, CreditCard, Flame, TrendingUp, Crown, CheckCircle, X, ArrowRight, DollarSign } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GradientText from '../components/ui/GradientText';
import { supabase } from '../lib/db';

interface ChallengeType {
  id: string;
  challenge_code: string;
  challenge_name: string;
  description: string;
  is_active: boolean;
  recommended: boolean;
}

interface PricingTier {
  id: string;
  account_size: number;
  regular_price: number;
  discount_price: number;
  platform_cost: number;
  phase_1_price?: number;
  phase_2_price?: number;
  profit_target_pct?: number;
  profit_target_amount?: number;
  phase_1_target_pct?: number;
  phase_2_target_pct?: number;
  phase_1_target_amount?: number;
  phase_2_target_amount?: number;
  daily_dd_pct: number;
  max_dd_pct: number;
  min_trading_days: number;
  time_limit_days?: number;
}

const iconMap: Record<string, any> = {
  MINI_FREE: Trophy,
  RAPID_FIRE: Zap,
  CLASSIC_2STEP: Trophy,
  PAYG_2STEP: CreditCard,
  AGGRESSIVE_2STEP: Flame,
  SWING_PRO: TrendingUp,
  ELITE_ROYAL: Crown,
  COMPETITION: Trophy,
  REGULAR: Trophy
};

const colorMap: Record<string, { border: string; bg: string; accent: string }> = {
  MINI_FREE: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', accent: 'text-yellow-400' },
  RAPID_FIRE: { border: 'border-orange-500/50', bg: 'bg-orange-500/10', accent: 'text-orange-400' },
  CLASSIC_2STEP: { border: 'border-blue-500/50', bg: 'bg-blue-500/10', accent: 'text-blue-400' },
  PAYG_2STEP: { border: 'border-green-500/50', bg: 'bg-green-500/10', accent: 'text-green-400' },
  AGGRESSIVE_2STEP: { border: 'border-red-500/50', bg: 'bg-red-500/10', accent: 'text-red-400' },
  SWING_PRO: { border: 'border-teal-500/50', bg: 'bg-teal-500/10', accent: 'text-teal-400' },
  ELITE_ROYAL: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', accent: 'text-yellow-400' },
  COMPETITION: { border: 'border-purple-500/50', bg: 'bg-purple-500/10', accent: 'text-purple-400' },
  REGULAR: { border: 'border-slate-500/50', bg: 'bg-slate-500/10', accent: 'text-slate-400' }
};

export default function ChallengeTypes() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<ChallengeType[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeType | null>(null);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        // Use fallback data
        setChallenges(getFallbackChallenges());
        setLoading(false);
        return;
      }

      const { data: challengeData, error: challengeError } = await supabase
        .from('challenge_types')
        .select('*')
        .eq('is_active', true)
        .order('recommended', { ascending: false });

      if (challengeError) {
        console.error('Error fetching challenges:', challengeError);
        // Use fallback data on error
        setChallenges(getFallbackChallenges());
      } else if (challengeData && challengeData.length > 0) {
        // Filter out SCALING and REGULAR challenges
        const filteredChallenges = challengeData.filter(
          challenge => challenge.challenge_code !== 'SCALING' && challenge.challenge_code !== 'REGULAR'
        );
        setChallenges(filteredChallenges);
      } else {
        // Use fallback data if no data returned
        setChallenges(getFallbackChallenges());
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      // Use fallback data on exception
      setChallenges(getFallbackChallenges());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackPricingTiers = (challengeCode: string): any[] => {
    const accountSizes = challengeCode === 'ELITE_ROYAL' 
      ? [300000, 500000, 1000000, 2000000]
      : [5000, 10000, 25000, 50000, 100000, 200000];
    
    return accountSizes.map(size => ({
      id: `fallback-${size}`,
      account_size: size,
      regular_price: 0,
      discount_price: 0,
      platform_cost: 0,
      daily_dd_pct: 5,
      max_dd_pct: 10,
      min_trading_days: 4,
      time_limit_days: 60
    }));
  };

  const getFallbackChallenges = (): ChallengeType[] => [
    {
      id: '0',
      challenge_code: 'MINI_FREE',
      challenge_name: 'Free Mini Challenge',
      description: '$3,000 virtual capital • 7 days • $200 profit target • 100% FREE',
      is_active: true,
      recommended: false
    },
    {
      id: '1',
      challenge_code: 'CLASSIC_2STEP',
      challenge_name: 'Classic 2-Step',
      description: 'Traditional 2-phase evaluation with balanced rules',
      is_active: true,
      recommended: true
    },
    {
      id: '2',
      challenge_code: 'RAPID_FIRE',
      challenge_name: 'Rapid Fire',
      description: 'Fast-paced 1-step challenge for quick profit targets',
      is_active: true,
      recommended: false
    },
    {
      id: '3',
      challenge_code: 'PAYG_2STEP',
      challenge_name: 'Pay-to-Go 2-Step',
      description: 'Pay for each phase separately as you progress',
      is_active: true,
      recommended: false
    },
    {
      id: '4',
      challenge_code: 'AGGRESSIVE_2STEP',
      challenge_name: 'Aggressive 2-Step',
      description: 'Higher profit targets with more aggressive rules',
      is_active: true,
      recommended: false
    },
    {
      id: '5',
      challenge_code: 'SWING_PRO',
      challenge_name: 'Swing Pro',
      description: 'Designed for swing traders with longer time frames',
      is_active: true,
      recommended: false
    },
    {
      id: '6',
      challenge_code: 'ELITE_ROYAL',
      challenge_name: 'Elite Royal',
      description: 'Premium challenge with best profit split and conditions',
      is_active: true,
      recommended: false
    },
    {
      id: '7',
      challenge_code: 'COMPETITION',
      challenge_name: 'Trading Competition',
      description: 'Enter the trading competition with a chance to win prizes',
      is_active: true,
      recommended: false
    }
  ].filter(challenge => challenge.challenge_code !== 'SCALING' && challenge.challenge_code !== 'REGULAR');

  const handleChallengeClick = async (challenge: ChallengeType) => {
    // Handle FREE mini challenge - direct to dashboard or signup
    if (challenge.challenge_code === 'MINI_FREE') {
      navigate('/payment', {
        state: {
          accountSize: 3000,
          challengeType: 'MINI_FREE',
          regularPrice: 0,
          discountPrice: 0,
          originalPrice: 0,
          isPayAsYouGo: false
        }
      });
      return;
    }

    setSelectedChallenge(challenge);
    setSelectedTier(null);

    let pricingData: any[] = [];
    
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        pricingData = getFallbackPricingTiers(challenge.challenge_code);
      } else {
        const { data, error: pricingError } = await supabase
          .from('challenge_pricing')
          .select('*')
          .eq('challenge_type_id', challenge.id)
          .order('account_size', { ascending: true });

        if (pricingError) {
          console.error('Error fetching pricing:', pricingError);
        }
        
        pricingData = data || [];
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }

    // Use fallback data if database returns empty
    if (pricingData.length === 0) {
      pricingData = getFallbackPricingTiers(challenge.challenge_code);
    }

    if (pricingData) {
      // Remove duplicates by account_size
      const uniquePricing = pricingData.reduce((acc: PricingTier[], current) => {
        const exists = acc.find(item => item.account_size === current.account_size);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Filter tiers based on challenge type
      let filteredPricing = uniquePricing;
      if (challenge.challenge_code === 'ELITE_ROYAL') {
        // Elite Royal only shows 300K to 2M accounts
        filteredPricing = uniquePricing.filter(tier =>
          tier.account_size >= 300000 && tier.account_size <= 2000000
        );
      } else if (challenge.challenge_code === 'COMPETITION') {
        // Competition only shows $100,000 account at $9.99
        filteredPricing = uniquePricing.filter(tier => tier.account_size === 100000);
      }

      // Update pricing for all challenges
      const updatedPricing = filteredPricing.map(tier => {
        // Define pricing for each challenge type
        const pricingByChallenge: { [key: string]: any } = {
          'CLASSIC_2STEP': {
            5000: 20,
            10000: 79,
            25000: 129,
            50000: 125,
            100000: 225,
            200000: 599
          },
          'RAPID_FIRE': {
            5000: 99,
            10000: 149,
            25000: 249,
            50000: 83,
            100000: 149,
            200000: 1199
          },
          'PAYG_2STEP': {
            5000: { phase1: 10, phase2: 8 },
            10000: { phase1: 25, phase2: 10 },
            25000: { phase1: 499, phase2: 250 },
            50000: { phase1: 80, phase2: 40 },
            100000: { phase1: 150, phase2: 100 },
            200000: { phase1: 2199, phase2: 1200 }
          },
          'AGGRESSIVE_2STEP': {
            5000: 30,
            10000: 55,
            25000: 85,
            50000: 155,
            100000: 315,
            200000: 2499
          },
          'SWING_PRO': {
            5000: 18,
            10000: 36,
            25000: 86,
            50000: 169,
            100000: 338,
            200000: 676
          },
          'ELITE_ROYAL': {
            300000: 0,
            500000: 0,
            1000000: 0,
            2000000: 0
          },
          'COMPETITION': {
            100000: 9.99
          }
        };
        
        const challengePricing = pricingByChallenge[challenge.challenge_code];
        
        if (challenge.challenge_code === 'PAYG_2STEP') {
          if (challengePricing && challengePricing[tier.account_size]) {
            const prices = challengePricing[tier.account_size];
            return {
              ...tier,
              phase_1_price: prices.phase1,
              phase_2_price: prices.phase2,
              discount_price: prices.phase1, // for purchase button
              regular_price: prices.phase1 * 2,
            };
          }
        } else if (challengePricing && challengePricing[tier.account_size]) {
          const price = challengePricing[tier.account_size];
          return {
            ...tier,
            discount_price: price,
            regular_price: price * 2
          };
        }
        
        return tier;
      });

      setPricingTiers(updatedPricing);
    }
  };

  const handlePurchase = async (tier: PricingTier) => {
    const isPayAsYouGo = selectedChallenge?.challenge_code === 'PAYG_2STEP';
    const navState = {
      returnTo: '/payment',
      accountSize: tier.account_size,
      challengeType: selectedChallenge?.challenge_code,
      regularPrice: tier.regular_price,
      discountPrice: tier.discount_price,
      originalPrice: tier.discount_price, // Keep for backward compatibility
      isPayAsYouGo: isPayAsYouGo,
      phase2Price: isPayAsYouGo ? tier.phase_2_price : undefined
    };

    navigate('/signup', { state: navState });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="text-2xl">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space">
      <Navbar />

      <div className="pt-40 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Choose Your <GradientText>Challenge Type</GradientText>
            </h1>
            <p className="text-xl text-gray-400">
              {challenges.length} unique challenges designed for different trading styles. Find your perfect match.
            </p>
          </div>

          {/* FREE Mini Challenge Card - Special Highlight */}
          <div className="mb-12">
            <div
              className="glass-card p-8 transition-all border-4 border-gray-500 bg-gray-500/10 relative group max-w-4xl mx-auto"
            >
              <div className="absolute top-4 right-4 bg-gray-500 text-white text-sm font-bold px-4 py-2 rounded-full">
                COMING SOON
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 filter grayscale">
                <div className="bg-gradient-to-br from-gray-500 to-gray-600 w-32 h-32 rounded-3xl flex items-center justify-center shadow-lg">
                  <Trophy className="text-white" size={64} />
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-4xl font-bold mb-3 text-gray-400">🏆 Free Mini Challenge</h3>
                  <p className="text-xl text-white mb-4">
                    Experience our platform risk-free! Zero cost to get started.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-3 border border-gray-500/30">
                      <div className="text-sm text-gray-400">Capital</div>
                      <div className="text-xl font-bold text-gray-400">$3,000</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-gray-500/30">
                      <div className="text-sm text-gray-400">Time</div>
                      <div className="text-xl font-bold text-gray-400">7 Days</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-gray-500/30">
                      <div className="text-sm text-gray-400">Target</div>
                      <div className="text-xl font-bold text-gray-400">6.67%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-gray-500/30">
                      <div className="text-sm text-gray-400">Cost</div>
                      <div className="text-xl font-bold text-green-400">FREE</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-3 border border-gray-500/30">
                      <div className="text-sm text-gray-400">Max Drawdown</div>
                      <div className="text-xl font-bold text-gray-400">5%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-gray-500/30">
                      <div className="text-sm text-gray-400">Daily Drawdown</div>
                      <div className="text-xl font-bold text-gray-400">3%</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-gray-500/30">
                      <div className="text-sm text-gray-400">Max daily gain</div>
                      <div className="text-xl font-bold text-gray-400">2%</div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-gray-500/30 mb-6">
                    <div className="text-sm text-gray-400">Per trade risk</div>
                    <div className="text-xl font-bold text-gray-400">0.5%</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-gray-500/30 mb-6">
                    <div className="text-sm text-gray-400">Stop loss</div>
                    <div className="text-xl font-bold text-gray-400">Can't move stop loss when it's about to hit</div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                    <h4 className="text-lg font-bold text-gray-300 mb-2">Profit Share Rule</h4>
                    <p className="text-gray-400 mb-1">Make a profit above $200 to be eligible for a reward.</p>
                    <p className="text-white font-semibold mb-2">You will receive 15% of any profit amount exceeding $200.</p>
                    <p className="text-xs text-gray-500">
                      <strong>Example:</strong> With an initial capital of $3,000, if you make a profit of $250, the profit exceeding the threshold is $50. You will receive 15% of $50, which is $7.50.
                    </p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4 text-center">
                    <p className="text-lg text-yellow-400">We are facing a very high demand. We will get back soon with this feature.</p>
                  </div>

                  <button disabled className="w-full py-4 bg-gray-600 text-white rounded-lg font-bold text-lg cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg">
                    <span>Start FREE Challenge Now</span>
                    <ArrowRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Other Challenge Types */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center mb-8">
              <GradientText>Premium Challenge Types</GradientText>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {challenges.filter(c => c.challenge_code !== 'MINI_FREE').map((challenge) => {
              const Icon = iconMap[challenge.challenge_code] || Trophy;
              const colors = colorMap[challenge.challenge_code] || { border: 'border-gray-500/50', bg: 'bg-gray-500/10', accent: 'text-gray-400' };

              return (
                <div
                  key={challenge.id}
                  onClick={() => handleChallengeClick(challenge)}
                  className={`glass-card p-8 cursor-pointer transition-all hover:scale-105 ${colors.border} hover:shadow-xl relative group`}
                >
                  {challenge.recommended && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                      RECOMMENDED
                    </div>
                  )}

                  <div className={`${colors.bg} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={colors.accent} size={40} />
                  </div>

                  <h3 className="text-2xl font-bold mb-3">{challenge.challenge_name}</h3>
                  <p className="text-gray-400 mb-6">{challenge.description}</p>

                  <button className={`w-full py-3 ${colors.bg} ${colors.accent} rounded-lg font-semibold hover:bg-opacity-80 transition-all flex items-center justify-center space-x-2`}>
                    <span>View Details</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Comparison Table */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">
              <GradientText>Compare All Challenges</GradientText>
            </h2>
            <div className="glass-card p-6 overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 font-bold text-lg">Feature</th>
                    <th className="text-center py-4 px-4">
                      <div className="flex flex-col items-center">
                        <Zap className="text-orange-400 mb-2" size={24} />
                        <span className="font-bold text-orange-400">Rapid Fire</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-4">
                      <div className="flex flex-col items-center">
                        <Trophy className="text-blue-400 mb-2" size={24} />
                        <span className="font-bold text-blue-400">Classic 2-Step</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-4">
                      <div className="flex flex-col items-center">
                        <CreditCard className="text-green-400 mb-2" size={24} />
                        <span className="font-bold text-green-400">Pay-As-You-Go</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-4">
                      <div className="flex flex-col items-center">
                        <Flame className="text-red-400 mb-2" size={24} />
                        <span className="font-bold text-red-400">Aggressive</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-4">
                      <div className="flex flex-col items-center">
                        <TrendingUp className="text-purple-400 mb-2" size={24} />
                        <span className="font-bold text-purple-400">Swing Pro</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-4">
                      <div className="flex flex-col items-center">
                        <Crown className="text-yellow-400 mb-2" size={24} />
                        <span className="font-bold text-yellow-400">Elite Royal</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold">Starting Price</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-400 font-bold">$14</span>
                      <div className="text-xs text-gray-500">(5k account)</div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-400 font-bold">$19</span>
                      <div className="text-xs text-gray-500">(5k account)</div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-400 font-bold">$12</span>
                      <div className="text-xs text-gray-500">(Phase 1 only)</div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-400 font-bold">$16</span>
                      <div className="text-xs text-gray-500">(5k account)</div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-400 font-bold">$18</span>
                      <div className="text-xs text-gray-500">(5k account)</div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-400 font-bold">$1699</span>
                      <div className="text-xs text-gray-500">(300k account)</div>
                    </td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold">Phases</td>
                    <td className="text-center py-4 px-4">1 Phase</td>
                    <td className="text-center py-4 px-4">2 Phases</td>
                    <td className="text-center py-4 px-4">2 Phases</td>
                    <td className="text-center py-4 px-4">2 Phases</td>
                    <td className="text-center py-4 px-4">2 Phases</td>
                    <td className="text-center py-4 px-4">1 Phase</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold">Profit Target</td>
                    <td className="text-center py-4 px-4">10%</td>
                    <td className="text-center py-4 px-4">8% → 5%</td>
                    <td className="text-center py-4 px-4">8% → 5%</td>
                    <td className="text-center py-4 px-4">12% → 6%</td>
                    <td className="text-center py-4 px-4">6% → 4%</td>
                    <td className="text-center py-4 px-4">8%</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold">Max Drawdown</td>
                    <td className="text-center py-4 px-4">5%</td>
                    <td className="text-center py-4 px-4">6%</td>
                    <td className="text-center py-4 px-4">6%</td>
                    <td className="text-center py-4 px-4">8%</td>
                    <td className="text-center py-4 px-4">8%</td>
                    <td className="text-center py-4 px-4">10%</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold">Daily Loss Limit</td>
                    <td className="text-center py-4 px-4">3%</td>
                    <td className="text-center py-4 px-4">3%</td>
                    <td className="text-center py-4 px-4">3%</td>
                    <td className="text-center py-4 px-4">5%</td>
                    <td className="text-center py-4 px-4">4%</td>
                    <td className="text-center py-4 px-4">5%</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold">Time Limit</td>
                    <td className="text-center py-4 px-4">10 Days</td>
                    <td className="text-center py-4 px-4">Unlimited</td>
                    <td className="text-center py-4 px-4">Unlimited</td>
                    <td className="text-center py-4 px-4">30 Days</td>
                    <td className="text-center py-4 px-4">60 Days</td>
                    <td className="text-center py-4 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold">Min Trading Days</td>
                    <td className="text-center py-4 px-4">3 Days</td>
                    <td className="text-center py-4 px-4">5 Days</td>
                    <td className="text-center py-4 px-4">5 Days</td>
                    <td className="text-center py-4 px-4">4 Days</td>
                    <td className="text-center py-4 px-4">3 Days</td>
                    <td className="text-center py-4 px-4">5 Days</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold">Profit Split</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-400 font-bold">80%</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-400 font-bold">80%</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-400 font-bold">75%</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-400 font-bold">85%</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-400 font-bold">80%</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-green-400 font-bold">90%</span>
                    </td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold">Max Allocation</td>
                    <td className="text-center py-4 px-4">$400K</td>
                    <td className="text-center py-4 px-4">$600K</td>
                    <td className="text-center py-4 px-4">$400K</td>
                    <td className="text-center py-4 px-4">$300K</td>
                    <td className="text-center py-4 px-4">$500K</td>
                    <td className="text-center py-4 px-4">$1M</td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold">Consistency Rule</td>
                    <td className="text-center py-4 px-4">
                      <span className="text-yellow-400">✓ Required</span>
                      <div className="text-xs text-gray-500">Max 40% per day</div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-yellow-400">✓ Required</span>
                      <div className="text-xs text-gray-500">Max 40% per day</div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-yellow-400">✓ Required</span>
                      <div className="text-xs text-gray-500">Max 40% per day</div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-red-400">✗ Not Required</span>
                      <div className="text-xs text-gray-500">No limit</div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-yellow-400">✓ Required</span>
                      <div className="text-xs text-gray-500">Max 40% per day</div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-red-400">✗ Not Required</span>
                      <div className="text-xs text-gray-500">No limit</div>
                    </td>
                  </tr>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold">Payment Structure</td>
                    <td className="text-center py-4 px-4">One-time</td>
                    <td className="text-center py-4 px-4">One-time</td>
                    <td className="text-center py-4 px-4">Phase by Phase</td>
                    <td className="text-center py-4 px-4">One-time</td>
                    <td className="text-center py-4 px-4">One-time</td>
                    <td className="text-center py-4 px-4">One-time</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold">Best For</td>
                    <td className="text-center py-4 px-4 text-sm text-gray-400">Quick traders</td>
                    <td className="text-center py-4 px-4 text-sm text-gray-400">Balanced approach</td>
                    <td className="text-center py-4 px-4 text-sm text-gray-400">Lower entry cost</td>
                    <td className="text-center py-4 px-4 text-sm text-gray-400">Risk takers</td>
                    <td className="text-center py-4 px-4 text-sm text-gray-400">Position traders</td>
                    <td className="text-center py-4 px-4 text-sm text-gray-400">Premium conditions</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedChallenge && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto pt-32">
          <div className="glass-card max-w-6xl w-full my-8 relative">
            <button
              onClick={() => setSelectedChallenge(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <div className="flex items-center space-x-4 mb-8">
                {(() => {
                  const Icon = iconMap[selectedChallenge.challenge_code] || Trophy;
                  const colors = colorMap[selectedChallenge.challenge_code] || { border: 'border-gray-500/50', bg: 'bg-gray-500/10', accent: 'text-gray-400' };
                  return (
                    <>
                      <div className={`${colors.bg} w-16 h-16 rounded-xl flex items-center justify-center`}>
                        <Icon className={colors.accent} size={32} />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold">{selectedChallenge.challenge_name}</h2>
                        <p className="text-gray-400">{selectedChallenge.description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">Select Account Size</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pricingTiers.map((tier) => (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier)}
                      className={`glass-card p-6 cursor-pointer transition-all hover:scale-105 ${
                        selectedTier?.id === tier.id ? 'border-2 border-electric-blue' : ''
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">
                          ${tier.account_size.toLocaleString()}
                        </div>

                        {selectedChallenge.challenge_code === 'PAYG_2STEP' ? (
                          <div className="space-y-1">
                            <div className="text-sm text-gray-400">Phase 1: <span className="text-lg font-bold text-green-400">${tier.phase_1_price}</span></div>
                            <div className="text-sm text-gray-400">Phase 2: <span className="text-lg font-bold text-green-400">${tier.phase_2_price}</span></div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-3xl font-bold text-neon-green mb-1">
                              ${tier.discount_price}
                            </div>
                            <div className="text-sm text-gray-500 line-through">
                              ${tier.regular_price}
                            </div>
                            <div className="text-xs text-green-400 font-bold">
                              50% OFF
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTier && (
                <div className="glass-card p-6 mb-6 bg-blue-500/10 border-blue-500/30">
                  <h4 className="text-xl font-bold mb-4">Challenge Details</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-400" size={20} />
                      <span>
                        Account Size: <strong>${selectedTier.account_size.toLocaleString()}</strong>
                      </span>
                    </div>

                    {selectedTier.phase_1_target_pct && (
                      <>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="text-green-400" size={20} />
                          <span>
                            Phase 1: {selectedTier.phase_1_target_pct}% (${selectedTier.phase_1_target_amount?.toLocaleString()})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="text-green-400" size={20} />
                          <span>
                            Phase 2: {selectedTier.phase_2_target_pct}% (${selectedTier.phase_2_target_amount?.toLocaleString()})
                          </span>
                        </div>
                      </>
                    )}

                    {selectedTier.profit_target_pct && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="text-green-400" size={20} />
                        <span>
                          Profit Target: {selectedTier.profit_target_pct}% (${selectedTier.profit_target_amount?.toLocaleString()})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-400" size={20} />
                      <span>Daily DD: {selectedTier.daily_dd_pct}%</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-400" size={20} />
                      <span>Max DD: {selectedTier.max_dd_pct}%</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-400" size={20} />
                      <span>Min Trading Days: {selectedTier.min_trading_days}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-400" size={20} />
                      <span>
                        Time Limit: {selectedTier.time_limit_days ? `${selectedTier.time_limit_days} days` : 'Unlimited'}
                      </span>
                    </div>
                  </div>

                  {selectedChallenge.challenge_code === 'ELITE_ROYAL' ? (
                    <div className="w-full mt-6 py-4 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-xl text-xl font-bold flex items-center justify-center space-x-3">
                      <span className="text-yellow-400">COMING SOON</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePurchase(selectedTier)}
                      className="w-full mt-6 py-4 btn-gradient text-xl font-bold flex items-center justify-center space-x-3 group"
                    >
                      <DollarSign size={24} />
                      <span>Purchase Challenge - ${selectedTier.discount_price}</span>
                      <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              )}

              <div className="glass-card p-6 bg-yellow-500/10 border-yellow-500/30">
                <h4 className="text-xl font-bold mb-3 flex items-center space-x-2">
                  <Trophy className="text-yellow-400" size={24} />
                  <span>Challenge Rules & Payouts</span>
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span>{selectedChallenge.challenge_code === 'AGGRESSIVE_2STEP' ? '21-day time limit' : 'Unlimited trading time (where applicable)'}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span>Trade all major forex pairs, commodities, indices, and crypto</span>
                  </li>
                  {selectedChallenge.challenge_code === 'AGGRESSIVE_2STEP' ? (
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                      <span className="font-semibold text-green-400">NO consistency rule - Trade however you want!</span>
                    </li>
                  ) : (
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="text-yellow-400 mt-0.5 flex-shrink-0" size={20} />
                      <div>
                        <span className="font-semibold text-yellow-400">40% Consistency Rule:</span>
                        <p className="text-sm text-gray-300 mt-1">No single winning day can contribute more than 40% of your total profit. This ensures consistent trading performance rather than relying on lucky days.</p>
                      </div>
                    </li>
                  )}
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <div>
                      <span className="font-semibold">Payout Terms:</span>
                      <p className="text-sm text-gray-300 mt-1">
                        {selectedChallenge.challenge_code === 'CLASSIC_2STEP' && '14 days after your first trade'}
                        {selectedChallenge.challenge_code === 'RAPID_FIRE' && 'First payout on-demand, then every 14 days'}
                        {selectedChallenge.challenge_code === 'PAYG_2STEP' && 'ONE-TIME payout only - receive all profits in a single withdrawal'}
                        {selectedChallenge.challenge_code === 'AGGRESSIVE_2STEP' && 'Flexible payout schedule after passing'}
                        {selectedChallenge.challenge_code === 'ELITE_ROYAL' && 'Premium payout terms available upon launch'}
                        {!['CLASSIC_2STEP', 'RAPID_FIRE', 'PAYG_2STEP', 'AGGRESSIVE_2STEP', 'ELITE_ROYAL'].includes(selectedChallenge.challenge_code) && 'Flexible payout schedule'}
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span>Keep 75-95% of profits based on account size</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span>Real-time trading dashboard with analytics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
